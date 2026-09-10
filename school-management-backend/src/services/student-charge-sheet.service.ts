import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { School } from '../entities/school.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { GradeFeeLink } from '../entities/grade-fee-link.entity';
import { FeePackage } from '../entities/fee-package.entity';
import { BusFeeLink } from '../entities/bus-fee-link.entity';
import { CourseFeeLink } from '../entities/course-fee-link.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { StudentChargeSheet } from '../entities/student-charge-sheet.entity';
import { StudentChargeSheetLine } from '../entities/student-charge-sheet-line.entity';
import { StudentChargeSheetInstallment } from '../entities/student-charge-sheet-installment.entity';
import { StudentChargeSheetDiscountLine } from '../entities/student-charge-sheet-discount-line.entity';
import { InstallmentPlan } from '../entities/installment-plan.entity';
import { FeePackageChargeType } from '../entities/fee-package-charge-type.entity';
import { PaymentDiscountType } from '../entities/payment-discount-type.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import {
  AssignStudentChargePlanDto,
  RecordChargePaymentDto,
  SetChargeSheetDiscountsDto,
} from '../dto/fees-v2.dto';
import { moneyStr, num, splitRoundedUpToFive } from '../utils/fees-v2.util';
import { computeInstallmentDueDate, formatDueDateYmd } from '../utils/installment-due-date.util';

type ChargeCandidate = {
  charge_type_id: string;
  charge_label: string;
  source_type: 'grade' | 'bus' | 'course';
  source_ref_id: string | null;
  list_amount: number;
  payment_timing: 'upfront' | 'installment';
  billing_frequency: 'per_year' | 'once_only';
  sort_order: number;
};

