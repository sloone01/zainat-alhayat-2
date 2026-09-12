import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, IsNull, Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { Parent } from '../entities/parent.entity';
import { School } from '../entities/school.entity';
import { StudentFeePayment } from '../entities/student-fee-payment.entity';
import { Payment, type PaymentMethod, type PaymentStatus } from '../entities/payment.entity';
import { FeeTransfer } from '../entities/fee-transfer.entity';
import { FeeTransferLine } from '../entities/fee-transfer-line.entity';
import { StudentChargeSheetService } from './student-charge-sheet.service';
import { ThawaniService } from './thawani.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { moneyStr, num } from '../utils/fees-v2.util';

const OPEN_STATUSES = ['pending', 'pending_approval', 'pending_reconcile'] as const;
const SCHOOL_INBOX_STATUSES = ['pending_approval', 'pending_reconcile'] as const;

function isPlatformOperator(user: User): boolean {
  return !!(user.isSuperAdmin || user.isSystemUser || user.user_type === 'platform');
}

function randomRefSuffix(len = 6): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < len; i += 1) {
    out += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return out;
}

@Injectable()
export class FeePaymentService {
  private readonly logger = new Logger(FeePaymentService.name);

  constructor(
    @InjectRepository(StudentFeePayment)
    private readonly paymentRepo: Repository<StudentFeePayment>,
    @InjectRepository(Payment)
    private readonly paymentsRepo: Repository<Payment>,
    @InjectRepository(FeeTransfer)
    private readonly transferRepo: Repository<FeeTransfer>,
    @InjectRepository(FeeTransferLine)
    private readonly transferLineRepo: Repository<FeeTransferLine>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    private readonly chargeSheets: StudentChargeSheetService,
    private readonly thawani: ThawaniService,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  private async nextPaymentRef(em?: EntityManager): Promise<string> {
    const repo = em ? em.getRepository(Payment) : this.paymentsRepo;
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const ref = `PAY-${day}-${randomRefSuffix()}`;
      const exists = await repo.exist({ where: { payment_ref: ref } });
      if (!exists) return ref;
    }
    throw new BadRequestException('Could not allocate payment reference');
  }

  private async createPaymentHeader(
    input: {
      school_id: string;
      student_id?: string | null;
      amount: string;
      method: PaymentMethod;
      status: PaymentStatus;
      proof_url?: string | null;
      proof_original_name?: string | null;
      remarks?: string | null;
      submitted_by?: string | null;
    },
    em?: EntityManager,
  ): Promise<Payment> {
    const repo = em ? em.getRepository(Payment) : this.paymentsRepo;
    const payment_ref = await this.nextPaymentRef(em);
    return repo.save(
      repo.create({
        school_id: input.school_id,
        student_id: input.student_id ?? null,
        payment_ref,
        amount: input.amount,
        method: input.method,
        status: input.status,
        proof_url: input.proof_url ?? null,
        proof_original_name: input.proof_original_name ?? null,
        remarks: input.remarks ?? null,
        submitted_by: input.submitted_by ?? null,
      }),
    );
  }

  private async syncPaymentStatus(
    paymentId: string | null | undefined,
    status: PaymentStatus,
    em?: EntityManager,
  ): Promise<void> {
    if (!paymentId) return;
    const repo = em ? em.getRepository(Payment) : this.paymentsRepo;
    await repo.update({ id: paymentId }, { status });
  }

  async listForStudent(user: User, studentId: string): Promise<StudentFeePayment[]> {
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    await this.chargeSheets.assertCanView(user, student);
    return this.paymentRepo.find({
      where: { student_id: studentId },
      relations: ['submittedByUser', 'reviewedByUser', 'payment'],
      order: { created_at: 'DESC' },
    });
  }

  async listPendingForSchool(user: User): Promise<StudentFeePayment[]> {
    if (!isPlatformOperator(user) && user.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }
    const where = isPlatformOperator(user)
      ? { status: 'pending_approval' as const }
      : user.school_id == null
        ? null
        : {
            school_id: String(user.school_id),
            status: In([...SCHOOL_INBOX_STATUSES]),
            method: In(['offline', 'admin'] as const),
          };
    if (!where) return [];
    return this.paymentRepo.find({
      where,
      relations: ['student', 'submittedByUser', 'school', 'payment'],
      order: { created_at: 'ASC' },
    });
  }

