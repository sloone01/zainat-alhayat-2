import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { StudentPayment } from '../entities/student-payment.entity';
import { StudentFeeCharge } from '../entities/student-fee-charge.entity';
import { PaymentTransaction } from '../entities/payment-transaction.entity';
import { PaymentTransactionAllocation } from '../entities/payment-transaction-allocation.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import { LevelPaymentProfile } from '../entities/level-payment-profile.entity';
import { LevelPaymentInstallment } from '../entities/level-payment-installment.entity';
import { StudentPaymentInstallmentReceipt } from '../entities/student-payment-installment-receipt.entity';
import {
  DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE,
  type PaymentChargeBillingOccurrence,
} from '../constants/payment-charge-billing-occurrence';

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function moneyStr(n: number): string {
  return roundMoney(n).toFixed(2);
}

function num(v: string | number | null | undefined): number {
  const n = Number(v);
  return Number.isNaN(n) ? 0 : n;
}

export type FeeChargeRow = {
  id: string;
  charge_type_id: string;
  charge_code: string;
  charge_label: string;
  billing_occurrence: PaymentChargeBillingOccurrence;
  academic_year_id: string | null;
  amount_due: number;
  amount_paid: number;
  balance: number;
  currency: string;
  is_satisfied: boolean;
};

export type AllocationPreviewLine = {
  student_fee_charge_id: string;
  charge_type_id: string;
  charge_label: string;
  billing_occurrence: PaymentChargeBillingOccurrence;
  amount: number;
  level_payment_installment_id: string | null;
  installment_sequence: number | null;
};

export type PaymentAllocationPreview = {
  academic_year_id: string | null;
  academic_year_label: string | null;
  total_amount: number;
  allocated_total: number;
  unallocated: number;
  lines: AllocationPreviewLine[];
};

export type PaymentTransactionSummary = {
  id: string;
  total_amount: number;
  currency: string;
  paid_at: string;
  remarks: string | null;
  academic_year_id: string | null;
  allocations: Array<{
    charge_type_id: string;
    charge_label: string;
    amount: number;
    level_payment_installment_id: string | null;
  }>;
};

export type RecordPaymentDto = {
  amount: number;
  academic_year_id?: string | null;
  remarks?: string | null;
  target_installment_id?: string | null;
  paid_at?: string | null;
};

@Injectable()
export class StudentPaymentLedgerService {
  constructor(
    @InjectRepository(StudentFeeCharge)
    private readonly feeChargeRepo: Repository<StudentFeeCharge>,
    @InjectRepository(PaymentTransaction)
    private readonly transactionRepo: Repository<PaymentTransaction>,
    @InjectRepository(PaymentTransactionAllocation)
    private readonly allocationRepo: Repository<PaymentTransactionAllocation>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepo: Repository<AcademicYear>,
    @InjectRepository(LevelPaymentProfile)
    private readonly profileRepo: Repository<LevelPaymentProfile>,
    @InjectRepository(LevelPaymentInstallment)
    private readonly installmentRepo: Repository<LevelPaymentInstallment>,
    @InjectRepository(StudentPaymentInstallmentReceipt)
    private readonly installmentReceiptRepo: Repository<StudentPaymentInstallmentReceipt>,
    private readonly dataSource: DataSource,
  ) {}

  async resolveAcademicYear(schoolId: number, academicYearId?: string | null): Promise<AcademicYear> {
    if (academicYearId) {
      const row = await this.academicYearRepo.findOne({ where: { id: academicYearId, school_id: schoolId } });
      if (!row) throw new NotFoundException('Academic year not found');
      return row;
    }
    const active = await this.academicYearRepo.findOne({
      where: { school_id: schoolId, is_active: true },
      order: { start_date: 'DESC' },
    });
    if (!active) {
      throw new BadRequestException(
        'No active academic year. Activate an academic year in system settings before recording payments.',
      );
    }
    return active;
  }

