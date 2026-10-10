import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  buildPage,
  clampPage,
  parsePageQuery,
  wantsPage,
  type PageQuery,
  type PageResult,
} from '../common/pagination';
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
import { StudentChargeSheetExtraLine } from '../entities/student-charge-sheet-extra-line.entity';
import { StudentChargeSheetInclusionLine } from '../entities/student-charge-sheet-inclusion-line.entity';
import { InstallmentPlan } from '../entities/installment-plan.entity';
import { FeePackageChargeType } from '../entities/fee-package-charge-type.entity';
import { PaymentDiscountType } from '../entities/payment-discount-type.entity';
import { PaymentExtraType } from '../entities/payment-extra-type.entity';
import { PaymentInclusionType } from '../entities/payment-inclusion-type.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import {
  AssignStudentChargePlanDto,
  RecordChargePaymentDto,
  SetChargeSheetDiscountsDto,
} from '../dto/fees-v2.dto';
import { moneyStr, num, splitRoundedUpToFive } from '../utils/fees-v2.util';
import { formatStudentDisplayName } from '../common/identity/bilingual-name';
import {
  classifyDueState,
  computeInstallmentDueDate,
  dueDateYmd,
  formatDueDateYmd,
} from '../utils/installment-due-date.util';

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
  /** Serialize rebuilds per student so parallel parent GETs cannot wipe each other's lines. */
  private readonly rebuildInFlight = new Map<string, Promise<StudentChargeSheet>>();

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
    @InjectRepository(StudentChargeSheetExtraLine)
    private readonly extraRepo: Repository<StudentChargeSheetExtraLine>,
    @InjectRepository(StudentChargeSheetInclusionLine)
    private readonly inclusionRepo: Repository<StudentChargeSheetInclusionLine>,
    @InjectRepository(InstallmentPlan)
    private readonly planRepo: Repository<InstallmentPlan>,
    @InjectRepository(FeePackageChargeType)
    private readonly pkgChargeRepo: Repository<FeePackageChargeType>,
    @InjectRepository(PaymentDiscountType)
    private readonly discountTypeRepo: Repository<PaymentDiscountType>,
    @InjectRepository(PaymentExtraType)
    private readonly extraTypeRepo: Repository<PaymentExtraType>,
    @InjectRepository(PaymentInclusionType)
    private readonly inclusionTypeRepo: Repository<PaymentInclusionType>,
    @InjectRepository(FeePackage)
    private readonly packageRepo: Repository<FeePackage>,
    @InjectRepository(LevelPaymentProfile)
    private readonly levelProfileRepo: Repository<LevelPaymentProfile>,
  ) {}

  private readonly logger = new Logger(StudentChargeSheetService.name);

  private isParentActor(user: User): boolean {
    return user.role === 'parent' || user.user_type === 'parent';
  }

  private isAdminActor(user: User): boolean {
    return (
      user.role === 'admin' ||
      user.isSuperAdmin === true ||
      user.isSystemUser === true ||
      user.user_type === 'platform'
    );
  }

  /**
   * Parent access must use `student_parents` (not only TypeORM ManyToMany), matching
   * legacy student-payment checks — the join table also stores `relationship`.
   */
  async assertCanView(user: User, student: Student): Promise<void> {
    if (this.isAdminActor(user)) return;
    if (
      (user.role === 'student' || user.user_type === 'student') &&
      student.user_id === user.id
    ) {
      return;
    }
    if (this.isParentActor(user)) {
      const cnt = await this.parentRepo
        .createQueryBuilder('p')
        .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
        .where('p.user_id = :uid', { uid: user.id })
        .andWhere('sp.student_id = :sid', { sid: student.id })
        .getCount();
      if (cnt > 0) return;
    }
    throw new ForbiddenException('Not allowed');
  }

  /** Resolve fee grade: explicit student payment level, else class-group level. */
  private async resolveFeeLevelId(student: Student): Promise<string | null> {
    if (student.payment_level_id) return student.payment_level_id;
    const withGroups =
      student.groups?.length != null
        ? student
        : await this.studentRepo.findOne({
            where: { id: student.id },
            relations: ['groups'],
          });
    const fromGroups = (withGroups?.groups ?? [])
      .map((g) => g.level_id)
      .find((id): id is string => Boolean(id));
    if (fromGroups) {
      if (!student.payment_level_id) {
        await this.studentRepo.update(student.id, { payment_level_id: fromGroups });
        student.payment_level_id = fromGroups;
      }
      return fromGroups;
    }
    const rows: Array<{ level_id: string }> = await this.studentRepo.manager.query(
      `SELECT g.level_id
       FROM student_groups sg
       INNER JOIN groups g ON g.id = sg.group_id
       WHERE sg.student_id = $1 AND g.level_id IS NOT NULL
       LIMIT 1`,
      [student.id],
    );
    const fromJoin = rows[0]?.level_id ?? null;
    if (fromJoin && !student.payment_level_id) {
      await this.studentRepo.update(student.id, { payment_level_id: fromJoin });
      student.payment_level_id = fromJoin;
    }
    return fromJoin;
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

    const feeLevelId = await this.resolveFeeLevelId(student);
    if (feeLevelId) {
      const link = await this.gradeLinkRepo.findOne({
        where: {
          school_id: student.school_id,
          level_id: feeLevelId,
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
          level_id: feeLevelId,
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
            source_ref_id: feeLevelId,
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

  private async collectInclusions(
    student: Student,
  ): Promise<Array<{ id: string; code: string; label: string }>> {
    const packageIds = new Set<string>();
    const feeLevelId = await this.resolveFeeLevelId(student);
    if (feeLevelId) {
      const link = await this.gradeLinkRepo.findOne({
        where: { school_id: student.school_id, level_id: feeLevelId, is_active: true },
      });
      if (link?.fee_package_id) packageIds.add(link.fee_package_id);
      if (!link?.fee_package_id) {
        const profile = await this.levelProfileRepo.findOne({
          where: { school_id: student.school_id, level_id: feeLevelId },
        });
        if (profile?.fee_package_id) packageIds.add(profile.fee_package_id);
      }
    }
    for (const bus of student.buses ?? []) {
      const link = await this.busLinkRepo.findOne({
        where: { school_id: student.school_id, bus_id: bus.id, is_active: true },
      });
      if (link?.fee_package_id) packageIds.add(link.fee_package_id);
    }
    const enrollments = await this.enrollmentRepo.find({
      where: { student_id: student.id, school_id: student.school_id, status: 'active' },
    });
    for (const enr of enrollments) {
      const link = await this.courseLinkRepo.findOne({
        where: { school_id: student.school_id, course_id: enr.course_id, is_active: true },
      });
      if (link?.fee_package_id) packageIds.add(link.fee_package_id);
    }
    if (!packageIds.size) return [];
    const pkgs = await this.packageRepo.find({
      where: { id: In([...packageIds]) },
      relations: ['inclusionTypeLinks', 'inclusionTypeLinks.inclusionType'],
    });
    const seen = new Set<string>();
    const out: Array<{ id: string; code: string; label: string }> = [];
    for (const pkg of pkgs) {
      for (const link of pkg.inclusionTypeLinks ?? []) {
        const t = link.inclusionType;
        if (!t?.is_active || seen.has(t.id)) continue;
        seen.add(t.id);
        out.push({ id: t.id, code: t.code, label: t.label });
      }
    }
    return out;
  }

  private async decorateSheet(sheet: StudentChargeSheet, student?: Student | null) {
    const st =
      student ??
      (await this.studentRepo.findOne({
        where: { id: sheet.student_id },
        relations: ['buses', 'groups'],
      }));
    if (sheet.custom_inclusions) {
      const rows = await this.inclusionRepo.find({
        where: { sheet_id: sheet.id },
        relations: ['inclusionType'],
        order: { created_at: 'ASC' },
      });
      sheet.inclusions = rows
        .filter((r) => r.inclusionType?.is_active)
        .map((r) => ({
          id: r.inclusion_type_id,
          code: r.inclusionType.code,
          label: r.inclusionType.label,
        }));
    } else {
      sheet.inclusions = st ? await this.collectInclusions(st) : [];
    }
    return sheet;
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
        'extra_total',
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
        extra_total: moneyStr(num(sheet.extra_total)),
        pending_total: moneyStr(pending),
      };
    });
  }

  private dueStateSql(): string {
    return `CASE
      WHEN i.due_date IS NULL THEN 'unscheduled'
      WHEN i.due_date < CAST(:asOf AS date) THEN 'late'
      WHEN i.due_date = CAST(:asOf AS date) THEN 'due'
      ELSE 'upcoming'
    END`;
  }

  /** One page of the due report plus summary counts over the full filtered set. */
  private async dueInstallmentsReportPage(
    schoolId: string,
    asOf: string,
    bucket: 'all' | 'due' | 'late' | 'upcoming',
    query: PageQuery,
  ) {
    const state = this.dueStateSql();
    const base = () =>
      this.instRepo
        .createQueryBuilder('i')
        .innerJoin('i.sheet', 's')
        .innerJoin('s.student', 'st')
        .where('s.school_id = :schoolId', { schoolId })
        .andWhere('i.status IN (:...statuses)', { statuses: ['pending', 'partial'] })
        .andWhere('CAST(i.amount_due AS decimal) > CAST(i.amount_paid AS decimal)')
        .setParameter('asOf', asOf);

    const summaryRaw = await base()
      .select('COUNT(*)', 'total')
      .addSelect(`COUNT(*) FILTER (WHERE ${state} = 'upcoming')`, 'upcoming')
      .addSelect(`COUNT(*) FILTER (WHERE ${state} = 'due')`, 'due')
      .addSelect(`COUNT(*) FILTER (WHERE ${state} = 'late')`, 'late')
      .addSelect(`COUNT(*) FILTER (WHERE ${state} = 'unscheduled')`, 'unscheduled')
      .addSelect(
        `COALESCE(SUM(GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0)), 0)`,
        'balance_total',
      )
      .getRawOne<Record<string, string>>();

    const filtered = base();
    if (bucket !== 'all') filtered.andWhere(`${state} = :bucket`, { bucket });
    const total = await filtered.clone().getCount();
    const { page, limit } = parsePageQuery(query);
    const safePage = clampPage(page, total, limit);
    const rows = await filtered
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
        'st.secondName AS second_name',
        'st.secondNameEn AS second_name_en',
        'st.lastName AS last_name',
        'st.first_name_ar AS first_name_ar',
        'st.first_name_en AS first_name_en',
        'st.last_name_ar AS last_name_ar',
        'st.last_name_en AS last_name_en',
      ])
      .addSelect(state, 'state')
      .addSelect(
        `CASE WHEN i.due_date IS NOT NULL AND i.due_date < CAST(:asOf AS date) THEN (CAST(:asOf AS date) - i.due_date) ELSE 0 END`,
        'days_overdue',
      )
      .orderBy('i.due_date', 'ASC', 'NULLS LAST')
      .addOrderBy('st.firstName', 'ASC')
      .addOrderBy('i.id', 'ASC')
      .offset((safePage - 1) * limit)
      .limit(limit)
      .getRawMany();

    const items = rows.map((r) => {
      const dueDate = dueDateYmd(r.due_date);
      const amountDue = num(r.amount_due);
      const amountPaid = num(r.amount_paid);
      const balance = Math.max(0, amountDue - amountPaid);
      return {
        installment_id: r.installment_id,
        student_id: r.student_id,
        student_name: formatStudentDisplayName({
          firstName: r.first_name,
          secondName: r.second_name,
          secondNameEn: r.second_name_en,
          lastName: r.last_name,
          first_name_ar: r.first_name_ar,
          first_name_en: r.first_name_en,
          last_name_ar: r.last_name_ar,
          last_name_en: r.last_name_en,
        }),
        first_name: r.first_name,
        second_name: r.second_name,
        second_name_en: r.second_name_en,
        last_name: r.last_name,
        first_name_ar: r.first_name_ar,
        first_name_en: r.first_name_en,
        last_name_ar: r.last_name_ar,
        last_name_en: r.last_name_en,
        sheet_id: r.sheet_id,
        sequence: Number(r.sequence),
        month_number: r.month_number == null ? null : Number(r.month_number),
        label: r.label,
        due_date: dueDate,
        amount_due: moneyStr(amountDue),
        amount_paid: moneyStr(amountPaid),
        balance: moneyStr(balance),
        status: r.status,
        state: r.state,
        days_overdue: Number(r.days_overdue) || 0,
      };
    });

    const summary = {
      as_of: asOf,
      total: Number(summaryRaw?.total) || 0,
      upcoming: Number(summaryRaw?.upcoming) || 0,
      due: Number(summaryRaw?.due) || 0,
      late: Number(summaryRaw?.late) || 0,
      unscheduled: Number(summaryRaw?.unscheduled) || 0,
      balance_total: moneyStr(num(summaryRaw?.balance_total)),
    };
    return { ...buildPage(items, total, safePage, limit), summary };
  }

  async dueInstallmentsReport(
    user: User,
    opts: {
      asOf?: string;
      bucket?: 'all' | 'due' | 'late' | 'upcoming';
      page?: string;
      limit?: string;
    },
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

    if (wantsPage(opts.page)) {
      return this.dueInstallmentsReportPage(String(user.school_id), asOf, bucket, opts);
    }

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
        'st.secondName AS second_name',
        'st.secondNameEn AS second_name_en',
        'st.lastName AS last_name',
        'st.first_name_ar AS first_name_ar',
        'st.first_name_en AS first_name_en',
        'st.last_name_ar AS last_name_ar',
        'st.last_name_en AS last_name_en',
      ])
      .orderBy('i.due_date', 'ASC', 'NULLS LAST')
      .addOrderBy('st.firstName', 'ASC')
      .getRawMany();

    const classified = rows.map((r) => {
      const dueDate = dueDateYmd(r.due_date);
      const amountDue = num(r.amount_due);
      const amountPaid = num(r.amount_paid);
      const balance = Math.max(0, amountDue - amountPaid);
      const bucketState = classifyDueState(dueDate, asOf);
      return {
        installment_id: r.installment_id,
        student_id: r.student_id,
        student_name: formatStudentDisplayName({
          firstName: r.first_name,
          secondName: r.second_name,
          secondNameEn: r.second_name_en,
          lastName: r.last_name,
          first_name_ar: r.first_name_ar,
          first_name_en: r.first_name_en,
          last_name_ar: r.last_name_ar,
          last_name_en: r.last_name_en,
        }),
        first_name: r.first_name,
        second_name: r.second_name,
        second_name_en: r.second_name_en,
        last_name: r.last_name,
        first_name_ar: r.first_name_ar,
        first_name_en: r.first_name_en,
        last_name_ar: r.last_name_ar,
        last_name_en: r.last_name_en,
        sheet_id: r.sheet_id,
        sequence: Number(r.sequence),
        month_number: r.month_number == null ? null : Number(r.month_number),
        label: r.label,
        due_date: dueDate,
        amount_due: moneyStr(amountDue),
        amount_paid: moneyStr(amountPaid),
        balance: moneyStr(balance),
        status: r.status,
        state: bucketState.state,
        days_overdue: bucketState.daysOverdue,
      };
    });

    const items =
      bucket === 'all' ? classified : classified.filter((row) => row.state === bucket);

    const summary = {
      as_of: asOf,
      total: classified.length,
      upcoming: classified.filter((i) => i.state === 'upcoming').length,
      due: classified.filter((i) => i.state === 'due').length,
      late: classified.filter((i) => i.state === 'late').length,
      unscheduled: classified.filter((i) => i.state === 'unscheduled').length,
      balance_total: moneyStr(classified.reduce((s, i) => s + num(i.balance), 0)),
    };
    return { summary, items };
  }

  private async linkedFeeStudentIds(user: User): Promise<string[]> {
    if (user.role === 'student' || user.user_type === 'student') {
      const student = await this.studentRepo.findOne({
        where: { user_id: user.id },
        select: ['id'],
      });
      return student ? [student.id] : [];
    }
    if (!this.isParentActor(user)) throw new ForbiddenException('Not allowed');
    const rows: Array<{ student_id: string }> = await this.parentRepo.manager.query(
      `SELECT sp.student_id
       FROM parents p
       INNER JOIN student_parents sp ON sp.parent_id = p.id
       WHERE p.user_id = $1`,
      [user.id],
    );
    return rows.map((r) => r.student_id);
  }

  /**
   * One page of a parent's installments. Desktop is unpaid rows across linked
   * children; mobile is one child's full schedule. Sheets that do not exist yet
   * are built so the first visit is not empty.
   */
  async listMyInstallmentsPage(
    user: User,
    query: PageQuery & {
      surface?: 'desktop' | 'mobile';
      studentId?: string;
      bucket?: string;
    },
  ): Promise<
    PageResult<Record<string, unknown>> & {
      summary: {
        due_total: string;
        paid_total: string;
        late_amount: string;
        due_today_amount: string;
        pending_receipts: number;
        counts: { all: number; late: number; due: number; partial: number; upcoming: number; wait: number };
        child_dues: Array<{ student_id: string; due_total: string }>;
        next_payable: Record<string, unknown> | null;
        late_promo: Record<string, unknown> | null;
      };
    }
  > {
    const surface = query.surface === 'mobile' ? 'mobile' : 'desktop';
    const linked = await this.linkedFeeStudentIds(user);
    const requested = (query.studentId || '').trim();
    let scope = linked;
    if (requested) {
      if (!linked.includes(requested)) throw new ForbiddenException('Not allowed');
      scope = [requested];
    }
    if (surface === 'mobile' && !requested) {
      throw new BadRequestException('student_id is required');
    }

    const { page, limit } = parsePageQuery(query);
    const emptySummary = {
      due_total: moneyStr(0),
      paid_total: moneyStr(0),
      late_amount: moneyStr(0),
      due_today_amount: moneyStr(0),
      pending_receipts: 0,
      counts: { all: 0, late: 0, due: 0, partial: 0, upcoming: 0, wait: 0 },
      child_dues: [] as Array<{ student_id: string; due_total: string }>,
      next_payable: null,
      late_promo: null,
    };
    if (!scope.length) return { ...buildPage([], 0, 1, limit), summary: emptySummary };

    const students = await this.studentRepo.find({
      where: { id: In(scope) },
      select: ['id', 'school_id'],
    });
    const bySchool = new Map<string, string[]>();
    for (const student of students) {
      const schoolId = String(student.school_id);
      const list = bySchool.get(schoolId) || [];
      list.push(student.id);
      bySchool.set(schoolId, list);
    }
    for (const [schoolId, ids] of bySchool) {
      let yearId: string;
      try {
        yearId = (await this.resolveYear(schoolId)).id;
      } catch {
        continue;
      }
      const existing: Array<{ student_id: string }> = await this.sheetRepo.manager.query(
        `SELECT student_id FROM student_charge_sheets WHERE academic_year_id = $1 AND student_id = ANY($2::uuid[])`,
        [yearId, ids],
      );
      const have = new Set(existing.map((r) => r.student_id));
      for (const id of ids) {
        if (have.has(id)) continue;
        try {
          await this.buildOrRefresh(user, id);
        } catch {
          /* student has no grade yet */
        }
      }
    }

    const bucketSql = `CASE
      WHEN EXISTS (
        SELECT 1 FROM student_fee_payments pay
        WHERE pay.installment_id = i.id
          AND (
            pay.status IN ('pending_approval', 'pending_reconcile')
            OR (pay.status = 'pending' AND pay.method = 'thawani')
          )
      ) THEN 'wait'
      WHEN i.due_date IS NOT NULL AND i.due_date < CURRENT_DATE THEN 'late'
      WHEN i.due_date IS NOT NULL AND i.due_date = CURRENT_DATE THEN 'due'
      WHEN CAST(i.amount_paid AS decimal) > 0 THEN 'partial'
      ELSE 'upcoming'
    END`;

    const yearJoin = `
      FROM student_charge_sheet_installments i
      INNER JOIN student_charge_sheets s ON s.id = i.sheet_id
      INNER JOIN academic_years y ON y.id = s.academic_year_id AND y.is_active = true
      INNER JOIN students st ON st.id = s.student_id
      LEFT JOIN installment_plans ip ON ip.id = s.installment_plan_id
      LEFT JOIN school_payment_levels lv ON lv.id = st.payment_level_id
      WHERE s.student_id = ANY($1::uuid[])
    `;

    const childDues: Array<{ student_id: string; due_total: string }> = await this.sheetRepo.manager.query(
      `SELECT s.student_id, s.due_total
       FROM student_charge_sheets s
       INNER JOIN academic_years y ON y.id = s.academic_year_id AND y.is_active = true
       WHERE s.student_id = ANY($1::uuid[])`,
      [linked],
    );
    const sheetTotals: Array<{ due_total: string; paid_total: string }> = await this.sheetRepo.manager.query(
      `SELECT COALESCE(SUM(s.due_total), 0) AS due_total, COALESCE(SUM(s.paid_total), 0) AS paid_total
       FROM student_charge_sheets s
       INNER JOIN academic_years y ON y.id = s.academic_year_id AND y.is_active = true
       WHERE s.student_id = ANY($1::uuid[])`,
      [scope],
    );
    const pendingRows: Array<{ cnt: string }> = await this.sheetRepo.manager.query(
      `SELECT COUNT(*)::int AS cnt
       FROM student_fee_payments
       WHERE student_id = ANY($1::uuid[])
         AND status IN ('pending_approval', 'pending_reconcile')`,
      [scope],
    );

    if (surface === 'mobile') {
      const countRows: Array<{ cnt: string }> = await this.instRepo.manager.query(
        `SELECT COUNT(*)::int AS cnt ${yearJoin}`,
        [scope],
      );
      const total = Number(countRows[0]?.cnt) || 0;
      const safePage = clampPage(page, total, limit);
      const rows: Array<Record<string, unknown>> = await this.instRepo.manager.query(
        `SELECT i.id, i.sequence, i.month_number, i.label, i.due_date, i.amount_due, i.amount_paid, i.status
         ${yearJoin}
         ORDER BY i.sequence ASC, i.id ASC
         LIMIT $2 OFFSET $3`,
        [scope, limit, (safePage - 1) * limit],
      );
      const items = rows.map((r) => ({
        id: r.id,
        sequence: Number(r.sequence),
        month_number: r.month_number == null ? null : Number(r.month_number),
        label: r.label,
        due_date: r.due_date ? dueDateYmd(r.due_date) : null,
        amount_due: moneyStr(num(r.amount_due as string | number | null)),
        amount_paid: moneyStr(num(r.amount_paid as string | number | null)),
        status: r.status,
      }));
      return {
        ...buildPage(items, total, safePage, limit),
        summary: {
          ...emptySummary,
          due_total: moneyStr(num(sheetTotals[0]?.due_total)),
          paid_total: moneyStr(num(sheetTotals[0]?.paid_total)),
          pending_receipts: Number(pendingRows[0]?.cnt) || 0,
          child_dues: childDues.map((r) => ({
            student_id: r.student_id,
            due_total: moneyStr(num(r.due_total)),
          })),
        },
      };
    }

    const unpaid = `${yearJoin} AND CAST(i.amount_due AS decimal) > CAST(i.amount_paid AS decimal)`;
    const countRaw: Array<Record<string, string>> = await this.instRepo.manager.query(
      `SELECT
         COUNT(*)::int AS cnt_all,
         COUNT(*) FILTER (WHERE (${bucketSql}) = 'late')::int AS late,
         COUNT(*) FILTER (WHERE (${bucketSql}) = 'due')::int AS due,
         COUNT(*) FILTER (WHERE (${bucketSql}) = 'partial')::int AS partial,
         COUNT(*) FILTER (WHERE (${bucketSql}) = 'upcoming')::int AS upcoming,
         COUNT(*) FILTER (WHERE (${bucketSql}) = 'wait')::int AS wait,
         COALESCE(SUM(GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0)) FILTER (WHERE (${bucketSql}) = 'late'), 0) AS late_amount,
         COALESCE(SUM(GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0)) FILTER (WHERE (${bucketSql}) = 'due'), 0) AS due_today_amount
       ${unpaid}`,
      [scope],
    );
    const counts = countRaw[0] || {};
    const bucket = ['late', 'due', 'partial', 'upcoming', 'wait'].includes(String(query.bucket))
      ? String(query.bucket)
      : 'all';
    const bucketWhere = bucket === 'all' ? '' : ` AND (${bucketSql}) = $2`;
    const countParams: unknown[] = bucket === 'all' ? [scope] : [scope, bucket];
    const filteredCount: Array<{ cnt: string }> = await this.instRepo.manager.query(
      `SELECT COUNT(*)::int AS cnt ${unpaid}${bucketWhere}`,
      countParams,
    );
    const total = Number(filteredCount[0]?.cnt) || 0;
    const safePage = clampPage(page, total, limit);
    const pageParams: unknown[] =
      bucket === 'all'
        ? [scope, limit, (safePage - 1) * limit]
        : [scope, bucket, limit, (safePage - 1) * limit];
    const limitSql =
      bucket === 'all' ? 'LIMIT $2 OFFSET $3' : 'LIMIT $3 OFFSET $4';
    const pageRows: Array<Record<string, unknown>> = await this.instRepo.manager.query(
      `SELECT
         i.id, i.sequence, i.month_number, i.label, i.due_date, i.amount_due, i.amount_paid, i.status,
         s.student_id,
         st."firstName" AS first_name,
         st."secondName" AS second_name,
         st."secondNameEn" AS second_name_en,
         st."lastName" AS last_name,
         st.first_name_ar, st.first_name_en, st.last_name_ar, st.last_name_en,
         ip.name AS plan_name,
         lv.name AS level_name,
         (${bucketSql}) AS bucket,
         GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0) AS remaining
       ${unpaid}${bucketWhere}
       ORDER BY
         CASE (${bucketSql})
           WHEN 'late' THEN 0 WHEN 'due' THEN 1 WHEN 'partial' THEN 2 WHEN 'wait' THEN 3 ELSE 4
         END,
         i.due_date ASC NULLS LAST,
         i.id ASC
       ${limitSql}`,
      pageParams,
    );

    const mapRow = (r: Record<string, unknown>) => {
      const installment = {
        id: String(r.id),
        sequence: Number(r.sequence),
        month_number: r.month_number == null ? null : Number(r.month_number),
        label: (r.label as string | null) ?? null,
        due_date: r.due_date ? dueDateYmd(r.due_date) : null,
        amount_due: moneyStr(num(r.amount_due as string | number | null)),
        amount_paid: moneyStr(num(r.amount_paid as string | number | null)),
        status: r.status as 'pending' | 'paid' | 'partial',
      };
      const remaining = num(r.remaining as string | number | null);
      return {
        key: `${r.student_id}-${r.id}`,
        studentId: String(r.student_id),
        studentName: formatStudentDisplayName({
          firstName: r.first_name as string,
          secondName: r.second_name as string,
          secondNameEn: r.second_name_en as string,
          lastName: r.last_name as string,
          first_name_ar: r.first_name_ar as string,
          first_name_en: r.first_name_en as string,
          last_name_ar: r.last_name_ar as string,
          last_name_en: r.last_name_en as string,
        }),
        planName: (r.plan_name as string | null) ?? '',
        levelName: (r.level_name as string | null) ?? '',
        installment,
        remaining,
        bucket: String(r.bucket),
      };
    };

    const items = pageRows.map(mapRow);
    const promoParams = [scope];
    const latePromoRows: Array<Record<string, unknown>> = await this.instRepo.manager.query(
      `SELECT
         i.id, i.sequence, i.month_number, i.label, i.due_date, i.amount_due, i.amount_paid, i.status,
         s.student_id,
         st."firstName" AS first_name, st."secondName" AS second_name, st."secondNameEn" AS second_name_en,
         st."lastName" AS last_name, st.first_name_ar, st.first_name_en, st.last_name_ar, st.last_name_en,
         ip.name AS plan_name, lv.name AS level_name,
         'late' AS bucket,
         GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0) AS remaining
       ${unpaid} AND (${bucketSql}) = 'late'
       ORDER BY i.due_date ASC NULLS LAST, i.id ASC
       LIMIT 1`,
      promoParams,
    );
    const nextRows: Array<Record<string, unknown>> = await this.instRepo.manager.query(
      `SELECT
         i.id, i.sequence, i.month_number, i.label, i.due_date, i.amount_due, i.amount_paid, i.status,
         s.student_id,
         st."firstName" AS first_name, st."secondName" AS second_name, st."secondNameEn" AS second_name_en,
         st."lastName" AS last_name, st.first_name_ar, st.first_name_en, st.last_name_ar, st.last_name_en,
         ip.name AS plan_name, lv.name AS level_name,
         (${bucketSql}) AS bucket,
         GREATEST(CAST(i.amount_due AS decimal) - CAST(i.amount_paid AS decimal), 0) AS remaining
       ${unpaid} AND (${bucketSql}) <> 'wait'
       ORDER BY
         CASE (${bucketSql}) WHEN 'late' THEN 0 WHEN 'due' THEN 1 WHEN 'partial' THEN 2 ELSE 4 END,
         i.due_date ASC NULLS LAST
       LIMIT 1`,
      promoParams,
    );

    return {
      ...buildPage(items, total, safePage, limit),
      summary: {
        due_total: moneyStr(num(sheetTotals[0]?.due_total)),
        paid_total: moneyStr(num(sheetTotals[0]?.paid_total)),
        late_amount: moneyStr(num(counts.late_amount)),
        due_today_amount: moneyStr(num(counts.due_today_amount)),
        pending_receipts: Number(pendingRows[0]?.cnt) || 0,
        counts: {
          all: Number(counts.cnt_all) || 0,
          late: Number(counts.late) || 0,
          due: Number(counts.due) || 0,
          partial: Number(counts.partial) || 0,
          upcoming: Number(counts.upcoming) || 0,
          wait: Number(counts.wait) || 0,
        },
        child_dues: childDues.map((r) => ({
          student_id: r.student_id,
          due_total: moneyStr(num(r.due_total)),
        })),
        next_payable: nextRows[0] ? mapRow(nextRows[0]) : null,
        late_promo: latePromoRows[0] ? mapRow(latePromoRows[0]) : null,
      },
    };
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
    const extraLines = await this.extraRepo.find({
      where: { sheet_id: sheet.id },
      relations: ['extraType'],
    });

    const grossDue = lines.reduce((s, l) => s + num(l.due_amount), 0);
    const extraTotal = extraLines.reduce((s, e) => s + num(e.amount), 0);
    const discountTotal = discountLines.reduce((s, d) => s + num(d.amount), 0);
    const chargeable = grossDue + extraTotal;
    if (discountTotal > chargeable) {
      throw new BadRequestException('Total discounts cannot exceed the chargeable amount');
    }

    const netDue = Math.max(0, chargeable - discountTotal);
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

    sheet.list_total = moneyStr(lines.reduce((s, l) => s + num(l.list_amount), 0) + extraTotal);
    sheet.discount_total = moneyStr(discountTotal);
    sheet.extra_total = moneyStr(extraTotal);
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
      extra_total: sheet.extra_total,
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
    const inflight = this.rebuildInFlight.get(studentId);
    if (inflight) return inflight;

    const run = this.buildOrRefreshUnlocked(user, studentId).finally(() => {
      this.rebuildInFlight.delete(studentId);
    });
    this.rebuildInFlight.set(studentId, run);
    return run;
  }

  private async buildOrRefreshUnlocked(
    user: User,
    studentId: string,
  ): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['buses', 'paymentLevel', 'groups'],
    });
    if (!student) throw new NotFoundException('Student not found');
    await this.assertCanView(user, student);

    const feeLevelId = await this.resolveFeeLevelId(student);
    const hasBus = (student.buses ?? []).length > 0;
    const hasCourse = await this.enrollmentRepo.count({
      where: { student_id: studentId, school_id: student.school_id, status: 'active' },
    });
    if (!feeLevelId && !hasBus && !hasCourse) {
      throw new BadRequestException({
        code: 'STUDENT_NO_GRADE',
        message: 'Student must be assigned to a grade before fees can be calculated',
      });
    }

    const year = await this.resolveYear(student.school_id);
    let sheet = await this.sheetRepo.findOne({
      where: { student_id: studentId, academic_year_id: year.id },
      relations: ['lines', 'installments', 'installmentPlan', 'discountLines', 'extraLines'],
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
    const savedExtras = sheet.extraLines ?? [];
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

    if (!savedDiscounts.length && !savedExtras.length) {
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
    }

    await this.extraRepo.delete({ sheet_id: sheet.id });
    if (savedExtras.length) {
      await this.extraRepo.save(
        savedExtras.map((e) =>
          this.extraRepo.create({
            sheet_id: sheet.id,
            extra_type_id: e.extra_type_id,
            amount: e.amount,
            remarks: e.remarks,
          }),
        ),
      );
    }

    if (savedDiscounts.length || savedExtras.length) {
      await this.applyDiscountTotals(sheet);
    }

    return this.getOne(user, sheet.id);
  }

  async getForStudent(user: User, studentId: string) {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['buses', 'groups'],
    });
    if (!student) throw new NotFoundException('Student not found');
    await this.assertCanView(user, student);
    await this.resolveFeeLevelId(student);
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
        'extraLines',
        'extraLines.extraType',
        'student',
        'student.paymentLevel',
      ],
    });
    if (!sheet) {
      return this.buildOrRefresh(user, studentId);
    }

    const sheetHasContent =
      (sheet.lines?.length ?? 0) > 0 ||
      (sheet.installments?.length ?? 0) > 0 ||
      num(sheet.list_total) > 0 ||
      num(sheet.due_total) > 0;

    // Parents are read-only viewers: never auto-rebuild a sheet that already has amounts
    // (parallel payment-list GETs used to race rebuilds and return empty sheets).
    if (this.isParentActor(user) && sheetHasContent) {
      sheet.lines?.sort((a, b) => a.sort_order - b.sort_order);
      sheet.installments?.sort((a, b) => a.sequence - b.sequence);
      return this.decorateSheet(sheet, student);
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
    return this.decorateSheet(sheet, student);
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
        'extraLines',
        'extraLines.extraType',
        'student',
        'student.paymentLevel',
      ],
    });
    if (!sheet) throw new NotFoundException('Charge sheet not found');
    await this.assertCanView(user, sheet.student);
    sheet.lines?.sort((a, b) => a.sort_order - b.sort_order);
    sheet.installments?.sort((a, b) => a.sequence - b.sequence);
    return this.decorateSheet(sheet);
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

  private async replaceExtras(
    sheet: StudentChargeSheet,
    extras: Array<{ extra_type_id: string; amount: number; remarks?: string }>,
  ) {
    const types = await this.extraTypeRepo.find({
      where: { school_id: sheet.school_id, is_active: true },
    });
    const typeIds = new Set(types.map((t) => t.id));
    for (const e of extras) {
      if (!typeIds.has(e.extra_type_id)) {
        throw new BadRequestException('Invalid or inactive extra type');
      }
    }
    await this.extraRepo.delete({ sheet_id: sheet.id });
    if (extras.length) {
      await this.extraRepo.save(
        extras.map((e) =>
          this.extraRepo.create({
            sheet_id: sheet.id,
            extra_type_id: e.extra_type_id,
            amount: moneyStr(e.amount),
            remarks: e.remarks ?? null,
          }),
        ),
      );
    }
  }

  private async replaceInclusions(
    sheet: StudentChargeSheet,
    inclusions: Array<{ inclusion_type_id: string }>,
  ) {
    const types = await this.inclusionTypeRepo.find({
      where: { school_id: sheet.school_id, is_active: true },
    });
    const typeIds = new Set(types.map((t) => t.id));
    const unique = new Map<string, { inclusion_type_id: string }>();
    for (const row of inclusions) {
      if (!typeIds.has(row.inclusion_type_id)) {
        throw new BadRequestException('Invalid or inactive inclusion type');
      }
      unique.set(row.inclusion_type_id, row);
    }
    await this.inclusionRepo.delete({ sheet_id: sheet.id });
    const list = [...unique.values()];
    if (list.length) {
      await this.inclusionRepo.save(
        list.map((row) =>
          this.inclusionRepo.create({
            sheet_id: sheet.id,
            inclusion_type_id: row.inclusion_type_id,
          }),
        ),
      );
    }
    sheet.custom_inclusions = true;
    await this.sheetRepo.update(sheet.id, { custom_inclusions: true });
  }

  /**
   * After enrollment approve: rebuild the year's charge sheet and apply the chosen installment plan.
   * Auth is school-scoped (caller already passed enrollments:approve).
   */
  async seedAfterEnrollment(
    schoolId: string,
    studentId: string,
    installmentPlanId?: string | null,
  ): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    if (String(student.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Student not in enrollment school');
    }
    const actor = {
      role: 'admin',
      school_id: schoolId,
      isSystemUser: true,
    } as User;
    return this.assignPlan(actor, studentId, {
      installment_plan_id: installmentPlanId ?? null,
    });
  }

  async assignPlan(user: User, studentId: string, dto: AssignStudentChargePlanDto) {
    if (user.role !== 'admin' && !user.isSystemUser) throw new ForbiddenException('Admin only');
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
    if (dto.extras) {
      await this.replaceExtras(
        sheet,
        dto.extras.filter((e) => e.extra_type_id && e.amount > 0),
      );
    }
    if (dto.inclusions) {
      await this.replaceInclusions(
        sheet,
        dto.inclusions.filter((i) => i.inclusion_type_id),
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
   * Sheet to settle a receipt against. Prefer the sheet stored on the receipt.
   * Fall back to the active year's sheet, then the student's latest sheet, so
   * confirm does not fail when no year is flagged active.
   */
  private async sheetForSettlement(
    student: Student,
    sheetId?: string | null,
  ): Promise<StudentChargeSheet> {
    if (sheetId) {
      const byId = await this.sheetRepo.findOne({ where: { id: sheetId } });
      if (byId) {
        if (byId.student_id !== student.id) {
          throw new BadRequestException('Charge sheet does not belong to this student');
        }
        return byId;
      }
    }
    const active = await this.yearRepo.findOne({
      where: { school_id: student.school_id, is_active: true },
      order: { start_date: 'DESC' },
    });
    if (active) {
      const current = await this.sheetRepo.findOne({
        where: { student_id: student.id, academic_year_id: active.id },
      });
      if (current) return current;
    }
    const latest = await this.sheetRepo.findOne({
      where: { student_id: student.id, school_id: student.school_id },
      order: { created_at: 'DESC' },
    });
    if (!latest) throw new NotFoundException('Charge sheet not found');
    return latest;
  }

  /**
   * Apply a confirmed payment to the charge sheet (no role check — caller must authorize).
   */
  private async applyAmountToInstallments(
    rows: StudentChargeSheetInstallment[],
    amount: number,
    skipId?: string | null,
  ): Promise<number> {
    let remaining = amount;
    const ordered = [...rows].sort((a, b) => a.sequence - b.sequence);
    for (const inst of ordered) {
      if (remaining <= 0.001) break;
      if (skipId && inst.id === skipId) continue;
      const balance = num(inst.amount_due) - num(inst.amount_paid);
      if (balance <= 0.001) continue;
      const pay = Math.min(remaining, balance);
      inst.amount_paid = moneyStr(num(inst.amount_paid) + pay);
      inst.status = this.installmentStatus(num(inst.amount_due), num(inst.amount_paid));
      remaining -= pay;
      await this.instRepo.save(inst);
    }
    return remaining > 0.001 ? remaining : 0;
  }

  private async applyAmountToUpfrontLines(sheetId: string, amount: number): Promise<number> {
    let remaining = amount;
    const lines = await this.lineRepo.find({
      where: { sheet_id: sheetId },
      order: { sort_order: 'ASC' },
    });
    const upfrontLines = lines.filter(
      (l) => l.payment_timing === 'upfront' && num(l.due_amount) > num(l.paid_amount),
    );
    for (const line of upfrontLines) {
      if (remaining <= 0.001) break;
      const lineDue = num(line.due_amount) - num(line.paid_amount);
      const pay = Math.min(remaining, lineDue);
      if (pay <= 0.001) continue;
      line.paid_amount = moneyStr(num(line.paid_amount) + pay);
      if (num(line.paid_amount) >= num(line.due_amount)) line.status = 'paid';
      remaining -= pay;
      await this.lineRepo.save(line);
    }
    return remaining > 0.001 ? remaining : 0;
  }

  private async reloadSheetAfterApply(sheetId: string): Promise<StudentChargeSheet> {
    try {
      const full = await this.sheetRepo.findOne({
        where: { id: sheetId },
        relations: [
          'lines',
          'lines.chargeType',
          'installments',
          'installmentPlan',
          'installmentPlan.entries',
          'discountLines',
          'discountLines.discountType',
          'extraLines',
          'extraLines.extraType',
          'student',
          'student.paymentLevel',
        ],
      });
      if (!full) throw new NotFoundException('Charge sheet not found');
      full.lines?.sort((a, b) => a.sort_order - b.sort_order);
      full.installments?.sort((a, b) => a.sequence - b.sequence);
      return await this.decorateSheet(full);
    } catch (err) {
      this.logger.warn(
        `Charge sheet reload after payment apply failed for ${sheetId}: ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      const fallback = await this.sheetRepo.findOne({
        where: { id: sheetId },
        relations: ['lines', 'installments'],
      });
      if (!fallback) throw new NotFoundException('Charge sheet not found');
      fallback.lines?.sort((a, b) => a.sort_order - b.sort_order);
      fallback.installments?.sort((a, b) => a.sequence - b.sequence);
      return fallback;
    }
  }

  async applyConfirmedPayment(opts: {
    studentId: string;
    sheetId?: string | null;
    targetType: 'upfront' | 'installment';
    installmentId?: string | null;
    amount: number;
  }): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({ where: { id: opts.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const sheet = await this.sheetForSettlement(student, opts.sheetId);

    const amount = num(opts.amount);
    if (!(amount > 0)) throw new BadRequestException('Payment amount must be greater than zero');

    const installments = await this.instRepo.find({
      where: { sheet_id: sheet.id },
      order: { sequence: 'ASC' },
    });
    const target =
      opts.targetType === 'installment' && opts.installmentId
        ? installments.find((row) => row.id === opts.installmentId)
        : undefined;
    if (target && num(target.amount_due) - num(target.amount_paid) <= 0.001) {
      return this.reloadSheetAfterApply(sheet.id);
    }

    const lines = await this.lineRepo.find({ where: { sheet_id: sheet.id } });
    const upfrontOpen = lines
      .filter((l) => l.payment_timing === 'upfront')
      .reduce((s, l) => s + Math.max(0, num(l.due_amount) - num(l.paid_amount)), 0);
    const installmentOpen = installments.reduce(
      (s, i) => s + Math.max(0, num(i.amount_due) - num(i.amount_paid)),
      0,
    );
    if (amount > installmentOpen + upfrontOpen + 0.001) {
      throw new BadRequestException('Payment exceeds balance due');
    }

    let leftover = amount;
    if (opts.targetType === 'installment') {
      if (target) leftover = await this.applyAmountToInstallments([target], leftover);
      leftover = await this.applyAmountToInstallments(installments, leftover, target?.id);
      leftover = await this.applyAmountToUpfrontLines(sheet.id, leftover);
    } else {
      leftover = await this.applyAmountToUpfrontLines(sheet.id, leftover);
      leftover = await this.applyAmountToInstallments(installments, leftover);
    }
    if (leftover > 0.001) {
      this.logger.warn(`Payment apply leftover ${leftover} on sheet ${sheet.id}`);
    }
    await this.updatePaidTotal(sheet.id);
    return this.reloadSheetAfterApply(sheet.id);
  }

  /**
   * Apply an admin-chosen split of an over-balance payment: each allocation is capped at its
   * target's remaining balance, and whatever the admin does not allocate is kept as account credit.
   */
  async applyManualAllocation(opts: {
    studentId: string;
    sheetId?: string | null;
    totalAmount: number;
    allocations: Array<{ installmentId?: string | null; lineId?: string | null; amount: number }>;
  }): Promise<StudentChargeSheet> {
    const student = await this.studentRepo.findOne({ where: { id: opts.studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const sheet = await this.sheetForSettlement(student, opts.sheetId);

    const total = num(opts.totalAmount);
    if (!(total > 0)) throw new BadRequestException('Payment amount must be greater than zero');

    const allocations = (opts.allocations || []).filter((a) => num(a.amount) > 0);
    const allocatedSum = allocations.reduce((s, a) => s + num(a.amount), 0);
    if (allocatedSum > total + 0.001) {
      throw new BadRequestException('Allocated amount exceeds the payment');
    }

    const installments = await this.instRepo.find({ where: { sheet_id: sheet.id } });
    const lines = await this.lineRepo.find({ where: { sheet_id: sheet.id } });

    for (const alloc of allocations) {
      const pay = num(alloc.amount);
      if (alloc.installmentId) {
        const inst = installments.find((i) => i.id === alloc.installmentId);
        if (!inst) throw new BadRequestException('Installment not found on this sheet');
        const balance = num(inst.amount_due) - num(inst.amount_paid);
        if (pay > balance + 0.001) {
          throw new BadRequestException('Allocation exceeds the installment balance');
        }
        inst.amount_paid = moneyStr(num(inst.amount_paid) + pay);
        inst.status = this.installmentStatus(num(inst.amount_due), num(inst.amount_paid));
        await this.instRepo.save(inst);
      } else if (alloc.lineId) {
        const line = lines.find((l) => l.id === alloc.lineId);
        if (!line) throw new BadRequestException('Charge not found on this sheet');
        const balance = num(line.due_amount) - num(line.paid_amount);
        if (pay > balance + 0.001) {
          throw new BadRequestException('Allocation exceeds the charge balance');
        }
        line.paid_amount = moneyStr(num(line.paid_amount) + pay);
        if (num(line.paid_amount) >= num(line.due_amount)) line.status = 'paid';
        await this.lineRepo.save(line);
      } else {
        throw new BadRequestException('Each allocation needs an installment or charge');
      }
    }

    // Whatever the admin left unallocated becomes an advance on the account.
    const credit = Math.max(0, total - allocatedSum);
    if (credit > 0.001) {
      sheet.credit_balance = moneyStr(num(sheet.credit_balance) + credit);
      await this.sheetRepo.save(sheet);
    }

    await this.updatePaidTotal(sheet.id);
    return this.reloadSheetAfterApply(sheet.id);
  }

  async remainingForTarget(
    studentId: string,
    targetType: 'upfront' | 'installment',
    installmentId?: string | null,
  ): Promise<{ sheet: StudentChargeSheet; remaining: number }> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const sheet = await this.sheetForSettlement(student, null);

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
      sheetId: inst.sheet_id,
      targetType: 'installment',
      installmentId,
      amount: dto.amount,
    });
  }
}
