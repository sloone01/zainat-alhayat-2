import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { GradeFeeLink } from '../entities/grade-fee-link.entity';
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
import {
  AssignStudentChargePlanDto,
  RecordChargePaymentDto,
  SetChargeSheetDiscountsDto,
} from '../dto/fees-v2.dto';
import { moneyStr, num, splitByWeights } from '../utils/fees-v2.util';

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

  private async resolveYear(schoolId: number): Promise<AcademicYear> {
    const active = await this.yearRepo.findOne({
      where: { school_id: schoolId, is_active: true },
    });
    if (!active) {
      throw new BadRequestException('No active academic year');
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
        ],
      });
      if (link?.feePackage) {
        const meta = link.feePackage.chargeTypeLinks ?? [];
        for (const line of link.lines ?? []) {
          const m = this.packageChargeMeta(meta, line.charge_type_id);
          out.push({
            charge_type_id: line.charge_type_id,
            charge_label: line.chargeType?.label ?? line.charge_type_id,
            source_type: 'grade',
            source_ref_id: link.level_id,
            list_amount: num(line.amount),
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
      for (const line of link.lines ?? []) {
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
      for (const line of link.lines ?? []) {
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

  private async recomputeInstallments(sheet: StudentChargeSheet) {
    await this.instRepo.delete({ sheet_id: sheet.id });
    const installmentDue = num(sheet.installment_due);
    if (installmentDue <= 0 || !sheet.installment_plan_id) return;

    const plan = await this.planRepo.findOne({
      where: { id: sheet.installment_plan_id },
      relations: ['entries'],
    });
    if (!plan?.entries?.length) return;

    const entries = [...plan.entries].sort((a, b) => a.sequence - b.sequence);
    const weights = entries.map((e) => num(e.weight) || 1);
    const amounts = splitByWeights(installmentDue, weights);

    const rows = entries.map((e, i) =>
      this.instRepo.create({
        sheet_id: sheet.id,
        sequence: e.sequence,
        month_number: e.month_number,
        label: e.label,
        amount_due: moneyStr(amounts[i] ?? 0),
        amount_paid: '0.00',
        status: 'pending',
      }),
    );
    await this.instRepo.save(rows);
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
    let installmentDue = 0;
    if (timingGross > 0) {
      upfrontDue = netDue * (upfrontGross / timingGross);
      installmentDue = netDue - upfrontDue;
    }

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
    await this.sheetRepo.save(sheet);
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
      throw new BadRequestException(
        'Student must be assigned to a grade before fees can be calculated',
      );
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
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
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
    return sheet;
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

  async assignPlan(user: User, studentId: string, dto: AssignStudentChargePlanDto) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    const sheet = await this.getForStudent(user, studentId);
    if (dto.installment_plan_id) {
      const plan = await this.planRepo.findOne({
        where: { id: dto.installment_plan_id, school_id: sheet.school_id },
      });
      if (!plan) throw new NotFoundException('Installment plan not found');
    }
    sheet.installment_plan_id = dto.installment_plan_id ?? null;
    sheet.status = num(sheet.due_total) > 0 ? 'active' : 'settled';
    await this.sheetRepo.save(sheet);
    await this.recomputeInstallments(sheet);
    return this.getOne(user, sheet.id);
  }

  async setDiscounts(user: User, studentId: string, dto: SetChargeSheetDiscountsDto) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    const sheet = await this.getForStudent(user, studentId);

    const types = await this.discountTypeRepo.find({
      where: { school_id: sheet.school_id, is_active: true },
    });
    const typeIds = new Set(types.map((t) => t.id));

    for (const d of dto.discounts) {
      if (!typeIds.has(d.discount_type_id)) {
        throw new BadRequestException('Invalid or inactive discount type');
      }
    }

    await this.discountRepo.delete({ sheet_id: sheet.id });
    if (dto.discounts.length) {
      await this.discountRepo.save(
        dto.discounts.map((d) =>
          this.discountRepo.create({
            sheet_id: sheet.id,
            discount_type_id: d.discount_type_id,
            amount: moneyStr(d.amount),
            remarks: d.remarks ?? null,
          }),
        ),
      );
    }
    await this.applyDiscountTotals(sheet);
    return this.getOne(user, sheet.id);
  }

  async recordUpfrontPayment(user: User, studentId: string, dto: RecordChargePaymentDto) {
    if (user.role !== 'admin' && user.role !== 'parent') {
      throw new ForbiddenException('Not allowed');
    }
    const sheet = await this.getForStudent(user, studentId);
    let remaining = dto.amount;

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
    return this.getOne(user, sheet.id);
  }

  async recordInstallmentPayment(
    user: User,
    installmentId: string,
    dto: RecordChargePaymentDto,
  ) {
    if (user.role !== 'admin' && user.role !== 'parent') {
      throw new ForbiddenException('Not allowed');
    }
    const inst = await this.instRepo.findOne({
      where: { id: installmentId },
      relations: ['sheet', 'sheet.student'],
    });
    if (!inst) throw new NotFoundException('Installment not found');
    await this.assertCanView(user, inst.sheet.student);

    const balance = num(inst.amount_due) - num(inst.amount_paid);
    if (dto.amount > balance + 0.001) {
      throw new BadRequestException('Payment exceeds installment balance');
    }

    inst.amount_paid = moneyStr(num(inst.amount_paid) + dto.amount);
    if (num(inst.amount_paid) >= num(inst.amount_due)) inst.status = 'paid';
    else if (num(inst.amount_paid) > 0) inst.status = 'partial';
    await this.instRepo.save(inst);

    await this.updatePaidTotal(inst.sheet_id);
    return this.getOne(user, inst.sheet_id);
  }
}