  async syncFeeChargesForPayment(studentPayment: StudentPayment): Promise<FeeChargeRow[]> {
    if (!studentPayment.level_payment_profile_id || studentPayment.course_id) {
      return [];
    }

    const profile = await this.profileRepo.findOne({
      where: { id: studentPayment.level_payment_profile_id },
      relations: ['chargeLines', 'chargeLines.chargeType'],
    });
    if (!profile?.chargeLines?.length) return [];

    const academicYear = await this.resolveAcademicYear(studentPayment.school_id);
    const currency = (studentPayment.currency ?? 'OMR').trim().slice(0, 3).toUpperCase();
    const yearlyLines = profile.chargeLines.filter(
      (l) => (l.billing_period ?? 'yearly') === 'yearly',
    );

    for (const line of yearlyLines) {
      const ct = line.chargeType;
      if (!ct) continue;
      const occurrence: PaymentChargeBillingOccurrence =
        ct.billing_occurrence ?? DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE;
      const due = roundMoney(num(line.amount));

      if (occurrence === 'once_ever') {
        let row = await this.feeChargeRepo.findOne({
          where: {
            student_payment_id: studentPayment.id,
            charge_type_id: line.charge_type_id,
            billing_occurrence: 'once_ever',
          },
        });
        if (row && num(row.amount_paid) >= num(row.amount_due) && num(row.amount_due) > 0) {
          continue;
        }
        if (!row) {
          row = this.feeChargeRepo.create({
            student_id: studentPayment.student_id,
            school_id: studentPayment.school_id,
            student_payment_id: studentPayment.id,
            academic_year_id: academicYear.id,
            charge_type_id: line.charge_type_id,
            billing_occurrence: 'once_ever',
            amount_due: moneyStr(due),
            amount_paid: '0.00',
            currency,
          });
        } else if (due > num(row.amount_due)) {
          row.amount_due = moneyStr(due);
        }
        await this.feeChargeRepo.save(row);
        continue;
      }

      let row = await this.feeChargeRepo.findOne({
        where: {
          student_payment_id: studentPayment.id,
          charge_type_id: line.charge_type_id,
          academic_year_id: academicYear.id,
          billing_occurrence: occurrence === 'other' ? 'other' : 'per_year',
        },
      });
      if (!row) {
        row = this.feeChargeRepo.create({
          student_id: studentPayment.student_id,
          school_id: studentPayment.school_id,
          student_payment_id: studentPayment.id,
          academic_year_id: academicYear.id,
          charge_type_id: line.charge_type_id,
          billing_occurrence: occurrence === 'other' ? 'other' : 'per_year',
          amount_due: moneyStr(due),
          amount_paid: '0.00',
          currency,
        });
      } else {
        row.amount_due = moneyStr(due);
      }
      await this.feeChargeRepo.save(row);
    }

    return this.listFeeCharges(studentPayment.id);
  }

  async listFeeCharges(studentPaymentId: string): Promise<FeeChargeRow[]> {
    const rows = await this.feeChargeRepo.find({
      where: { student_payment_id: studentPaymentId },
      relations: ['chargeType'],
      order: { created_at: 'ASC' },
    });
    return rows.map((r) => this.serializeFeeCharge(r));
  }

  private serializeFeeCharge(r: StudentFeeCharge): FeeChargeRow {
    const due = num(r.amount_due);
    const paid = num(r.amount_paid);
    const balance = roundMoney(Math.max(0, due - paid));
    return {
      id: r.id,
      charge_type_id: r.charge_type_id,
      charge_code: r.chargeType?.code ?? '',
      charge_label: r.chargeType?.label ?? r.charge_type_id,
      billing_occurrence: r.billing_occurrence,
      academic_year_id: r.academic_year_id,
      amount_due: due,
      amount_paid: paid,
      balance,
      currency: r.currency,
      is_satisfied: balance <= 0.001,
    };
  }

  async previewAllocation(
    studentPayment: StudentPayment,
    dto: RecordPaymentDto,
  ): Promise<PaymentAllocationPreview> {
    await this.syncFeeChargesForPayment(studentPayment);
    const academicYear = await this.resolveAcademicYear(
      studentPayment.school_id,
      dto.academic_year_id,
    );
    const amount = roundMoney(Number(dto.amount));
    if (amount <= 0) throw new BadRequestException('Amount must be positive');

    const lines = await this.buildWaterfall(
      studentPayment,
      academicYear.id,
      amount,
      dto.target_installment_id ?? null,
    );
    const allocated = roundMoney(lines.reduce((s, l) => s + l.amount, 0));
    return {
      academic_year_id: academicYear.id,
      academic_year_label: academicYear.year,
      total_amount: amount,
      allocated_total: allocated,
      unallocated: roundMoney(amount - allocated),
      lines,
    };
  }