  async listReadyToTransfer(user: User): Promise<StudentFeePayment[]> {
    if (!isPlatformOperator(user)) {
      throw new ForbiddenException('Only system administrators can build transfers');
    }
    return this.paymentRepo.find({
      where: { method: 'thawani', status: 'paid', transfer_id: IsNull() },
      relations: ['student', 'submittedByUser', 'school', 'payment'],
      order: { school_id: 'ASC', paid_at: 'ASC', created_at: 'ASC' },
    });
  }

  async listTransfers(user: User): Promise<FeeTransfer[]> {
    if (!isPlatformOperator(user) && user.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }
    const where = isPlatformOperator(user)
      ? {}
      : user.school_id == null
        ? null
        : { school_id: String(user.school_id) };
    if (!where) return [];
    return this.transferRepo.find({
      where,
      relations: ['school', 'createdByUser', 'reviewedByUser', 'lines', 'lines.payment', 'lines.payment.student'],
      order: { created_at: 'DESC' },
    });
  }

  async submitOffline(
    user: User,
    studentId: string,
    input: {
      targetType: 'upfront' | 'installment';
      installmentId?: string | null;
      remarks?: string | null;
      locale?: 'en' | 'ar';
      proofUrl: string;
      proofOriginalName?: string | null;
    },
  ): Promise<StudentFeePayment> {
    if (user.role !== 'parent' && user.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }
    await this.chargeSheets.getForStudent(user, studentId);
    const { sheet, remaining } = await this.chargeSheets.remainingForTarget(
      studentId,
      input.targetType,
      input.installmentId,
    );
    if (remaining <= 0) throw new BadRequestException('Nothing is due for this item');
    await this.assertNoOpenPayment(sheet.id, input.targetType, input.installmentId);

    // Attachment receipts wait for the school (not platform). Thawani is paid on confirm.
    const schoolReceipt = user.role === 'admin' && !isPlatformOperator(user);
    const method = schoolReceipt ? 'admin' : 'offline';
    const status = 'pending_reconcile';
    const header = await this.createPaymentHeader({
      school_id: sheet.school_id,
      student_id: studentId,
      amount: moneyStr(remaining),
      method,
      status,
      proof_url: input.proofUrl,
      proof_original_name: input.proofOriginalName ?? null,
      remarks: input.remarks?.trim() || null,
      submitted_by: user.id,
    });
    const row = this.paymentRepo.create({
      school_id: sheet.school_id,
      student_id: studentId,
      sheet_id: sheet.id,
      payment_id: header.id,
      target_type: input.targetType,
      installment_id: input.installmentId ?? null,
      amount: moneyStr(remaining),
      method,
      status,
      proof_url: input.proofUrl,
      proof_original_name: input.proofOriginalName ?? null,
      remarks: input.remarks?.trim() || null,
      receipt_locale: input.locale === 'en' ? 'en' : 'ar',
      submitted_by: user.id,
    });
    const saved = await this.paymentRepo.save(row);
    void this.notifyOfflineSubmitted(saved);
    return saved;
  }

