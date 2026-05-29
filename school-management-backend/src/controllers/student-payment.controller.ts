import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { StudentPaymentService } from '../services/student-payment.service';

@Controller('student-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StudentPaymentController {
  constructor(private readonly studentPaymentService: StudentPaymentService) {}

  @Get()
  @Roles('admin')
  async list(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const rows = await this.studentPaymentService.listForSchool(req.user, schoolId);
    const data = await Promise.all(rows.map((p) => this.wrap(p, req.user)));
    return { success: true, data, count: data.length };
  }

  @Get('by-student/:studentId')
  @Roles('admin', 'parent')
  async getByStudent(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return { success: true, data: await this.wrap(p, req.user) };
  }

  @Get('by-student/:studentId/all')
  @Roles('admin', 'parent')
  async listByStudent(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const rows = await this.studentPaymentService.listByStudent(req.user, studentId);
    const data = await Promise.all(rows.map((p) => this.wrap(p, req.user)));
    return { success: true, data, count: data.length };
  }

  @Post('by-student/:studentId/ensure')
  @Roles('admin', 'parent')
  async ensure(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const p = await this.studentPaymentService.ensureOrThrow(req.user, studentId);
    return { success: true, data: await this.wrap(p, req.user), message: 'Payment record ready' };
  }

  @Patch('by-student/:studentId/admin-total')
  @Roles('admin')
  async patchAdminTotal(
    @Param('studentId') studentId: string,
    @Body() body: Record<string, unknown>,
    @Request() req: { user: User },
  ) {
    if (!('admin_adjusted_total' in body)) {
      throw new BadRequestException('Send admin_adjusted_total as a number or null to clear');
    }
    const raw = body.admin_adjusted_total;
    const val = raw === null ? null : Number(raw);
    if (val !== null && Number.isNaN(val)) {
      throw new BadRequestException('Invalid amount');
    }
    const p = await this.studentPaymentService.updateAdminAdjustedTotal(req.user, studentId, val);
    return { success: true, data: await this.wrap(p, req.user), message: 'Updated' };
  }

  @Post('by-student/:studentId/discounts')
  @Roles('admin')
  async addDiscount(
    @Param('studentId') studentId: string,
    @Body() body: { discount_type_id: string; amount: number; remarks: string },
    @Request() req: { user: User },
  ) {
    await this.studentPaymentService.addDiscountLine(req.user, studentId, body);
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return { success: true, data: await this.wrap(p, req.user), message: 'Discount added' };
  }

  @Delete('by-student/:studentId/discounts/:lineId')
  @Roles('admin')
  async removeDiscount(
    @Param('studentId') studentId: string,
    @Param('lineId') lineId: string,
    @Request() req: { user: User },
  ) {
    await this.studentPaymentService.removeDiscountLine(req.user, studentId, lineId);
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return { success: true, data: await this.wrap(p, req.user), message: 'Discount removed' };
  }

  @Get('by-student/:studentId/fee-charges')
  @Roles('admin', 'parent')
  async listFeeCharges(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const data = await this.studentPaymentService.getFeeChargesForStudent(req.user, studentId);
    return { success: true, data, count: data.length };
  }

  @Post('by-student/:studentId/payments/preview')
  @Roles('admin', 'parent')
  async previewPayment(
    @Param('studentId') studentId: string,
    @Body() body: Record<string, unknown>,
    @Request() req: { user: User },
  ) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive number');
    }
    const data = await this.studentPaymentService.previewPayment(req.user, studentId, {
      amount,
      academic_year_id: body.academic_year_id != null ? String(body.academic_year_id) : null,
      target_installment_id:
        body.target_installment_id != null ? String(body.target_installment_id) : null,
    });
    return { success: true, data };
  }

  @Post('by-student/:studentId/payments/record')
  @Roles('admin', 'parent')
  async recordPayment(
    @Param('studentId') studentId: string,
    @Body() body: Record<string, unknown>,
    @Request() req: { user: User },
  ) {
    const amount = Number(body.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      throw new BadRequestException('amount must be a positive number');
    }
    const result = await this.studentPaymentService.recordPaymentTransaction(req.user, studentId, {
      amount,
      academic_year_id: body.academic_year_id != null ? String(body.academic_year_id) : null,
      remarks: body.remarks != null ? String(body.remarks) : null,
      target_installment_id:
        body.target_installment_id != null ? String(body.target_installment_id) : null,
    });
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return {
      success: true,
      data: await this.wrap(p, req.user),
      transaction: result.transaction,
      message: 'Payment recorded',
    };
  }

  @Get('by-student/:studentId/payments/history')
  @Roles('admin', 'parent')
  async paymentHistory(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const data = await this.studentPaymentService.listPaymentHistory(req.user, studentId);
    return { success: true, data, count: data.length };
  }

  @Post('by-student/:studentId/installments/:installmentId/pay')
  async payInstallment(
    @Param('studentId') studentId: string,
    @Param('installmentId') installmentId: string,
    @Body() body: { amount?: number; remarks?: string },
    @Request() req: { user: User },
  ) {
    await this.studentPaymentService.recordInstallmentPayment(req.user, studentId, installmentId, body ?? {});
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return { success: true, data: await this.wrap(p, req.user), message: 'Installment payment recorded' };
  }

  @Delete('by-student/:studentId/installments/:installmentId/pay')
  @Roles('admin')
  async clearInstallment(
    @Param('studentId') studentId: string,
    @Param('installmentId') installmentId: string,
    @Request() req: { user: User },
  ) {
    await this.studentPaymentService.clearInstallmentReceipt(req.user, studentId, installmentId);
    const p = await this.studentPaymentService.getOne(req.user, studentId, null);
    return { success: true, data: await this.wrap(p, req.user), message: 'Installment payment cleared' };
  }

  private async wrap(p: any, user: User) {
    const allowedDiscountTypeIds = await this.studentPaymentService.getAllowedDiscountTypeIdsForStudent(
      p.student_id,
      p.id,
    );
    const installmentSchedule = await this.studentPaymentService.buildInstallmentSchedule(p);
    const { feeCharges, paymentHistory } = await this.studentPaymentService.loadLedgerForPayment(p);
    return {
      payment: this.serializePayment(p),
      payable: this.studentPaymentService.effectivePayable(p),
      subtotal: this.studentPaymentService.effectiveSubtotal(p),
      discountTotal: this.studentPaymentService.discountSum(p),
      allowedDiscountTypeIds,
      installmentSchedule,
      feeCharges,
      paymentHistory,
    };
  }

  private serializePayment(p: any) {
    return {
      id: p.id,
      student_id: p.student_id,
      school_id: p.school_id,
      level_id: p.level_id,
      level_payment_profile_id: p.level_payment_profile_id,
      course_id: p.course_id ?? null,
      course_payment_profile_id: p.course_payment_profile_id ?? null,
      base_total_amount: p.base_total_amount,
      admin_adjusted_total: p.admin_adjusted_total,
      currency: p.currency,
      created_at: p.created_at,
      updated_at: p.updated_at,
      student: p.student
        ? {
            id: p.student.id,
            firstName: p.student.firstName,
            lastName: p.student.lastName,
          }
        : undefined,
      level: p.level ? { id: p.level.id, code: p.level.code, name: p.level.name } : null,
      course: p.course
        ? { id: p.course.id, name: p.course.name ?? p.course.title, title: p.course.title }
        : null,
      payment_kind: p.course_id ? 'course' : 'level',
      discountLines: (p.discountLines ?? []).map((d: any) => ({
        id: d.id,
        discount_type_id: d.discount_type_id,
        amount: d.amount,
        remarks: d.remarks,
        created_at: d.created_at,
        discountType: d.discountType
          ? { id: d.discountType.id, code: d.discountType.code, label: d.discountType.label }
          : undefined,
      })),
    };
  }
}