  private async buildWaterfall(
    studentPayment: StudentPayment,
    academicYearId: string,
    amount: number,
    targetInstallmentId: string | null,
  ): Promise<AllocationPreviewLine[]> {
    const charges = await this.feeChargeRepo.find({
      where: { student_payment_id: studentPayment.id },
      relations: ['chargeType'],
    });

    const openCharges = charges
      .map((c) => ({ c, balance: roundMoney(num(c.amount_due) - num(c.amount_paid)) }))
      .filter((x) => x.balance > 0.001)
      .filter((x) => {
        if (x.c.billing_occurrence === 'once_ever') return true;
        return x.c.academic_year_id === academicYearId;
      });

    const onceEver = openCharges.filter((x) => x.c.billing_occurrence === 'once_ever');
    const perYear = openCharges.filter((x) => x.c.billing_occurrence !== 'once_ever');

    let remaining = amount;
    const lines: AllocationPreviewLine[] = [];
    let installmentTag: string | null = targetInstallmentId;
    let installmentSeq: number | null = null;

    if (targetInstallmentId) {
      const inst = await this.installmentRepo.findOne({
        where: { id: targetInstallmentId, profile_id: studentPayment.level_payment_profile_id! },
      });
      if (!inst) throw new NotFoundException('Installment not found on this fee profile');
      installmentSeq = inst.sequence;
      const receipt = await this.installmentReceiptRepo.findOne({
        where: {
          student_payment_id: studentPayment.id,
          level_payment_installment_id: targetInstallmentId,
        },
      });
      const instPaid = receipt ? num(receipt.amount) : 0;
      const instDue = roundMoney(num(inst.amount) - instPaid);
      if (instDue > 0) {
        remaining = Math.min(remaining, instDue);
      }
    }

    const pushAlloc = (
      entry: (typeof openCharges)[0],
      alloc: number,
      instId: string | null,
      seq: number | null,
    ) => {
      if (alloc <= 0) return;
      lines.push({
        student_fee_charge_id: entry.c.id,
        charge_type_id: entry.c.charge_type_id,
        charge_label: entry.c.chargeType?.label ?? entry.c.charge_type_id,
        billing_occurrence: entry.c.billing_occurrence,
        amount: roundMoney(alloc),
        level_payment_installment_id: instId,
        installment_sequence: seq,
      });
    };

    const fillBucket = (bucket: typeof openCharges) => {
      for (const entry of bucket) {
        if (remaining <= 0.001) break;
        const take = Math.min(entry.balance, remaining);
        pushAlloc(entry, take, installmentTag, installmentSeq);
        remaining = roundMoney(remaining - take);
        entry.balance = roundMoney(entry.balance - take);
      }
    };

    fillBucket(onceEver);
    fillBucket(perYear);

    return lines;
  }

  async recordPayment(
    user: User,
    studentPayment: StudentPayment,
    dto: RecordPaymentDto,
  ): Promise<{ transaction: PaymentTransactionSummary; feeCharges: FeeChargeRow[] }> {
    const preview = await this.previewAllocation(studentPayment, dto);
    if (preview.lines.length === 0) {
      throw new BadRequestException(
        'No open charges to allocate this payment to. All once-only fees may already be paid, or there is nothing due for this year.',
      );
    }
    if (preview.unallocated > 0.01) {
      throw new BadRequestException(
        `Payment could not be fully allocated. Unallocated: ${preview.unallocated.toFixed(2)} ${studentPayment.currency}`,
      );
    }

    const academicYear = await this.resolveAcademicYear(
      studentPayment.school_id,
      dto.academic_year_id ?? preview.academic_year_id,
    );
    const paidAt = dto.paid_at ? new Date(dto.paid_at) : new Date();
    if (Number.isNaN(paidAt.getTime())) {
      throw new BadRequestException('Invalid paid_at');
    }

    const saved = await this.dataSource.transaction(async (em) => {
      const tx = em.create(PaymentTransaction, {
        student_id: studentPayment.student_id,
        school_id: studentPayment.school_id,
        student_payment_id: studentPayment.id,
        academic_year_id: academicYear.id,
        total_amount: moneyStr(preview.total_amount),
        currency: studentPayment.currency,
        paid_at: paidAt,
        recorded_by_user_id: user.id ?? null,
        remarks: (dto.remarks ?? '').trim() || null,
      });
      await em.save(tx);

      const installmentTotals = new Map<string, number>();

      for (const line of preview.lines) {
        const charge = await em.findOne(StudentFeeCharge, {
          where: { id: line.student_fee_charge_id },
          lock: { mode: 'pessimistic_write' },
        });
        if (!charge) throw new NotFoundException('Fee charge not found');
        const newPaid = roundMoney(num(charge.amount_paid) + line.amount);
        if (newPaid > num(charge.amount_due) + 0.01) {
          throw new BadRequestException(`Payment exceeds balance for ${line.charge_label}`);
        }
        charge.amount_paid = moneyStr(newPaid);
        await em.save(charge);

        await em.save(
          em.create(PaymentTransactionAllocation, {
            payment_transaction_id: tx.id,
            student_fee_charge_id: line.student_fee_charge_id,
            charge_type_id: line.charge_type_id,
            level_payment_installment_id: line.level_payment_installment_id,
            amount: moneyStr(line.amount),
          }),
        );

        if (line.level_payment_installment_id) {
          const prev = installmentTotals.get(line.level_payment_installment_id) ?? 0;
          installmentTotals.set(
            line.level_payment_installment_id,
            roundMoney(prev + line.amount),
          );
        }
      }

      for (const [installmentId, instAmount] of installmentTotals) {
        const existing = await em.findOne(StudentPaymentInstallmentReceipt, {
          where: {
            student_payment_id: studentPayment.id,
            level_payment_installment_id: installmentId,
          },
        });
        if (existing) {
          existing.amount = moneyStr(roundMoney(num(existing.amount) + instAmount));
          existing.paid_at = paidAt;
          existing.remarks = (dto.remarks ?? '').trim() || existing.remarks;
          await em.save(existing);
        } else {
          await em.save(
            em.create(StudentPaymentInstallmentReceipt, {
              student_payment_id: studentPayment.id,
              level_payment_installment_id: installmentId,
              amount: moneyStr(instAmount),
              paid_at: paidAt,
              remarks: (dto.remarks ?? '').trim() || null,
            }),
          );
        }
      }

      return tx;
    });

    const summary = await this.getTransactionSummary(saved.id);
    const feeCharges = await this.listFeeCharges(studentPayment.id);
    return { transaction: summary, feeCharges };
  }

