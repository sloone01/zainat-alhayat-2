import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Group } from '../entities/group.entity';
import { School } from '../entities/school.entity';
import { StudentPayment } from '../entities/student-payment.entity';
import { StudentPaymentDiscountLine } from '../entities/student-payment-discount-line.entity';
import { StudentPaymentInstallmentReceipt } from '../entities/student-payment-installment-receipt.entity';
import { LevelPaymentInstallment } from '../entities/level-payment-installment.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import { FeePackageLevelPeriodSetting } from '../entities/fee-package-level-period-setting.entity';
import { deriveInstallmentsFromPeriodSetting } from '../utils/fee-package-installment.util';
import { CoursePaymentProfile } from '../entities/course-payment-profile.entity';
import { LevelPaymentProfileDiscount } from '../entities/level-payment-profile-discount.entity';
import { PaymentDiscountType } from '../entities/payment-discount-type.entity';
import { Parent } from '../entities/parent.entity';
import {
  StudentPaymentLedgerService,
  type FeeChargeRow,
  type PaymentAllocationPreview,
  type PaymentTransactionSummary,
  type RecordPaymentDto,
} from './student-payment-ledger.service';

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function sumChargeLinesForPeriod(
  profile: LevelPaymentProfile,
  period: 'monthly' | 'semester' | 'yearly',
): number {
  const lines = profile.chargeLines ?? [];
  return lines
    .filter((l) => (l.billing_period ?? 'yearly') === period)
    .reduce((s, l) => s + Number(l.amount), 0);
}

function sumChargeLines(profile: LevelPaymentProfile): number {
  return sumChargeLinesForPeriod(profile, 'yearly');
}

function computeBaseTotal(profile: LevelPaymentProfile | null): number {
  if (!profile) return 0;
  const charges = sumChargeLines(profile);
  // Level fees are annual (per year) only; course-specific fees use `course_payment_profiles`.
  const year = Number(profile.year_total_amount ?? 0);
  const yearOk = !Number.isNaN(year) && year > 0;
  if (yearOk && charges > 0) {
    if (Math.abs(year - charges) <= 0.01) {
      return roundMoney(year);
    }
    return roundMoney(charges);
  }
  if (yearOk) {
    return roundMoney(year);
  }
  return roundMoney(charges);
}

/** Postgres undefined_table — e.g. migration not run yet */
function isUndefinedTableError(err: unknown): boolean {
  const e = err as { code?: string; driverError?: { code?: string } };
  return e?.code === '42P01' || e?.driverError?.code === '42P01';
}

export type StudentInstallmentScheduleRow = {
  installment_id: string;
  sequence: number;
  month_number: number | null;
  label: string | null;
  is_downpayment: boolean;
  scheduled_amount: string;
  paid: null | {
    receipt_id: string;
    amount: string;
    paid_at: string;
    remarks: string | null;
  };
};

export type StudentInstallmentSchedule = {
  rows: StudentInstallmentScheduleRow[];
  scheduled_total: number;
  paid_total: number;
  downpayment_total: number;
};