  async submitOfflineAllocations(
    user: User,
    studentId: string,
    input: {
      remarks?: string | null;
      locale?: 'en' | 'ar';
      proofUrl: string;
      proofOriginalName?: string | null;
      allocations: Array<{ installmentId: string; amount: number }>;
    },
  ): Promise<StudentFeePayment[]> {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    const sheet = await this.chargeSheets.getForStudent(user, studentId);
    const installments = [...(sheet.installments ?? [])].sort((a, b) => a.sequence - b.sequence);
    const open = await this.paymentRepo.find({
      where: { sheet_id: sheet.id, status: In([...OPEN_STATUSES]) },
    });
    const blockedIds = new Set(
      open.map((p) => p.installment_id).filter((id): id is string => Boolean(id)),
    );

    const payable = installments
      .map((inst) => ({
        inst,
        remaining: Math.max(0, num(inst.amount_due) - num(inst.amount_paid)),
      }))
      .filter((row) => row.remaining > 0.001 && row.inst.status !== 'paid' && !blockedIds.has(row.inst.id));

    const cleaned = input.allocations.filter((a) => a.amount > 0.001);
    if (!cleaned.length) {
      throw new BadRequestException('Allocate the payment across installments');
    }
    const allocMap = new Map(cleaned.map((a) => [a.installmentId, a.amount]));
    for (const a of cleaned) {
      if (!payable.some((row) => row.inst.id === a.installmentId)) {
        throw new BadRequestException('Invalid or closed installment');
      }
    }

    let priorComplete = true;
    for (const row of payable) {
      const amt = allocMap.get(row.inst.id) ?? 0;
      if (amt > row.remaining + 0.001) {
        throw new BadRequestException('Allocation exceeds installment balance');
      }
      if (amt > 0.001 && !priorComplete) {
        throw new BadRequestException('Finish the previous installment before allocating to the next');
      }
      priorComplete = amt >= row.remaining - 0.001;
      await this.assertNoOpenPayment(sheet.id, 'installment', row.inst.id);
    }

    const schoolReceipt = !isPlatformOperator(user);
    const method = schoolReceipt ? 'admin' : 'offline';
    const status = schoolReceipt ? 'pending_reconcile' : 'pending_approval';
    const totalAmount = moneyStr(
      cleaned.reduce((sum, a) => sum + a.amount, 0),
    );
    const created: StudentFeePayment[] = [];
    await this.paymentRepo.manager.transaction(async (em) => {
      const header = await this.createPaymentHeader(
        {
          school_id: sheet.school_id,
          student_id: studentId,
          amount: totalAmount,
          method,
          status,
          proof_url: input.proofUrl,
          proof_original_name: input.proofOriginalName ?? null,
          remarks: input.remarks?.trim() || null,
          submitted_by: user.id,
        },
        em,
      );
      for (const row of payable) {
        const amt = allocMap.get(row.inst.id) ?? 0;
        if (amt <= 0.001) continue;
        const saved = await em.save(
          StudentFeePayment,
          em.create(StudentFeePayment, {
            school_id: sheet.school_id,
            student_id: studentId,
            sheet_id: sheet.id,
            payment_id: header.id,
            target_type: 'installment',
            installment_id: row.inst.id,
            amount: moneyStr(amt),
            method,
            status,
            proof_url: input.proofUrl,
            proof_original_name: input.proofOriginalName ?? null,
            remarks: input.remarks?.trim() || null,
            receipt_locale: input.locale === 'en' ? 'en' : 'ar',
            submitted_by: user.id,
          }),
        );
        created.push(saved);
      }
    });
    if (created[0]) void this.notifyOfflineSubmitted(created[0]);
    return created;
  }

  async recordAdminPaymentByInstallment(
    user: User,
    installmentId: string,
    amount: number,
    remarks?: string | null,
  ) {
    const sheet = await this.chargeSheets.recordInstallmentPayment(user, installmentId, {
      amount,
      remarks: remarks ?? undefined,
    });
    // recordInstallmentPayment already applied the amount — only persist the audit + receipt.
    const header = await this.createPaymentHeader({
      school_id: sheet.school_id,
      student_id: sheet.student_id,
      amount: moneyStr(amount),
      method: 'admin',
      status: 'paid',
      remarks: remarks?.trim() || null,
      submitted_by: user.id,
    });
    const row = this.paymentRepo.create({
      school_id: sheet.school_id,
      student_id: sheet.student_id,
      sheet_id: sheet.id,
      payment_id: header.id,
      target_type: 'installment',
      installment_id: installmentId,
      amount: moneyStr(amount),
      method: 'admin',
      status: 'paid',
      remarks: remarks?.trim() || null,
      receipt_locale: 'ar',
      submitted_by: user.id,
      reviewed_by: user.id,
      reviewed_at: new Date(),
      paid_at: new Date(),
    });
    const saved = await this.paymentRepo.save(row);
    void this.sendReceipt(saved);
    return { payment: saved, sheet };
  }

  async recordAdminPayment(
    user: User,
    studentId: string,
    input: {
      targetType: 'upfront' | 'installment';
      installmentId?: string | null;
      amount: number;
      remarks?: string | null;
    },
  ) {
    if (user.role !== 'admin') throw new ForbiddenException('Admin only');
    await this.chargeSheets.getForStudent(user, studentId);
    const { sheet, remaining } = await this.chargeSheets.remainingForTarget(
      studentId,
      input.targetType,
      input.installmentId,
    );
    if (input.amount > remaining + 0.001) {
      throw new BadRequestException('Payment exceeds balance due');
    }

    const sheetAfter = await this.chargeSheets.applyConfirmedPayment({
      studentId,
      sheetId: sheet.id,
      targetType: input.targetType,
      installmentId: input.installmentId,
      amount: input.amount,
    });

    const header = await this.createPaymentHeader({
      school_id: sheet.school_id,
      student_id: studentId,
      amount: moneyStr(input.amount),
      method: 'admin',
      status: 'paid',
      remarks: input.remarks?.trim() || null,
      submitted_by: user.id,
    });
    const row = this.paymentRepo.create({
      school_id: sheet.school_id,
      student_id: studentId,
      sheet_id: sheet.id,
      payment_id: header.id,
      target_type: input.targetType,
      installment_id: input.installmentId ?? null,
      amount: moneyStr(input.amount),
      method: 'admin',
      status: 'paid',
      remarks: input.remarks?.trim() || null,
      receipt_locale: 'ar',
      submitted_by: user.id,
      reviewed_by: user.id,
      reviewed_at: new Date(),
      paid_at: new Date(),
    });
    const saved = await this.paymentRepo.save(row);
    void this.sendReceipt(saved);
    return { payment: saved, sheet: sheetAfter };
  }