  async listTransactions(studentPaymentId: string, limit = 20): Promise<PaymentTransactionSummary[]> {
    const rows = await this.transactionRepo.find({
      where: { student_payment_id: studentPaymentId },
      order: { paid_at: 'DESC' },
      take: limit,
    });
    const out: PaymentTransactionSummary[] = [];
    for (const r of rows) {
      out.push(await this.getTransactionSummary(r.id));
    }
    return out;
  }

  async getTransactionSummary(transactionId: string): Promise<PaymentTransactionSummary> {
    const tx = await this.transactionRepo.findOne({ where: { id: transactionId } });
    if (!tx) throw new NotFoundException('Payment transaction not found');
    const allocations = await this.allocationRepo.find({
      where: { payment_transaction_id: transactionId },
      relations: ['chargeType'],
    });
    return {
      id: tx.id,
      total_amount: num(tx.total_amount),
      currency: tx.currency,
      paid_at: tx.paid_at instanceof Date ? tx.paid_at.toISOString() : String(tx.paid_at),
      remarks: tx.remarks,
      academic_year_id: tx.academic_year_id,
      allocations: allocations.map((a) => ({
        charge_type_id: a.charge_type_id,
        charge_label: a.chargeType?.label ?? a.charge_type_id,
        amount: num(a.amount),
        level_payment_installment_id: a.level_payment_installment_id,
      })),
    };
  }

  async reverseInstallmentPayment(
    studentPayment: StudentPayment,
    installmentId: string,
  ): Promise<void> {
    const allocations = await this.allocationRepo
      .createQueryBuilder('a')
      .innerJoin('a.paymentTransaction', 't')
      .where('t.student_payment_id = :spid', { spid: studentPayment.id })
      .andWhere('a.level_payment_installment_id = :iid', { iid: installmentId })
      .getMany();

    if (allocations.length) {
      await this.dataSource.transaction(async (em) => {
        const txIds = new Set<string>();
        for (const a of allocations) {
          txIds.add(a.payment_transaction_id);
          const charge = await em.findOne(StudentFeeCharge, {
            where: { id: a.student_fee_charge_id },
            lock: { mode: 'pessimistic_write' },
          });
          if (charge) {
            charge.amount_paid = moneyStr(
              Math.max(0, roundMoney(num(charge.amount_paid) - num(a.amount))),
            );
            await em.save(charge);
          }
          await em.remove(a);
        }
        for (const txId of txIds) {
          const left = await em.count(PaymentTransactionAllocation, {
            where: { payment_transaction_id: txId },
          });
          if (left === 0) {
            await em.delete(PaymentTransaction, { id: txId });
          } else {
            const allocs = await em.find(PaymentTransactionAllocation, {
              where: { payment_transaction_id: txId },
            });
            const total = roundMoney(allocs.reduce((s, x) => s + num(x.amount), 0));
            await em.update(PaymentTransaction, { id: txId }, { total_amount: moneyStr(total) });
          }
        }
      });
    }

    const receipt = await this.installmentReceiptRepo.findOne({
      where: {
        student_payment_id: studentPayment.id,
        level_payment_installment_id: installmentId,
      },
    });
    if (receipt) await this.installmentReceiptRepo.remove(receipt);
  }
}