@Injectable()
export class StudentPaymentService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(StudentPayment)
    private readonly paymentRepo: Repository<StudentPayment>,
    @InjectRepository(StudentPaymentDiscountLine)
    private readonly discountLineRepo: Repository<StudentPaymentDiscountLine>,
    @InjectRepository(LevelPaymentProfile)
    private readonly profileRepo: Repository<LevelPaymentProfile>,
    @InjectRepository(LevelPaymentProfileDiscount)
    private readonly profileDiscountRepo: Repository<LevelPaymentProfileDiscount>,
    @InjectRepository(PaymentDiscountType)
    private readonly discountTypeRepo: Repository<PaymentDiscountType>,
    @InjectRepository(LevelPaymentInstallment)
    private readonly installmentRepo: Repository<LevelPaymentInstallment>,
    @InjectRepository(FeePackageLevelPeriodSetting)
    private readonly feePackagePeriodRepo: Repository<FeePackageLevelPeriodSetting>,
    @InjectRepository(StudentPaymentInstallmentReceipt)
    private readonly installmentReceiptRepo: Repository<StudentPaymentInstallmentReceipt>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(CoursePaymentProfile)
    private readonly courseProfileRepo: Repository<CoursePaymentProfile>,
    private readonly ledgerService: StudentPaymentLedgerService,
  ) {}

  /** Parent account (user_id) must be linked to the student via `student_parents`. */
  private async assertParentLinkedToStudent(user: User, studentId: string): Promise<void> {
    if (user.role !== 'parent') {
      throw new ForbiddenException('Only parents can access this student fee data');
    }
    const cnt = await this.parentRepo
      .createQueryBuilder('p')
      .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
      .where('p.user_id = :uid', { uid: user.id })
      .andWhere('sp.student_id = :sid', { sid: studentId })
      .getCount();
    if (cnt === 0) {
      throw new ForbiddenException('You may only view fees for children linked to your account');
    }
  }

  private assertAdmin(user: User): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage student payments');
    }
  }

  private assertSchool(user: User, schoolId: number): void {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only access your school');
    }
  }

  /** Prefer active groups; any group with a fee level wins over none. */
  private pickLevelIdFromGroups(groups: Group[] | undefined): string | null {
    if (!groups?.length) return null;
    const withLevel = groups.filter((g) => g.level_id);
    if (!withLevel.length) return null;
    const activeFirst = [...withLevel].sort((a, b) => {
      const aw = a.is_active === false ? 1 : 0;
      const bw = b.is_active === false ? 1 : 0;
      return aw - bw;
    });
    return activeFirst[0].level_id;
  }

  /** When ORM does not hydrate `student.groups`, read membership from `student_groups`. */
  private async resolveLevelIdFromStudentGroupsJoin(studentId: string): Promise<string | null> {
    const row = await this.studentRepo.manager
      .createQueryBuilder()
      .select('g.level_id', 'levelId')
      .from('student_groups', 'sg')
      .innerJoin('groups', 'g', 'g.id = sg.group_id AND g.level_id IS NOT NULL')
      .where('sg.student_id = :sid', { sid: studentId })
      .orderBy('CASE WHEN g.is_active = true THEN 0 ELSE 1 END', 'ASC')
      .addOrderBy('g.name', 'ASC')
      .limit(1)
      .getRawOne();
    return row?.levelId ?? null;
  }

  async listForSchool(user: User, schoolId: number): Promise<StudentPayment[]> {
    this.assertAdmin(user);
    this.assertSchool(user, schoolId);
    return this.paymentRepo.find({
      where: { school_id: schoolId },
      relations: ['student', 'level', 'discountLines', 'discountLines.discountType'],
      order: { updated_at: 'DESC' },
    });
  }

  async getOne(user: User, studentId: string, courseId?: string | null): Promise<StudentPayment> {
    if (user.role === 'admin') {
      this.assertAdmin(user);
    } else if (user.role === 'parent') {
      await this.assertParentLinkedToStudent(user, studentId);
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }
    const where =
      courseId != null && courseId !== ''
        ? { student_id: studentId, course_id: courseId }
        : { student_id: studentId, course_id: IsNull() };
    const row = await this.paymentRepo.findOne({
      where,
      relations: [
        'student',
        'level',
        'course',
        'discountLines',
        'discountLines.discountType',
        'school',
        'coursePaymentProfile',
      ],
    });
    if (!row) throw new NotFoundException('No payment record for this student yet');
    if (user.role === 'admin') {
      this.assertSchool(user, row.school_id);
    } else if (user.school_id != null && Number(row.school_id) !== Number(user.school_id)) {
      throw new ForbiddenException('You can only access your school');
    }
    return row;
  }

  async listByStudent(user: User, studentId: string): Promise<StudentPayment[]> {
    if (user.role === 'admin') {
      this.assertAdmin(user);
    } else if (user.role === 'parent') {
      await this.assertParentLinkedToStudent(user, studentId);
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }
    const st = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!st?.school_id) throw new NotFoundException('Student not found');
    if (user.role === 'admin') {
      this.assertSchool(user, st.school_id);
    } else if (user.school_id != null && Number(st.school_id) !== Number(user.school_id)) {
      throw new ForbiddenException('You can only access your school');
    }
    return this.paymentRepo.find({
      where: { student_id: studentId },
      relations: [
        'student',
        'level',
        'course',
        'discountLines',
        'discountLines.discountType',
        'coursePaymentProfile',
      ],
      order: { created_at: 'ASC' },
    });
  }

  async ensureForStudent(studentId: string): Promise<StudentPayment | null> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['groups', 'groups.level'],
    });
    if (!student?.school_id) return null;

    const fromMemory = this.pickLevelIdFromGroups(student.groups);
    const fromJoin = fromMemory ? null : await this.resolveLevelIdFromStudentGroupsJoin(studentId);
    const fromGroups = fromMemory ?? fromJoin;
    // Group → fee level is the primary link; fall back to explicit payment_level_id if no group level.
    const levelId = fromGroups ?? student.payment_level_id ?? null;
    if (fromGroups && student.payment_level_id !== fromGroups) {
      await this.studentRepo.update({ id: studentId }, { payment_level_id: fromGroups });
    }
    if (!levelId) {
      return null;
    }

    let profile = await this.profileRepo.findOne({
      where: { level_id: levelId, school_id: student.school_id },
      relations: ['chargeLines'],
    });

    if (!profile) {
      profile = await this.profileRepo.findOne({
        where: { level_id: levelId },
        relations: ['chargeLines'],
      });
    }

    const base = computeBaseTotal(profile);
    const currency = (profile?.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();

    let row = await this.paymentRepo.findOne({
      where: { student_id: studentId, course_id: IsNull() },
    });
    if (!row) {
      row = this.paymentRepo.create({
        student_id: studentId,
        school_id: student.school_id,
        level_id: levelId,
        level_payment_profile_id: profile?.id ?? null,
        course_id: null,
        course_payment_profile_id: null,
        base_total_amount: String(base.toFixed(2)),
        admin_adjusted_total: null,
        currency,
      });
    } else {
      row.level_id = levelId;
      row.level_payment_profile_id = profile?.id ?? null;
      row.base_total_amount = String(base.toFixed(2));
      row.currency = currency;
      // Ensure / refresh re-derives from the level profile; drop admin override so totals are not stuck (subtotal uses override when set).
      row.admin_adjusted_total = null;
    }
    const saved = await this.paymentRepo.save(row);
    if (!saved.course_id) {
      try {
        await this.ledgerService.syncFeeChargesForPayment(saved);
      } catch {
        /* ledger tables may not exist until migration */
      }
    }
    return saved;
  }

  async getFeeChargesForStudent(user: User, studentId: string): Promise<FeeChargeRow[]> {
    const p = await this.getOne(user, studentId, null);
    try {
      await this.ledgerService.syncFeeChargesForPayment(p);
      return this.ledgerService.listFeeCharges(p.id);
    } catch (err) {
      if (isUndefinedTableError(err)) return [];
      throw err;
    }
  }

  async previewPayment(
    user: User,
    studentId: string,
    dto: RecordPaymentDto,
  ): Promise<PaymentAllocationPreview> {
    const p = await this.getOne(user, studentId, null);
    return this.ledgerService.previewAllocation(p, dto);
  }

  async recordPaymentTransaction(
    user: User,
    studentId: string,
    dto: RecordPaymentDto,
  ): Promise<{ transaction: PaymentTransactionSummary; feeCharges: FeeChargeRow[] }> {
    const p = await this.getOne(user, studentId, null);
    return this.ledgerService.recordPayment(user, p, dto);
  }

  async listPaymentHistory(user: User, studentId: string): Promise<PaymentTransactionSummary[]> {
    const p = await this.getOne(user, studentId, null);
    return this.loadLedgerForPayment(p).then((x) => x.paymentHistory);
  }

  async loadLedgerForPayment(p: StudentPayment): Promise<{
    feeCharges: FeeChargeRow[];
    paymentHistory: PaymentTransactionSummary[];
  }> {
    if (p.course_id) {
      return { feeCharges: [], paymentHistory: [] };
    }
    try {
      await this.ledgerService.syncFeeChargesForPayment(p);
      const feeCharges = await this.ledgerService.listFeeCharges(p.id);
      const paymentHistory = await this.ledgerService.listTransactions(p.id);
      return { feeCharges, paymentHistory };
    } catch (err) {
      if (isUndefinedTableError(err)) {
        return { feeCharges: [], paymentHistory: [] };
      }
      throw err;
    }
  }

  effectiveSubtotal(p: StudentPayment): number {
    const base = Number(p.base_total_amount);
    const adj = p.admin_adjusted_total != null ? Number(p.admin_adjusted_total) : null;
    return adj != null && !Number.isNaN(adj) ? adj : base;
  }

  discountSum(p: StudentPayment): number {
    const lines = p.discountLines ?? [];
    return roundMoney(lines.reduce((s, d) => s + Number(d.amount), 0));
  }

  effectivePayable(p: StudentPayment): number {
    return roundMoney(Math.max(0, this.effectiveSubtotal(p) - this.discountSum(p)));
  }

  async updateAdminAdjustedTotal(
    user: User,
    studentId: string,
    value: number | null,
    courseId?: string | null,
  ): Promise<StudentPayment> {
    this.assertAdmin(user);
    const p = await this.getOne(user, studentId, courseId);
    const school = await this.schoolRepo.findOne({ where: { id: p.school_id } });
    if (!school?.payment_allow_admin_adjust_student_total) {
      throw new BadRequestException('Adjusting student payment totals is disabled for this school');
    }
    if (value != null && (Number.isNaN(Number(value)) || Number(value) < 0)) {
      throw new BadRequestException('Invalid amount');
    }
    p.admin_adjusted_total = value != null ? String(Number(value).toFixed(2)) : null;
    return this.paymentRepo.save(p);
  }

  /** Discount types allowed on this student payment: profile-linked set if non-empty, else all active school types. */
  private async resolveUsableDiscountTypeIds(p: StudentPayment): Promise<Set<string>> {
    if (p.level_payment_profile_id) {
      const links = await this.profileDiscountRepo.find({
        where: { profile_id: p.level_payment_profile_id },
      });
      if (links.length > 0) {
        return new Set(links.map((l) => l.discount_type_id));
      }
    }
    const types = await this.discountTypeRepo.find({
      where: { school_id: p.school_id, is_active: true },
      select: ['id'],
    });
    return new Set(types.map((t) => t.id));
  }

  async addDiscountLine(
    user: User,
    studentId: string,
    dto: { discount_type_id: string; amount: number; remarks: string },
    courseId?: string | null,
  ): Promise<StudentPaymentDiscountLine> {
    this.assertAdmin(user);
    const p = await this.getOne(user, studentId, courseId);
    const usable = await this.resolveUsableDiscountTypeIds(p);
    if (!usable.has(dto.discount_type_id)) {
      throw new BadRequestException(
        'This discount type is not available for this student (inactive, wrong school, or not included in the fee profile discount list)',
      );
    }
    const amt = Number(dto.amount);
    if (Number.isNaN(amt) || amt <= 0) {
      throw new BadRequestException('Discount amount must be positive');
    }
    const remarks = (dto.remarks ?? '').trim();
    if (remarks.length < 3) {
      throw new BadRequestException('Remarks are required (at least 3 characters)');
    }
    const sub = this.effectiveSubtotal(p);
    const currentDisc = this.discountSum(p);
    if (roundMoney(currentDisc + amt) > sub) {
      throw new BadRequestException('Total discounts cannot exceed the chargeable subtotal');
    }
    const line = this.discountLineRepo.create({
      student_payment_id: p.id,
      discount_type_id: dto.discount_type_id,
      amount: String(amt.toFixed(2)),
      remarks,
    });
    return this.discountLineRepo.save(line);
  }

  async removeDiscountLine(
    user: User,
    studentId: string,
    lineId: string,
    courseId?: string | null,
  ): Promise<void> {
    this.assertAdmin(user);
    const p = await this.getOne(user, studentId, courseId);
    const line = await this.discountLineRepo.findOne({
      where: { id: lineId, student_payment_id: p.id },
    });
    if (!line) throw new NotFoundException('Discount line not found');
    await this.discountLineRepo.remove(line);
  }

  async getAllowedDiscountTypeIdsForStudent(studentId: string, paymentId?: string): Promise<string[]> {
    const p = paymentId
      ? await this.paymentRepo.findOne({ where: { id: paymentId, student_id: studentId } })
      : await this.paymentRepo.findOne({ where: { student_id: studentId, course_id: IsNull() } });
    if (!p) return [];
    const usable = await this.resolveUsableDiscountTypeIds(p);
    return [...usable];
  }

  private async syncProfileInstallmentsFromFeePackage(
    profile: LevelPaymentProfile,
  ): Promise<LevelPaymentInstallment[]> {
    if (profile.year_payment_mode !== 'installments' && profile.year_payment_mode !== 'both') {
      return [];
    }
    if (!profile.fee_package_id || !profile.level_id) return [];

    const existing = await this.installmentRepo.find({
      where: { profile_id: profile.id },
      order: { sequence: 'ASC' },
    });
    if (existing.length) return existing;

    const profileWithCharges =
      profile.chargeLines?.length
        ? profile
        : await this.profileRepo.findOne({
            where: { id: profile.id },
            relations: ['chargeLines'],
          });
    if (!profileWithCharges) return [];

    const periodCandidates: Array<'yearly' | 'semester'> = ['yearly', 'semester'];
    let derived: ReturnType<typeof deriveInstallmentsFromPeriodSetting> = [];

    for (const billingPeriod of periodCandidates) {
      const periodSetting = await this.feePackagePeriodRepo.findOne({
        where: {
          package_id: profile.fee_package_id,
          level_id: profile.level_id,
          billing_period: billingPeriod,
        },
      });
      if (!periodSetting) continue;

      const periodTotal = sumChargeLinesForPeriod(profileWithCharges, billingPeriod);
      const total =
        periodTotal > 0
          ? periodTotal
          : billingPeriod === 'yearly'
            ? Number(profile.year_total_amount ?? 0)
            : 0;
      if (total <= 0) continue;

      derived = deriveInstallmentsFromPeriodSetting(
        total,
        Number(periodSetting.downpayment_amount ?? 0),
        periodSetting.installment_schedule_months,
        { downpaymentLabel: 'Advance payment' },
      );
      if (derived.length) break;
    }

    if (!derived.length) return [];

    const saved: LevelPaymentInstallment[] = [];
    for (const row of derived) {
      saved.push(
        await this.installmentRepo.save(
          this.installmentRepo.create({
            profile_id: profile.id,
            sequence: row.sequence,
            month_number: row.month_number,
            label: row.label,
            amount: String(row.amount.toFixed(2)),
          }),
        ),
      );
    }
    return saved;
  }

  async buildInstallmentSchedule(p: StudentPayment): Promise<StudentInstallmentSchedule | null> {
    if (!p.level_payment_profile_id) return null;
    const profile = await this.profileRepo.findOne({
      where: { id: p.level_payment_profile_id },
      relations: ['installments', 'chargeLines'],
    });
    if (!profile || (profile.year_payment_mode !== 'installments' && profile.year_payment_mode !== 'both')) {
      return null;
    }
    let insts = [...(profile.installments ?? [])].sort((a, b) => a.sequence - b.sequence);
    if (!insts.length) {
      insts = await this.syncProfileInstallmentsFromFeePackage(profile);
    }
    if (!insts.length) {
      return null;
    }
    let receipts: StudentPaymentInstallmentReceipt[] = [];
    try {
      receipts = await this.installmentReceiptRepo.find({
        where: { student_payment_id: p.id },
      });
    } catch (err) {
      if (!isUndefinedTableError(err)) throw err;
      receipts = [];
    }
    const byInst = new Map(receipts.map((r) => [r.level_payment_installment_id, r]));
    let scheduledTotal = 0;
    let paidTotal = 0;
    let downpaymentTotal = 0;
    const rows: StudentInstallmentScheduleRow[] = insts.map((i) => {
      const amt = Number(i.amount);
      scheduledTotal += Number.isNaN(amt) ? 0 : amt;
      const labelLower = (i.label ?? '').trim().toLowerCase();
      const isDownpayment =
        labelLower.includes('advance') || labelLower.includes('down payment') || labelLower.includes('downpayment');
      if (isDownpayment) downpaymentTotal += Number.isNaN(amt) ? 0 : amt;
      const rec = byInst.get(i.id);
      if (rec) {
        const pr = Number(rec.amount);
        paidTotal += Number.isNaN(pr) ? 0 : pr;
      }
      return {
        installment_id: i.id,
        sequence: i.sequence,
        month_number: i.month_number,
        label: i.label,
        is_downpayment: isDownpayment,
        scheduled_amount: i.amount,
        paid: rec
          ? {
              receipt_id: rec.id,
              amount: rec.amount,
              paid_at: rec.paid_at instanceof Date ? rec.paid_at.toISOString() : String(rec.paid_at),
              remarks: rec.remarks,
            }
          : null,
      };
    });
    return {
      rows,
      scheduled_total: roundMoney(scheduledTotal),
      paid_total: roundMoney(paidTotal),
      downpayment_total: roundMoney(downpaymentTotal),
    };
  }

  async recordInstallmentPayment(
    user: User,
    studentId: string,
    installmentId: string,
    dto: { amount?: number; remarks?: string },
  ): Promise<StudentPaymentInstallmentReceipt> {
    try {
      return await this.recordInstallmentPaymentInner(user, studentId, installmentId, dto);
    } catch (err) {
      if (isUndefinedTableError(err)) {
        throw new BadRequestException(
          'Installment receipts are not available until you run the latest database migrations (table student_payment_installment_receipts).',
        );
      }
      throw err;
    }
  }

  private async recordInstallmentPaymentInner(
    user: User,
    studentId: string,
    installmentId: string,
    dto: { amount?: number; remarks?: string },
  ): Promise<StudentPaymentInstallmentReceipt> {
    const p = await this.getOne(user, studentId, null);
    if (!p.level_payment_profile_id) {
      throw new BadRequestException('This payment has no linked fee profile');
    }
    const profile = await this.profileRepo.findOne({ where: { id: p.level_payment_profile_id } });
    if (
      !profile ||
      (profile.year_payment_mode !== 'installments' && profile.year_payment_mode !== 'both')
    ) {
      throw new BadRequestException('This fee profile is not configured for installments');
    }
    const inst = await this.installmentRepo.findOne({
      where: { id: installmentId, profile_id: p.level_payment_profile_id },
    });
    if (!inst) {
      throw new NotFoundException('Installment not found on this student fee profile');
    }
    const defaultAmt = Number(inst.amount);
    const rawAmt = dto.amount != null ? Number(dto.amount) : defaultAmt;
    if (Number.isNaN(rawAmt) || rawAmt <= 0) {
      throw new BadRequestException('Amount must be a positive number');
    }

    await this.ledgerService.recordPayment(user, p, {
      amount: rawAmt,
      remarks: dto.remarks,
      target_installment_id: installmentId,
    });

    const receipt = await this.installmentReceiptRepo.findOne({
      where: { student_payment_id: p.id, level_payment_installment_id: installmentId },
    });
    if (!receipt) {
      throw new BadRequestException('Payment was recorded but installment receipt is missing');
    }
    return receipt;
  }

  async clearInstallmentReceipt(user: User, studentId: string, installmentId: string): Promise<void> {
    try {
      await this.clearInstallmentReceiptInner(user, studentId, installmentId);
    } catch (err) {
      if (isUndefinedTableError(err)) {
        throw new BadRequestException(
          'Installment receipts are not available until you run the latest database migrations (table student_payment_installment_receipts).',
        );
      }
      throw err;
    }
  }

  private async clearInstallmentReceiptInner(user: User, studentId: string, installmentId: string): Promise<void> {
    this.assertAdmin(user);
    const p = await this.getOne(user, studentId, null);
    try {
      await this.ledgerService.reverseInstallmentPayment(p, installmentId);
    } catch (err) {
      if (!isUndefinedTableError(err)) throw err;
      const existing = await this.installmentReceiptRepo.findOne({
        where: { student_payment_id: p.id, level_payment_installment_id: installmentId },
      });
      if (!existing) throw new NotFoundException('No recorded payment for this installment');
      await this.installmentReceiptRepo.remove(existing);
    }
  }

  async ensureOrThrow(user: User, studentId: string): Promise<StudentPayment> {
    if (user.role === 'admin') {
      this.assertAdmin(user);
    } else if (user.role === 'parent') {
      await this.assertParentLinkedToStudent(user, studentId);
    } else {
      throw new ForbiddenException('Insufficient permissions');
    }
    const st = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!st?.school_id) {
      throw new NotFoundException('Student not found');
    }
    if (user.role === 'admin') {
      this.assertSchool(user, st.school_id);
    } else if (user.school_id != null && Number(st.school_id) !== Number(user.school_id)) {
      throw new ForbiddenException('You can only access your school');
    }
    const created = await this.ensureForStudent(studentId);
    if (!created) {
      throw new BadRequestException('STUDENT_PAYMENT_NO_FEE_LEVEL');
    }
    return this.getOne(user, studentId, null);
  }
}