  /**
   * Confirm an attached receipt: school marks it paid (applies to the charge sheet).
   * Platform may still confirm leftover `pending_approval` rows the same way.
   * Thawani never uses this path — checkout/webhook marks paid immediately.
   */
  async approve(user: User, paymentId: string, notes?: string) {
    const payment = isPlatformOperator(user)
      ? await this.requirePayment(paymentId)
      : await this.requirePayment(paymentId, user.school_id);
    if (user.role !== 'admin' && !isPlatformOperator(user)) {
      throw new ForbiddenException('Not allowed');
    }
    if (payment.method === 'thawani') {
      throw new BadRequestException('Thawani payments are confirmed by checkout, not receipt approval');
    }
    if (payment.status !== 'pending_approval' && payment.status !== 'pending_reconcile') {
      throw new BadRequestException('This payment is not waiting for settlement');
    }

    await this.chargeSheets.applyConfirmedPayment({
      studentId: payment.student_id,
      sheetId: payment.sheet_id,
      targetType: payment.target_type,
      installmentId: payment.installment_id,
      amount: num(payment.amount),
    });
    payment.status = 'paid';
    payment.paid_at = new Date();
    payment.reviewed_by = user.id;
    payment.reviewed_at = new Date();
    payment.review_notes = notes?.trim() || null;
    const saved = await this.paymentRepo.save(payment);
    await this.syncPaymentStatus(saved.payment_id, 'paid');
    void this.sendReceipt(saved);
    return { payment: saved };
  }

  async createTransfer(
    user: User,
    input: {
      school_id: string;
      payment_ids: string[];
      reference?: string | null;
      notes?: string | null;
      transferred_at?: string | null;
      amount?: number | null;
      proofUrl: string;
      proofOriginalName?: string | null;
    },
  ) {
    if (!isPlatformOperator(user)) {
      throw new ForbiddenException('Only system administrators can create transfers');
    }
    if (!input.proofUrl?.trim()) {
      throw new BadRequestException('Please attach a transfer receipt');
    }
    const ids = [...new Set(input.payment_ids.filter(Boolean))];
    if (!ids.length) throw new BadRequestException('Select at least one payment');

    const payments = await this.paymentRepo.find({
      where: { id: In(ids) },
      relations: ['student'],
    });
    if (payments.length !== ids.length) {
      throw new BadRequestException('One or more payments were not found');
    }
    for (const payment of payments) {
      if (String(payment.school_id) !== String(input.school_id)) {
        throw new BadRequestException('All payments in a transfer must belong to the same school');
      }
      if (payment.method !== 'thawani' || payment.status !== 'paid') {
        throw new BadRequestException('Only paid Thawani payments can be transferred');
      }
      if (payment.transfer_id) {
        throw new BadRequestException('A selected payment is already in a transfer');
      }
    }

    const summed = payments.reduce((sum, p) => sum + num(p.amount), 0);
    const total =
      input.amount != null && Number.isFinite(Number(input.amount))
        ? Number(input.amount)
        : summed;
    if (!(total > 0)) throw new BadRequestException('Transfer amount must be greater than zero');

    let transferredAt: string | null = null;
    if (input.transferred_at != null && String(input.transferred_at).trim()) {
      const raw = String(input.transferred_at).trim().slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
        throw new BadRequestException('transferred_at must be YYYY-MM-DD');
      }
      transferredAt = raw;
    }