@Injectable()
export class StudentChargeSheetService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(AcademicYear)
    private readonly yearRepo: Repository<AcademicYear>,
    @InjectRepository(GradeFeeLink)
    private readonly gradeLinkRepo: Repository<GradeFeeLink>,
    @InjectRepository(BusFeeLink)
    private readonly busLinkRepo: Repository<BusFeeLink>,
    @InjectRepository(CourseFeeLink)
    private readonly courseLinkRepo: Repository<CourseFeeLink>,
    @InjectRepository(StudentCourseEnrollment)
    private readonly enrollmentRepo: Repository<StudentCourseEnrollment>,
    @InjectRepository(StudentChargeSheet)
    private readonly sheetRepo: Repository<StudentChargeSheet>,
    @InjectRepository(StudentChargeSheetLine)
    private readonly lineRepo: Repository<StudentChargeSheetLine>,
    @InjectRepository(StudentChargeSheetInstallment)
    private readonly instRepo: Repository<StudentChargeSheetInstallment>,
    @InjectRepository(StudentChargeSheetDiscountLine)
    private readonly discountRepo: Repository<StudentChargeSheetDiscountLine>,
    @InjectRepository(InstallmentPlan)
    private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(FeePackageChargeType)
    private readonly pkgChargeRepo: Repository<FeePackageChargeType>,
    @InjectRepository(PaymentDiscountType)
    private readonly discountTypeRepo: Repository<PaymentDiscountType>,
    @InjectRepository(LevelPaymentProfile)
    private readonly levelProfileRepo: Repository<LevelPaymentProfile>,
  ) {}

  private async assertCanView(user: User, student: Student) {
    if (user.role === 'admin') return;
    if (user.role === 'student' && student.user_id === user.id) return;
    if (user.role === 'parent') {
      const parent = await this.parentRepo.findOne({
        where: { user_id: user.id },
        relations: ['students'],
      });
      if (parent?.students?.some((s) => s.id === student.id)) return;
    }
    throw new ForbiddenException('Not allowed');
  }

  private async resolveYear(schoolId: string): Promise<AcademicYear> {
    const active = await this.yearRepo.findOne({
      where: { school_id: schoolId, is_active: true },
    });
    if (!active) {
      throw new BadRequestException({
        code: 'NO_ACTIVE_YEAR',
        message: 'No active academic year',
      });
    }
    return active;
  }

  private async hasPaidOnceOnly(
    studentId: string,
    chargeTypeId: string,
  ): Promise<boolean> {
    const paid = await this.lineRepo
      .createQueryBuilder('l')
      .innerJoin('l.sheet', 's')
      .where('s.student_id = :studentId', { studentId })
      .andWhere('l.charge_type_id = :chargeTypeId', { chargeTypeId })
      .andWhere("l.billing_frequency = 'once_only'")
      .andWhere("l.status = 'paid'")
      .getCount();
    return paid > 0;
  }

  private packageChargeMeta(
    links: FeePackageChargeType[],
    chargeTypeId: string,
  ): Pick<ChargeCandidate, 'payment_timing' | 'billing_frequency'> {
    const row = links.find((l) => l.charge_type_id === chargeTypeId);
    return {
      payment_timing: row?.payment_timing ?? 'installment',
      billing_frequency: row?.billing_frequency ?? 'per_year',
    };
  }

  private async collectCandidates(student: Student): Promise<ChargeCandidate[]> {
    const out: ChargeCandidate[] = [];
    let order = 0;

    if (student.payment_level_id) {
      const link = await this.gradeLinkRepo.findOne({
        where: {
          school_id: student.school_id,
          level_id: student.payment_level_id,
          is_active: true,
        },
        relations: [
          'lines',
          'lines.chargeType',
          'feePackage',
          'feePackage.chargeTypeLinks',
          'feePackage.chargeTypeLinks.chargeType',
        ],
      });
      const profile = await this.levelProfileRepo.findOne({
        where: {
          school_id: student.school_id,
          level_id: student.payment_level_id,
        },
        relations: ['chargeLines', 'chargeLines.chargeType'],
      });
      let feePackage = link?.feePackage ?? null;
      if (!feePackage && profile?.fee_package_id) {
        feePackage = await this.levelProfileRepo.manager.findOne(FeePackage, {
          where: { id: profile.fee_package_id, school_id: student.school_id },
          relations: ['chargeTypeLinks', 'chargeTypeLinks.chargeType'],
        });
      }
      if (feePackage) {
        const meta = feePackage.chargeTypeLinks ?? [];
        const linkAmount = new Map(
          (link?.lines ?? []).map((line) => [
            line.charge_type_id,
            { amount: num(line.amount), label: line.chargeType?.label ?? null },
          ]),
        );
        // Level fees UI writes `level_payment_*`; prefer that when present so incomplete grade-link rows do not drop package charges.
        const profileAmount = new Map(
          (profile?.chargeLines ?? []).map((line) => [
            line.charge_type_id,
            { amount: num(line.amount), label: line.chargeType?.label ?? null },
          ]),
        );

        for (const ct of meta) {
          const fromLink = linkAmount.get(ct.charge_type_id);
          const fromProfile = profileAmount.get(ct.charge_type_id);
          const picked =
            fromProfile && fromProfile.amount > 0
              ? fromProfile
              : fromLink && fromLink.amount > 0
                ? fromLink
                : null;
          if (!picked) continue;
          const m = this.packageChargeMeta(meta, ct.charge_type_id);
          out.push({
            charge_type_id: ct.charge_type_id,
            charge_label:
              picked.label ||
              ct.chargeType?.label ||
              ct.charge_type_id,
            source_type: 'grade',
            source_ref_id: student.payment_level_id,
            list_amount: picked.amount,
            payment_timing: m.payment_timing,
            billing_frequency: m.billing_frequency,
            sort_order: order++,
          });
        }
      }
    }

    for (const bus of student.buses ?? []) {
      const link = await this.busLinkRepo.findOne({
        where: { school_id: student.school_id, bus_id: bus.id, is_active: true },
        relations: [
          'lines',
          'lines.chargeType',
          'feePackage',
          'feePackage.chargeTypeLinks',
        ],
      });
      if (!link?.feePackage) continue;
      const meta = link.feePackage.chargeTypeLinks ?? [];
      const allowed = new Set(meta.map((m) => m.charge_type_id));
      for (const line of link.lines ?? []) {
        if (!allowed.has(line.charge_type_id)) continue;
        const m = this.packageChargeMeta(meta, line.charge_type_id);
        out.push({
          charge_type_id: line.charge_type_id,
          charge_label: `${line.chargeType?.label ?? 'Transport'} (${bus.title})`,
          source_type: 'bus',
          source_ref_id: bus.id,
          list_amount: num(line.amount),
          payment_timing: m.payment_timing,
          billing_frequency: m.billing_frequency,
          sort_order: order++,
        });
      }
    }

    const enrollments = await this.enrollmentRepo.find({
      where: { student_id: student.id, school_id: student.school_id, status: 'active' },
      relations: ['course'],
    });
    for (const enr of enrollments) {
      const link = await this.courseLinkRepo.findOne({
        where: { school_id: student.school_id, course_id: enr.course_id, is_active: true },
        relations: [
          'lines',
          'lines.chargeType',
          'feePackage',
          'feePackage.chargeTypeLinks',
          'course',
        ],
      });
      if (!link?.feePackage) continue;
      const courseName = link.course?.name ?? enr.course?.name ?? 'Course';
      const meta = link.feePackage.chargeTypeLinks ?? [];
      const allowed = new Set(meta.map((m) => m.charge_type_id));
      for (const line of link.lines ?? []) {
        if (!allowed.has(line.charge_type_id)) continue;
        const m = this.packageChargeMeta(meta, line.charge_type_id);
        out.push({
          charge_type_id: line.charge_type_id,
          charge_label: `${line.chargeType?.label ?? 'Course fee'} (${courseName})`,
          source_type: 'course',
          source_ref_id: enr.course_id,
          list_amount: num(line.amount),
          payment_timing: m.payment_timing,
          billing_frequency: m.billing_frequency,
          sort_order: order++,
        });
      }
    }

    return out;
  }

  private async installmentDueDateForSheet(
    sheet: StudentChargeSheet,
    monthNumber: number | null,
  ): Promise<string | null> {
    const [year, school] = await Promise.all([
      this.yearRepo.findOne({ where: { id: sheet.academic_year_id } }),
      this.schoolRepo.findOne({ where: { id: sheet.school_id } }),
    ]);
    if (!year) return null;
    const due = computeInstallmentDueDate(
      year.start_date,
      year.end_date,
      monthNumber,
      school?.installment_due_day ?? null,
    );
    return due ? formatDueDateYmd(due) : null;
  }

  private installmentStatus(amountDue: number, amountPaid: number): 'pending' | 'paid' | 'partial' {
    if (amountDue > 0 && amountPaid >= amountDue) return 'paid';
    if (amountPaid > 0) return 'partial';
    return 'pending';
  }

  private static readonly ADVANCE_SEQUENCE = 0;

  private async upsertInstallmentRow(opts: {
    existing: StudentChargeSheetInstallment | undefined;
    sheetId: string;
    sequence: number;
    monthNumber: number | null;
    label: string | null;
    dueDate: string | null;
    amountDue: number;
  }) {
    const paid = num(opts.existing?.amount_paid);
    if (opts.existing) {
      opts.existing.month_number = opts.monthNumber;
      opts.existing.label = opts.label;
      opts.existing.amount_due = moneyStr(opts.amountDue);
      opts.existing.due_date = opts.dueDate;
      opts.existing.status = this.installmentStatus(opts.amountDue, paid);
      await this.instRepo.save(opts.existing);
      return opts.existing.id;
    }
    const created = await this.instRepo.save(
      this.instRepo.create({
        sheet_id: opts.sheetId,
        sequence: opts.sequence,
        month_number: opts.monthNumber,
        label: opts.label,
        due_date: opts.dueDate,
        amount_due: moneyStr(opts.amountDue),
        amount_paid: '0.00',
        status: this.installmentStatus(opts.amountDue, 0),
      }),
    );
    return created.id;
  }

  private async recomputeInstallments(sheet: StudentChargeSheet) {
    const existing = await this.instRepo.find({ where: { sheet_id: sheet.id } });
    const bySeq = new Map(existing.map((row) => [row.sequence, row]));
    const keepIds = new Set<string>();
    const netDue = num(sheet.due_total);
    const upfrontDue = num(sheet.upfront_due);
    const installmentDue = num(sheet.installment_due);
    const today = formatDueDateYmd(new Date());

    if (netDue > 0) {
      const id = await this.upsertInstallmentRow({
        existing: bySeq.get(StudentChargeSheetService.ADVANCE_SEQUENCE),
        sheetId: sheet.id,
        sequence: StudentChargeSheetService.ADVANCE_SEQUENCE,
        monthNumber: null,
        label: 'upfront',
        dueDate: today,
        amountDue: Math.max(0, upfrontDue),
      });
      keepIds.add(id);
    }

    if (installmentDue > 0 && sheet.installment_plan_id) {
      const plan = await this.planRepo.findOne({
        where: { id: sheet.installment_plan_id },
        relations: ['entries'],
      });
      const entries = [...(plan?.entries ?? [])].sort((a, b) => a.sequence - b.sequence);
      if (entries.length) {
        const weights = entries.map((e) => num(e.weight) || 1);
        const amounts = splitRoundedUpToFive(installmentDue, weights);
        for (let i = 0; i < entries.length; i++) {
          const entry = entries[i];
          const dueAmt = amounts[i] ?? 0;
          if (dueAmt <= 0) continue;
          const sequence =
            entry.sequence === StudentChargeSheetService.ADVANCE_SEQUENCE
              ? Math.max(1, i + 1)
              : entry.sequence;
          const dueDate = await this.installmentDueDateForSheet(sheet, entry.month_number);
          const id = await this.upsertInstallmentRow({
            existing: bySeq.get(sequence),
            sheetId: sheet.id,
            sequence,
            monthNumber: entry.month_number ?? null,
            label: entry.label ?? null,
            dueDate,
            amountDue: dueAmt,
          });
          keepIds.add(id);
        }
      }
    }

    const extras = existing.filter((row) => !keepIds.has(row.id));
    if (extras.length) await this.instRepo.remove(extras);
  }

  async refreshDueDatesForSchool(schoolId: string): Promise<number> {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) return 0;
    const rows = await this.instRepo
      .createQueryBuilder('i')
      .innerJoinAndSelect('i.sheet', 's')
      .innerJoinAndSelect('s.academicYear', 'y')
      .where('s.school_id = :schoolId', { schoolId })
      .andWhere('i.month_number IS NOT NULL')
      .getMany();

    for (const row of rows) {
      const due = computeInstallmentDueDate(
        row.sheet.academicYear.start_date,
        row.sheet.academicYear.end_date,
        row.month_number,
        school.installment_due_day,
      );
      row.due_date = due ? formatDueDateYmd(due) : null;
    }
    if (rows.length) await this.instRepo.save(rows);
    return rows.length;
  }

  async listSchoolSummaries(user: User, opts?: { studentIds?: string[] }) {
    if (user.role !== 'admin' || user.school_id == null) {
      throw new ForbiddenException('Admin only');
    }
    const schoolId = String(user.school_id);
    const year = await this.yearRepo.findOne({
      where: { school_id: schoolId, is_active: true },
    });
    if (!year) return [];

    const studentIds = (opts?.studentIds || [])
      .map((id) => String(id || '').trim())
      .filter(Boolean);

    const sheets = await this.sheetRepo.find({
      where: {
        school_id: schoolId,
        academic_year_id: year.id,
        ...(studentIds.length ? { student_id: In(studentIds) } : {}),
      },
      select: [
        'id',
        'student_id',
        'currency',
        'list_total',
        'due_total',
        'paid_total',
        'discount_total',
      ],
    });

    return sheets.map((sheet) => {
      const pending = Math.max(0, num(sheet.due_total) - num(sheet.paid_total));
      return {
        student_id: sheet.student_id,
        currency: sheet.currency,
        list_total: moneyStr(num(sheet.list_total)),
        due_total: moneyStr(num(sheet.due_total)),
        paid_total: moneyStr(num(sheet.paid_total)),
        discount_total: moneyStr(num(sheet.discount_total)),
        pending_total: moneyStr(pending),
      };
    });
  }

  async dueInstallmentsReport(
    user: User,
    opts: { asOf?: string; bucket?: 'all' | 'due' | 'late' | 'upcoming' },
  ) {
    if (user.role !== 'admin' || user.school_id == null) {
      throw new ForbiddenException('Admin only');
    }
    const asOf = /^\d{4}-\d{2}-\d{2}$/.test(opts.asOf || '')
      ? opts.asOf!
      : formatDueDateYmd(new Date());
    const bucket = opts.bucket && ['all', 'due', 'late', 'upcoming'].includes(opts.bucket)
      ? opts.bucket
      : 'all';

    const rows = await this.instRepo
      .createQueryBuilder('i')
      .innerJoin('i.sheet', 's')
      .innerJoin('s.student', 'st')
      .where('s.school_id = :schoolId', { schoolId: String(user.school_id) })
      .andWhere('i.status IN (:...statuses)', { statuses: ['pending', 'partial'] })
      .andWhere('CAST(i.amount_due AS decimal) > CAST(i.amount_paid AS decimal)')
      .select([
        'i.id AS installment_id',
        'i.sequence AS sequence',
        'i.month_number AS month_number',
        'i.label AS label',
        'i.due_date AS due_date',
        'i.amount_due AS amount_due',
        'i.amount_paid AS amount_paid',
        'i.status AS status',
        's.id AS sheet_id',
        'st.id AS student_id',
        'st.firstName AS first_name',
        'st.lastName AS last_name',
      ])
      .orderBy('i.due_date', 'ASC', 'NULLS LAST')
      .addOrderBy('st.firstName', 'ASC')
      .getRawMany();

    const items = rows
      .map((r) => {
        const dueDate = r.due_date ? String(r.due_date).slice(0, 10) : null;
        const amountDue = num(r.amount_due);
        const amountPaid = num(r.amount_paid);
        const balance = Math.max(0, amountDue - amountPaid);
        let state: 'upcoming' | 'due' | 'late' | 'unscheduled' = 'unscheduled';
        let days = 0;
        if (dueDate) {
          const dueMs = Date.parse(`${dueDate}T00:00:00Z`);
          const asOfMs = Date.parse(`${asOf}T00:00:00Z`);
          days = Math.round((asOfMs - dueMs) / 86400000);
          if (days > 0) state = 'late';
          else if (days === 0) state = 'due';
          else state = 'upcoming';
        }
        return {
          installment_id: r.installment_id,
          student_id: r.student_id,
          student_name: `${r.first_name || ''} ${r.last_name || ''}`.trim(),
          sheet_id: r.sheet_id,
          sequence: Number(r.sequence),
          month_number: r.month_number == null ? null : Number(r.month_number),
          label: r.label,
          due_date: dueDate,
          amount_due: moneyStr(amountDue),
          amount_paid: moneyStr(amountPaid),
          balance: moneyStr(balance),
          status: r.status,
          state,
          days_overdue: Math.max(0, days),
        };
      })
      .filter((row) => {
        if (bucket === 'all') return true;
        return row.state === bucket;
      });

    const summary = {
      as_of: asOf,
      total: items.length,
      upcoming: items.filter((i) => i.state === 'upcoming').length,
      due: items.filter((i) => i.state === 'due').length,
      late: items.filter((i) => i.state === 'late').length,
      unscheduled: items.filter((i) => i.state === 'unscheduled').length,
      balance_total: moneyStr(items.reduce((s, i) => s + num(i.balance), 0)),
    };
    return { summary, items };
  }

  private async applyDiscountTotals(sheet: StudentChargeSheet, recalcInstallments = true) {
    const lines = await this.lineRepo.find({
      where: { sheet_id: sheet.id },
      order: { sort_order: 'ASC' },
    });
    const discountLines = await this.discountRepo.find({
      where: { sheet_id: sheet.id },
      relations: ['discountType'],
    });

    const grossDue = lines.reduce((s, l) => s + num(l.due_amount), 0);
    const discountTotal = discountLines.reduce((s, d) => s + num(d.amount), 0);
    if (discountTotal > grossDue) {
      throw new BadRequestException('Total discounts cannot exceed the chargeable amount');
    }

    const netDue = Math.max(0, grossDue - discountTotal);
    let upfrontGross = 0;
    let installmentGross = 0;
    for (const l of lines) {
      const due = num(l.due_amount);
      if (due <= 0) continue;
      if (l.payment_timing === 'upfront') upfrontGross += due;
      else installmentGross += due;
    }
    const timingGross = upfrontGross + installmentGross;
    let upfrontDue = 0;
    if (sheet.upfront_override != null) {
      upfrontDue = Math.min(Math.max(0, num(sheet.upfront_override)), netDue);
    } else if (timingGross > 0) {
      upfrontDue = netDue * (upfrontGross / timingGross);
    }
    if (!sheet.installment_plan_id) {
      upfrontDue = netDue;
    }
    const installmentDue = Math.max(0, netDue - upfrontDue);

    sheet.list_total = moneyStr(lines.reduce((s, l) => s + num(l.list_amount), 0));
    sheet.discount_total = moneyStr(discountTotal);
    sheet.due_total = moneyStr(netDue);
    sheet.upfront_due = moneyStr(upfrontDue);
    sheet.installment_due = moneyStr(installmentDue);
    sheet.paid_total = moneyStr(
      lines.reduce((s, l) => s + num(l.paid_amount), 0) +
        (await this.instRepo.find({ where: { sheet_id: sheet.id } })).reduce(
          (s, i) => s + num(i.amount_paid),
          0,
        ),
    );
    await this.sheetRepo.update(sheet.id, {
      list_total: sheet.list_total,
      discount_total: sheet.discount_total,
      due_total: sheet.due_total,
      upfront_due: sheet.upfront_due,
      installment_due: sheet.installment_due,
      paid_total: sheet.paid_total,
      upfront_override: sheet.upfront_override,
    });
    if (recalcInstallments) {
      await this.recomputeInstallments(sheet);
    }
  }

  private async updatePaidTotal(sheetId: string) {
    const lines = await this.lineRepo.find({ where: { sheet_id: sheetId } });
    const insts = await this.instRepo.find({ where: { sheet_id: sheetId } });
    const paid =
      lines.reduce((s, l) => s + num(l.paid_amount), 0) +
      insts.reduce((s, i) => s + num(i.amount_paid), 0);
    await this.sheetRepo.update(sheetId, { paid_total: moneyStr(paid) });
  }

  async buildOrRefresh(user: User, studentId: string): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['buses', 'paymentLevel'],
    });
    if (!student) throw new NotFoundException('Student not found');
    await this.assertCanView(user, student);

    if (!student.payment_level_id) {
      throw new BadRequestException({
        code: 'STUDENT_NO_GRADE',
        message: 'Student must be assigned to a grade before fees can be calculated',
      });
    }

    const year = await this.resolveYear(student.school_id);
    let sheet = await this.sheetRepo.findOne({
      where: { student_id: studentId, academic_year_id: year.id },
      relations: ['lines', 'installments', 'installmentPlan', 'discountLines'],
    });

    if (!sheet) {
      sheet = await this.sheetRepo.save(
        this.sheetRepo.create({
          student_id: studentId,
          school_id: student.school_id,
          academic_year_id: year.id,
          currency: 'OMR',
          status: 'draft',
        }),
      );
    }

    const savedDiscounts = sheet.discountLines ?? [];
    await this.lineRepo.delete({ sheet_id: sheet.id });
    const candidates = await this.collectCandidates(student);
    const lineRows: StudentChargeSheetLine[] = [];

    for (const c of candidates) {
      let due = c.list_amount;
      let status: 'pending' | 'paid' | 'waived' = 'pending';
      if (c.billing_frequency === 'once_only' && c.list_amount > 0) {
        const already = await this.hasPaidOnceOnly(studentId, c.charge_type_id);
        if (already) {
          due = 0;
          status = 'paid';
        }
      }
      lineRows.push(
        this.lineRepo.create({
          sheet_id: sheet.id,
          charge_type_id: c.charge_type_id,
          source_type: c.source_type,
          source_ref_id: c.source_ref_id,
          charge_label: c.charge_label,
          payment_timing: c.payment_timing,
          billing_frequency: c.billing_frequency,
          list_amount: moneyStr(c.list_amount),
          due_amount: moneyStr(due),
          paid_amount: status === 'paid' ? moneyStr(c.list_amount) : '0.00',
          status,
          sort_order: c.sort_order,
        }),
      );
    }

    if (lineRows.length) await this.lineRepo.save(lineRows);

    await this.applyDiscountTotals(sheet);
    const refreshed = await this.sheetRepo.findOne({ where: { id: sheet.id } });
    if (refreshed) {
      refreshed.status =
        num(refreshed.due_total) <= 0
          ? 'settled'
          : refreshed.installment_plan_id
            ? 'active'
            : 'draft';
      await this.sheetRepo.save(refreshed);
    }

    if (!savedDiscounts.length) {
      return this.getOne(user, sheet.id);
    }

    await this.discountRepo.delete({ sheet_id: sheet.id });
    if (savedDiscounts.length) {
      await this.discountRepo.save(
        savedDiscounts.map((d) =>
          this.discountRepo.create({
            sheet_id: sheet.id,
            discount_type_id: d.discount_type_id,
            amount: d.amount,
            remarks: d.remarks,
          }),
        ),
      );
      await this.applyDiscountTotals(sheet);
    }

    return this.getOne(user, sheet.id);
  }

  async getForStudent(user: User, studentId: string) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['buses'],
    });
    if (!student) throw new NotFoundException('Student not found');
    await this.assertCanView(user, student);
    const year = await this.resolveYear(student.school_id);
    const sheet = await this.sheetRepo.findOne({
      where: { student_id: studentId, academic_year_id: year.id },
      relations: [
        'lines',
        'lines.chargeType',
        'installments',
        'installmentPlan',
        'installmentPlan.entries',
        'discountLines',
        'discountLines.discountType',
        'student',
        'student.paymentLevel',
      ],
    });
    if (!sheet) {
      return this.buildOrRefresh(user, studentId);
    }

    // Rebuild when linked fees drifted (e.g. bus assign, or charge removed from package but amount left on grade link).
    if (student.payment_level_id && (await this.sheetCandidatesMismatch(student, sheet))) {
      return this.buildOrRefresh(user, studentId);
    }

    const hasAdvance = (sheet.installments || []).some(
      (row) => row.sequence === StudentChargeSheetService.ADVANCE_SEQUENCE || row.label === 'upfront',
    );
    if (
      num(sheet.due_total) > 0 &&
      ((!sheet.installments || sheet.installments.length === 0) ||
        !hasAdvance)
    ) {
      await this.applyDiscountTotals(sheet);
      return this.getOne(user, sheet.id);
    }
    sheet.lines?.sort((a, b) => a.sort_order - b.sort_order);
    sheet.installments?.sort((a, b) => a.sequence - b.sequence);
    return sheet;
  }

  /** True when current grade/bus/course candidates disagree with saved sheet lines. */
  private async sheetCandidatesMismatch(
    student: Student,
    sheet: StudentChargeSheet,
  ): Promise<boolean> {
    const expected = await this.collectCandidates(student);
    const expectedKeys = new Set(
      expected.map(
        (c) =>
          `${c.source_type}|${c.source_ref_id ?? ''}|${c.charge_type_id}|${moneyStr(c.list_amount)}`,
      ),
    );
    const actualKeys = new Set(
      (sheet.lines ?? []).map(
        (l) =>
          `${l.source_type}|${l.source_ref_id ?? ''}|${l.charge_type_id}|${moneyStr(num(l.list_amount))}`,
      ),
    );
    if (expectedKeys.size !== actualKeys.size) return true;
    for (const key of expectedKeys) {
      if (!actualKeys.has(key)) return true;
    }
    return false;
  }

  async getOne(user: User, sheetId: string) {
    const sheet = await this.sheetRepo.findOne({
      where: { id: sheetId },
      relations: [
        'lines',
        'lines.chargeType',
        'installments',
        'installmentPlan',
        'installmentPlan.entries',
        'discountLines',
        'discountLines.discountType',
        'student',
        'student.paymentLevel',
      ],
    });
    if (!sheet) throw new NotFoundException('Charge sheet not found');
    await this.assertCanView(user, sheet.student);
    sheet.lines?.sort((a, b) => a.sort_order - b.sort_order);
    sheet.installments?.sort((a, b) => a.sequence - b.sequence);
    return sheet;
  }

  private async replaceDiscounts(
    sheet: StudentChargeSheet,
    discounts: Array<{ discount_type_id: string; amount: number; remarks?: string }>,
  ) {
    const types = await this.discountTypeRepo.find({
      where: { school_id: sheet.school_id, is_active: true },
    });
    const typeIds = new Set(types.map((t) => t.id));
    for (const d of discounts) {
      if (!typeIds.has(d.discount_type_id)) {
        throw new BadRequestException('Invalid or inactive discount type');
      }
    }
    await this.discountRepo.delete({ sheet_id: sheet.id });
    if (discounts.length) {
      await this.discountRepo.save(
        discounts.map((d) =>
          this.discountRepo.create({
            sheet_id: sheet.id,
            discount_type_id: d.discount_type_id,
            amount: moneyStr(d.amount),
            remarks: d.remarks ?? null,
          }),
        ),
      );
    }
  }

  async assignPlan(user: User, studentId: string, dto: AssignStudentChargePlanDto) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    await this.buildOrRefresh(user, studentId);
    const sheet = await this.getForStudent(user, studentId);
    if (dto.installment_plan_id) {
      const plan = await this.planRepo.findOne({
        where: { id: dto.installment_plan_id, school_id: sheet.school_id },
      });
      if (!plan) throw new NotFoundException('Installment plan not found');
    }
    sheet.installment_plan_id = dto.installment_plan_id ?? null;
    if (dto.upfront_due != null) {
      sheet.upfront_override = moneyStr(dto.upfront_due);
    }
    sheet.status = num(sheet.due_total) > 0 ? 'active' : 'settled';
    await this.sheetRepo.update(sheet.id, {
      installment_plan_id: sheet.installment_plan_id,
      upfront_override: sheet.upfront_override,
      status: sheet.status,
    });
    if (dto.discounts) {
      await this.replaceDiscounts(
        sheet,
        dto.discounts.filter((d) => d.discount_type_id && d.amount > 0),
      );
    }
    await this.applyDiscountTotals(sheet);
    return this.getOne(user, sheet.id);
  }

  async setDiscounts(user: User, studentId: string, dto: SetChargeSheetDiscountsDto) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    const sheet = await this.getForStudent(user, studentId);
    await this.replaceDiscounts(sheet, dto.discounts);
    await this.applyDiscountTotals(sheet);
    return this.getOne(user, sheet.id);
  }

  /**
   * Apply a confirmed payment to the charge sheet (no role check — caller must authorize).
   */
  async applyConfirmedPayment(opts: {
    studentId: string;
    targetType: 'upfront' | 'installment';
    installmentId?: string | null;
    amount: number;
  }): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({ where: { id: opts.studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const year = await this.resolveYear(student.school_id);
    const sheet = await this.sheetRepo.findOne({
      where: { student_id: opts.studentId, academic_year_id: year.id },
    });
    if (!sheet) throw new NotFoundException('Charge sheet not found');

    if (opts.targetType === 'installment') {
      if (!opts.installmentId) throw new BadRequestException('Installment is required');
      const inst = await this.instRepo.findOne({ where: { id: opts.installmentId, sheet_id: sheet.id } });
      if (!inst) throw new NotFoundException('Installment not found');
      const balance = num(inst.amount_due) - num(inst.amount_paid);
      if (opts.amount > balance + 0.001) {
        throw new BadRequestException('Payment exceeds installment balance');
      }
      inst.amount_paid = moneyStr(num(inst.amount_paid) + opts.amount);
      if (num(inst.amount_paid) >= num(inst.amount_due)) inst.status = 'paid';
      else if (num(inst.amount_paid) > 0) inst.status = 'partial';
      await this.instRepo.save(inst);
      await this.updatePaidTotal(sheet.id);
    } else {
      let remaining = opts.amount;
      const lines = await this.lineRepo.find({
        where: { sheet_id: sheet.id },
        order: { sort_order: 'ASC' },
      });
      const upfrontLines = lines.filter(
        (l) => l.payment_timing === 'upfront' && l.status === 'pending' && num(l.due_amount) > num(l.paid_amount),
      );
      for (const line of upfrontLines) {
        if (remaining <= 0) break;
        const lineDue = num(line.due_amount) - num(line.paid_amount);
        const pay = Math.min(remaining, lineDue);
        line.paid_amount = moneyStr(num(line.paid_amount) + pay);
        if (num(line.paid_amount) >= num(line.due_amount)) line.status = 'paid';
        remaining -= pay;
        await this.lineRepo.save(line);
      }
      if (remaining > 0) {
        throw new BadRequestException('Payment exceeds upfront balance due');
      }
      await this.updatePaidTotal(sheet.id);
    }

    const full = await this.sheetRepo.findOne({
      where: { id: sheet.id },
      relations: [
        'lines',
        'lines.chargeType',
        'installments',
        'installmentPlan',
        'installmentPlan.entries',
        'discountLines',
        'discountLines.discountType',
        'student',
        'student.paymentLevel',
      ],
    });
    if (!full) throw new NotFoundException('Charge sheet not found');
    full.lines?.sort((a, b) => a.sort_order - b.sort_order);
    full.installments?.sort((a, b) => a.sequence - b.sequence);
    return full;
  }

  async remainingForTarget(
    studentId: string,
    targetType: 'upfront' | 'installment',
    installmentId?: string | null,
  ): Promise<{ sheet: StudentChargeSheet; remaining: number }> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const year = await this.resolveYear(student.school_id);
    const sheet = await this.sheetRepo.findOne({
      where: { student_id: studentId, academic_year_id: year.id },
    });
    if (!sheet) throw new NotFoundException('Charge sheet not found');

    if (targetType === 'installment') {
      if (!installmentId) throw new BadRequestException('Installment is required');
      const inst = await this.instRepo.findOne({ where: { id: installmentId, sheet_id: sheet.id } });
      if (!inst) throw new NotFoundException('Installment not found');
      return { sheet, remaining: Math.max(0, num(inst.amount_due) - num(inst.amount_paid)) };
    }
    const lines = await this.lineRepo.find({ where: { sheet_id: sheet.id } });
    const remaining = lines
      .filter((l) => l.payment_timing === 'upfront')
      .reduce((s, l) => s + Math.max(0, num(l.due_amount) - num(l.paid_amount)), 0);
    return { sheet, remaining };
  }

  async recordUpfrontPayment(user: User, studentId: string, dto: RecordChargePaymentDto) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Office payments can only be recorded by admin');
    }
    await this.getForStudent(user, studentId);
    return this.applyConfirmedPayment({
      studentId,
      targetType: 'upfront',
      amount: dto.amount,
    });
  }

  async recordInstallmentPayment(
    user: User,
    installmentId: string,
    dto: RecordChargePaymentDto,
  ) {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Office payments can only be recorded by admin');
    }
    const inst = await this.instRepo.findOne({
      where: { id: installmentId },
      relations: ['sheet', 'sheet.student'],
    });
    if (!inst) throw new NotFoundException('Installment not found');
    await this.assertCanView(user, inst.sheet.student);
    return this.applyConfirmedPayment({
      studentId: inst.sheet.student_id,
      targetType: 'installment',
      installmentId,
      amount: dto.amount,
    });
  }
}