    const transferId = await this.paymentRepo.manager.transaction(async (em) => {
      const transfer = await em.getRepository(FeeTransfer).save(
        em.getRepository(FeeTransfer).create({
          school_id: String(input.school_id),
          status: 'pending_school',
          reference: input.reference?.trim() || null,
          notes: input.notes?.trim() || null,
          proof_url: input.proofUrl.trim(),
          proof_original_name: input.proofOriginalName?.trim() || null,
          transferred_at: transferredAt,
          total_amount: moneyStr(total),
          created_by: user.id,
        }),
      );
      await em.getRepository(FeeTransferLine).save(
        payments.map((p) =>
          em.getRepository(FeeTransferLine).create({ transfer_id: transfer.id, payment_id: p.id }),
        ),
      );
      for (const payment of payments) {
        payment.transfer_id = transfer.id;
      }
      await em.getRepository(StudentFeePayment).save(payments);
      return transfer.id;
    });
    const transfer = await this.requireTransfer(transferId);
    void this.notifyTransferPending(transfer);
    return transfer;
  }

  async approveTransfer(user: User, transferId: string, notes?: string) {
    if (user.role !== 'admin' || isPlatformOperator(user)) {
      throw new ForbiddenException('Only the school can approve a transfer');
    }
    const transfer = await this.requireTransfer(transferId, user.school_id);
    if (transfer.status !== 'pending_school') {
      throw new BadRequestException('This transfer is not waiting for school approval');
    }

    for (const line of transfer.lines ?? []) {
      const payment = line.payment;
      if (!payment || payment.status === 'paid') continue;
      await this.chargeSheets.applyConfirmedPayment({
        studentId: payment.student_id,
        sheetId: payment.sheet_id,
        targetType: payment.target_type,
        installmentId: payment.installment_id,
        amount: num(payment.amount),
      });
      payment.status = 'paid';
      payment.paid_at = new Date();
      await this.paymentRepo.save(payment);
      await this.syncPaymentStatus(payment.payment_id, 'paid');
      void this.sendReceipt(payment);
    }

    transfer.status = 'approved';
    transfer.reviewed_by = user.id;
    transfer.reviewed_at = new Date();
    transfer.review_notes = notes?.trim() || null;
    await this.transferRepo.save(transfer);
    return this.requireTransfer(transfer.id, user.school_id);
  }

  async rejectTransfer(user: User, transferId: string, notes?: string) {
    if (user.role !== 'admin' || isPlatformOperator(user)) {
      throw new ForbiddenException('Only the school can reject a transfer');
    }
    const transfer = await this.requireTransfer(transferId, user.school_id);
    if (transfer.status !== 'pending_school') {
      throw new BadRequestException('This transfer is not waiting for school approval');
    }

    for (const line of transfer.lines ?? []) {
      const payment = line.payment;
      if (!payment) continue;
      payment.transfer_id = null;
      if (payment.status !== 'paid') {
        payment.status = 'pending_reconcile';
        await this.syncPaymentStatus(payment.payment_id, 'pending_reconcile');
      }
      await this.paymentRepo.save(payment);
    }

    transfer.status = 'rejected';
    transfer.reviewed_by = user.id;
    transfer.reviewed_at = new Date();
    transfer.review_notes = notes?.trim() || 'Rejected';
    await this.transferRepo.save(transfer);
    void this.notifyTransferRejected(transfer);
    return this.requireTransfer(transfer.id, user.school_id);
  }

  async reject(user: User, paymentId: string, notes?: string) {
    const payment = isPlatformOperator(user)
      ? await this.requirePayment(paymentId)
      : await this.requirePayment(paymentId, user.school_id);
    if (user.role !== 'admin' && !isPlatformOperator(user)) {
      throw new ForbiddenException('Not allowed');
    }
    if (payment.method === 'thawani') {
      throw new BadRequestException('Thawani payments cannot be rejected as receipts');
    }
    if (payment.status !== 'pending_approval' && payment.status !== 'pending_reconcile') {
      throw new BadRequestException('This payment is not waiting for settlement');
    }
    payment.status = 'rejected';
    payment.reviewed_by = user.id;
    payment.reviewed_at = new Date();
    payment.review_notes = notes?.trim() || 'Rejected';
    const saved = await this.paymentRepo.save(payment);
    await this.syncPaymentStatus(saved.payment_id, 'rejected');
    void this.notifyPaymentRejected(saved);
    return saved;
  }

  async createThawaniSession(
    user: User,
    studentId: string,
    input: {
      targetType: 'upfront' | 'installment';
      installmentId?: string | null;
      successUrl: string;
      cancelUrl: string;
      locale?: 'en' | 'ar';
    },
  ) {
    if (user.role !== 'parent' && user.role !== 'admin') {
      throw new ForbiddenException('Not allowed');
    }
    if (!this.isHttpUrl(input.successUrl) || !this.isHttpUrl(input.cancelUrl)) {
      throw new BadRequestException('success_url and cancel_url must be http(s) URLs');
    }
    await this.chargeSheets.getForStudent(user, studentId);
    const { sheet, remaining } = await this.chargeSheets.remainingForTarget(
      studentId,
      input.targetType,
      input.installmentId,
    );
    if (remaining <= 0) throw new BadRequestException('Nothing is due for this item');
    await this.cancelAbandonedThawaniSessions(sheet.id, input.targetType, input.installmentId);
    await this.assertNoOpenPayment(sheet.id, input.targetType, input.installmentId);

    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    const studentName = student ? `${student.firstName} ${student.lastName}`.trim() : 'Student';

    const header = await this.createPaymentHeader({
      school_id: sheet.school_id,
      student_id: studentId,
      amount: moneyStr(remaining),
      method: 'thawani',
      status: 'pending',
      submitted_by: user.id,
    });
    const payment = await this.paymentRepo.save(
      this.paymentRepo.create({
        school_id: sheet.school_id,
        student_id: studentId,
        sheet_id: sheet.id,
        payment_id: header.id,
        target_type: input.targetType,
        installment_id: input.installmentId ?? null,
        amount: moneyStr(remaining),
        method: 'thawani',
        status: 'pending',
        receipt_locale: input.locale === 'en' ? 'en' : 'ar',
        submitted_by: user.id,
      }),
    );

    try {
      const session = await this.thawani.createCheckoutSession({
        clientReferenceId: payment.id,
        productName: `School fees — ${studentName}`,
        amountOmr: remaining,
        successUrl: this.withPaymentQuery(input.successUrl, payment.id),
        cancelUrl: this.withPaymentQuery(input.cancelUrl, payment.id),
        metadata: {
          payment_id: payment.id,
          student_id: studentId,
          school_id: String(sheet.school_id),
          target_type: input.targetType,
        },
      });
      payment.thawani_session_id = session.session_id;
      await this.paymentRepo.save(payment);
      return { payment, session_id: session.session_id, checkout_url: session.checkout_url };
    } catch (err) {
      payment.status = 'failed';
      await this.paymentRepo.save(payment);
      await this.syncPaymentStatus(payment.payment_id, 'failed');
      throw err;
    }
  }

  async confirmThawani(user: User, paymentId: string) {
    const payment = await this.requireVisiblePayment(user, paymentId);
    if (payment.method !== 'thawani') {
      throw new BadRequestException('Not a Thawani payment');
    }
    if (payment.status === 'paid') {
      const sheet = await this.chargeSheets.getForStudent(user, payment.student_id);
      return { paid: true, payment, sheet };
    }
    if (!payment.thawani_session_id) {
      throw new NotFoundException('Checkout session not found');
    }

    const session = await this.thawani.getSession(payment.thawani_session_id);
    if (session.payment_status !== 'paid') {
      if (session.payment_status === 'cancelled') {
        payment.status = 'cancelled';
        await this.paymentRepo.save(payment);
        await this.syncPaymentStatus(payment.payment_id, 'cancelled');
      }
      const sheet = await this.chargeSheets.getForStudent(user, payment.student_id);
      return { paid: false, payment_status: session.payment_status, payment, sheet };
    }

    const { payment: paid, sheet } = await this.markThawaniPaid(payment, session.invoice);
    return { paid: true, payment_status: 'paid', payment: paid, sheet };
  }

  async handleThawaniWebhook(body: Record<string, unknown>) {
    const eventType = String(body?.event_type ?? '');
    const data = (body?.data ?? {}) as Record<string, unknown>;
    const sessionId = String(data.session_id ?? '');
    if (!sessionId) {
      return { ignored: true, reason: 'missing_session' };
    }
    if (eventType && eventType !== 'checkout.completed') {
      return { ignored: true, reason: 'event' };
    }

    const ref = String(data.client_reference_id ?? '').trim();
    const payment = ref
      ? await this.paymentRepo.findOne({
          where: [{ thawani_session_id: sessionId }, { id: ref }],
        })
      : await this.paymentRepo.findOne({ where: { thawani_session_id: sessionId } });
    if (!payment) {
      return { ignored: true, reason: 'unknown_payment' };
    }
    if (payment.status === 'paid') {
      return { ok: true, already_paid: true };
    }

    const session = await this.thawani.getSession(payment.thawani_session_id || sessionId);
    if (session.payment_status !== 'paid') {
      return { ok: false, payment_status: session.payment_status };
    }

    await this.markThawaniPaid(payment, session.invoice ?? (data.invoice as string | undefined));
    return { ok: true, paid: true };
  }

  private async markThawaniPaid(payment: StudentFeePayment, invoice?: string | null) {
    if (payment.status === 'paid') {
      return { payment, sheet: null };
    }

    const sheet = await this.chargeSheets.applyConfirmedPayment({
      studentId: payment.student_id,
      sheetId: payment.sheet_id,
      targetType: payment.target_type,
      installmentId: payment.installment_id,
      amount: num(payment.amount),
    });
    payment.status = 'paid';
    payment.paid_at = new Date();
    payment.thawani_invoice = invoice ?? payment.thawani_invoice;
    await this.paymentRepo.save(payment);
    await this.syncPaymentStatus(payment.payment_id, 'paid');
    void this.sendReceipt(payment);
    return { payment, sheet };
  }

  private async sendReceipt(payment: StudentFeePayment): Promise<void> {
    try {
      const [student, school] = await Promise.all([
        this.studentRepo.findOne({
          where: { id: payment.student_id },
          relations: ['parents', 'parents.user'],
        }),
        this.schoolRepo.findOne({ where: { id: payment.school_id } }),
      ]);
      if (!student) return;

      const locale = payment.receipt_locale === 'en' ? 'en' : 'ar';
      const result = await this.notifications.notifySafe({
        schoolId: payment.school_id,
        templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_RECEIPT,
        locale,
        variables: {
          schoolName: school?.name ?? 'School',
          studentName: `${student.firstName} ${student.lastName}`.trim(),
          recipientName: locale === 'ar' ? 'ولي الأمر' : 'Parent',
          amount: Number(payment.amount).toFixed(3),
          currency: 'OMR',
          date: (payment.paid_at ?? new Date()).toISOString().slice(0, 10),
          remarks: payment.remarks ?? '',
          footerText:
            school?.address?.trim() ||
            (locale === 'ar'
              ? 'شكراً لثقتكم. للاستفسار يرجى التواصل مع إدارة المدرسة.'
              : 'Thank you for your trust. Contact the school office with any questions.'),
        },
        recipients: (student.parents ?? []).flatMap((p) => [
          {
            email: p.email,
            phone: p.phone,
            userId: p.user?.id,
            name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
          },
          { email: p.user?.email, phone: p.user?.phone, userId: p.user?.id },
        ]),
      });
      if (result.emailSent + result.smsSent > 0) {
        payment.receipt_sent_at = new Date();
        await this.paymentRepo.save(payment);
      } else {
        this.logger.warn(`No receipt delivered for payment ${payment.id}`);
      }
    } catch (err) {
      this.logger.error(`Failed to send payment receipt for ${payment.id}`, err as Error);
    }
  }

  private async notifyOfflineSubmitted(payment: StudentFeePayment): Promise<void> {
    const [student, school] = await Promise.all([
      this.studentRepo.findOne({ where: { id: payment.student_id } }),
      this.schoolRepo.findOne({ where: { id: payment.school_id } }),
    ]);
    if (!school?.email && !school?.phone) return;
    await this.notifications.notifySafe({
      schoolId: payment.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_OFFLINE_SUBMITTED,
      locale: payment.receipt_locale === 'en' ? 'en' : 'ar',
      variables: {
        schoolName: school.name ?? 'School',
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : payment.student_id,
        amount: Number(payment.amount).toFixed(3),
        currency: 'OMR',
      },
      recipients: [{ email: school.email, phone: school.phone }],
    });
  }

  private async notifyPaymentRejected(payment: StudentFeePayment): Promise<void> {
    const [student, school] = await Promise.all([
      this.studentRepo.findOne({
        where: { id: payment.student_id },
        relations: ['parents', 'parents.user'],
      }),
      this.schoolRepo.findOne({ where: { id: payment.school_id } }),
    ]);
    if (!student) return;
    const locale = payment.receipt_locale === 'en' ? 'en' : 'ar';
    await this.notifications.notifySafe({
      schoolId: payment.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_REJECTED,
      locale,
      variables: {
        schoolName: school?.name ?? 'School',
        studentName: `${student.firstName} ${student.lastName}`.trim(),
        recipientName: locale === 'ar' ? 'ولي الأمر' : 'Parent',
        amount: Number(payment.amount).toFixed(3),
        currency: 'OMR',
        notes: payment.review_notes ?? '',
      },
      recipients: (student.parents ?? []).flatMap((p) => [
        {
          email: p.email,
          phone: p.phone,
          userId: p.user?.id,
          name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
        },
        { email: p.user?.email, phone: p.user?.phone, userId: p.user?.id },
      ]),
    });
  }

  private async notifyPaymentApproved(payment: StudentFeePayment): Promise<void> {
    const [student, school] = await Promise.all([
      this.studentRepo.findOne({ where: { id: payment.student_id } }),
      this.schoolRepo.findOne({ where: { id: payment.school_id } }),
    ]);
    if (!school?.email && !school?.phone) return;
    await this.notifications.notifySafe({
      schoolId: payment.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.PAYMENT_APPROVED_PENDING,
      locale: 'ar',
      variables: {
        schoolName: school?.name ?? 'School',
        studentName: student ? `${student.firstName} ${student.lastName}`.trim() : payment.student_id,
        amount: Number(payment.amount).toFixed(3),
        currency: 'OMR',
      },
      recipients: [{ email: school?.email, phone: school?.phone }],
    });
  }

  private async notifyTransferRejected(transfer: FeeTransfer): Promise<void> {
    const creator = transfer.createdByUser;
    const school = transfer.school ?? (await this.schoolRepo.findOne({ where: { id: transfer.school_id } }));
    const recipients = [
      { email: creator?.email, phone: creator?.phone, userId: creator?.id, name: creator?.firstName },
    ].filter((r) => r.email || r.phone || r.userId);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId: transfer.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.TRANSFER_REJECTED,
      locale: 'ar',
      variables: {
        schoolName: school?.name ?? 'School',
        amount: Number(transfer.total_amount).toFixed(3),
        currency: 'OMR',
        reference: transfer.reference || transfer.id,
        notes: transfer.review_notes ?? '',
      },
      recipients,
    });
  }

  private async notifyTransferPending(transfer: FeeTransfer): Promise<void> {
    const school = await this.schoolRepo.findOne({ where: { id: transfer.school_id } });
    if (!school?.email && !school?.phone) return;
    await this.notifications.notifySafe({
      schoolId: transfer.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.TRANSFER_PENDING_SCHOOL,
      locale: 'ar',
      variables: {
        schoolName: school.name ?? 'School',
        amount: Number(transfer.total_amount).toFixed(3),
        currency: 'OMR',
        reference: transfer.reference || transfer.id,
      },
      recipients: [{ email: school.email, phone: school.phone }],
    });
  }

  /** Drop abandoned Thawani checkouts so a retry is not blocked after a popup/redirect failure. */
  private async cancelAbandonedThawaniSessions(
    sheetId: string,
    targetType: 'upfront' | 'installment',
    installmentId?: string | null,
  ) {
    const open = await this.paymentRepo.find({
      where: {
        sheet_id: sheetId,
        target_type: targetType,
        method: 'thawani',
        status: 'pending',
        ...(targetType === 'installment' ? { installment_id: installmentId ?? undefined } : {}),
      },
    });
    for (const p of open) {
      p.status = 'cancelled';
      p.review_notes = 'Abandoned checkout (replaced by a new session)';
      await this.paymentRepo.save(p);
      if (p.payment_id) {
        await this.paymentsRepo.update({ id: p.payment_id }, { status: 'cancelled' });
      }
    }
  }

  private async assertNoOpenPayment(
    sheetId: string,
    targetType: 'upfront' | 'installment',
    installmentId?: string | null,
  ) {
    const existing = await this.paymentRepo.findOne({
      where: {
        sheet_id: sheetId,
        target_type: targetType,
        status: In([...OPEN_STATUSES]),
        ...(targetType === 'installment' ? { installment_id: installmentId ?? undefined } : {}),
      },
    });
    if (existing) {
      throw new BadRequestException(
        existing.status === 'pending_approval' || existing.status === 'pending_reconcile'
          ? 'A receipt is already waiting for approval'
          : 'An online payment is already in progress',
      );
    }
  }

  private async requireTransfer(id: string, schoolId?: string | null) {
    const transfer = await this.transferRepo.findOne({
      where: { id },
      relations: ['school', 'createdByUser', 'reviewedByUser', 'lines', 'lines.payment', 'lines.payment.student'],
    });
    if (!transfer) throw new NotFoundException('Transfer not found');
    if (schoolId != null && String(transfer.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Not allowed');
    }
    return transfer;
  }

  private async requirePayment(id: string, schoolId?: string | null) {
    const payment = await this.paymentRepo.findOne({
      where: { id },
      relations: ['student'],
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if (schoolId != null && String(payment.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Not allowed');
    }
    return payment;
  }

  private async requireVisiblePayment(user: User, id: string) {
    const payment = await this.requirePayment(id, user.role === 'admin' ? user.school_id : undefined);
    await this.chargeSheets.getForStudent(user, payment.student_id);
    return payment;
  }

  private isHttpUrl(v: string): boolean {
    return /^https?:\/\//i.test(v);
  }

  private withPaymentQuery(url: string, paymentId: string): string {
    try {
      const u = new URL(url);
      u.searchParams.set('payment', paymentId);
      return u.toString();
    } catch {
      return url;
    }
  }
}
