import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Public } from '../auth/public.decorator';
import { resolveActorSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { InstallmentPlanService } from '../services/installment-plan.service';
import { GradeFeeLinkService } from '../services/grade-fee-link.service';
import { BusFeeLinkService } from '../services/bus-fee-link.service';
import { CourseFeeLinkService } from '../services/course-fee-link.service';
import { StudentChargeSheetService } from '../services/student-charge-sheet.service';
import { FeePackageStructureService } from '../services/fee-package-structure.service';
import { FeePaymentService } from '../services/fee-payment.service';
import {
  AssignStudentChargePlanDto,
  CreateThawaniSessionDto,
  RecordChargePaymentDto,
  CreateFeeTransferDto,
  ReviewFeePaymentDto,
  SetChargeSheetDiscountsDto,
  SubmitOfflinePaymentDto,
  UpsertBusFeeLinkDto,
  UpsertCourseFeeLinkDto,
  UpsertGradeFeeLinkDto,
  UpsertInstallmentPlanDto,
  UpsertFeePackageStructureDto,
} from '../dto/fees-v2.dto';

@Controller('fees/v2')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeesV2Controller {
  constructor(
    private readonly packageStructure: FeePackageStructureService,
    private readonly installmentPlans: InstallmentPlanService,
    private readonly gradeLinks: GradeFeeLinkService,
    private readonly busLinks: BusFeeLinkService,
    private readonly courseLinks: CourseFeeLinkService,
    private readonly chargeSheets: StudentChargeSheetService,
    private readonly feePayments: FeePaymentService,
  ) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const raw = requested != null ? String(requested).trim() : '';
    const cleaned =
      raw && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
        ? raw
        : undefined;
    const schoolId = resolveActorSchoolId(req.user, cleaned);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  // --- Independent fee packages (structure only) ---
  @Get('packages')
  @Roles('admin')
  async listPackages(@Query('school_id') requestedSchoolId: string | undefined, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.packageStructure.list(req.user, schoolId);
    return { success: true, data };
  }

  @Get('packages/:id/usage')
  @Roles('admin')
  async getPackageUsage(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.packageStructure.getUsage(req.user, id);
    return { success: true, data };
  }

  @Get('packages/:id')
  @Roles('admin')
  async getPackage(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.packageStructure.getOne(req.user, id);
    return { success: true, data };
  }

  @Post('packages')
  @Roles('admin')
  async createPackage(@Body() body: UpsertFeePackageStructureDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.packageStructure.upsert(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Put('packages/:id')
  @Roles('admin')
  async updatePackage(
    @Param('id') id: string,
    @Body() body: UpsertFeePackageStructureDto,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.packageStructure.upsert(req.user, { ...body, school_id: schoolId }, id);
    return { success: true, data };
  }

  @Delete('packages/:id')
  @Roles('admin')
  async deletePackage(@Param('id') id: string, @Request() req: { user: User }) {
    await this.packageStructure.remove(req.user, id);
    return { success: true };
  }

  // --- Installment plans ---
  @Get('installment-plans')
  @Roles('admin')
  async listPlans(@Query('school_id') requestedSchoolId: string | undefined, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.installmentPlans.list(req.user, schoolId);
    return { success: true, data };
  }

  @Get('installment-plans/:id')
  @Roles('admin')
  async getPlan(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.installmentPlans.getOne(req.user, id);
    return { success: true, data };
  }

  @Get('installment-plans/:id/usage')
  @Roles('admin')
  async getPlanUsage(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.installmentPlans.getUsage(req.user, id);
    return { success: true, data };
  }

  @Post('installment-plans')
  @Roles('admin')
  async createPlan(@Body() body: UpsertInstallmentPlanDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.installmentPlans.upsert(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Put('installment-plans/:id')
  @Roles('admin')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: UpsertInstallmentPlanDto,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.installmentPlans.upsert(req.user, { ...body, school_id: schoolId }, id);
    return { success: true, data };
  }

  @Delete('installment-plans/:id')
  @Roles('admin')
  async deletePlan(@Param('id') id: string, @Request() req: { user: User }) {
    await this.installmentPlans.remove(req.user, id);
    return { success: true };
  }

  // --- Grade fee links ---
  @Get('grade-links')
  @Roles('admin')
  async listGradeLinks(@Query('school_id') requestedSchoolId: string | undefined, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.gradeLinks.list(req.user, schoolId);
    return { success: true, data };
  }

  @Get('grade-links/by-level/:levelId')
  @Roles('admin')
  async getGradeLink(
    @Query('school_id') requestedSchoolId: string | undefined,
    @Param('levelId') levelId: string,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.gradeLinks.getByLevel(req.user, schoolId, levelId);
    return { success: true, data };
  }

  @Put('grade-links')
  @Roles('admin')
  async upsertGradeLink(@Body() body: UpsertGradeFeeLinkDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.gradeLinks.upsert(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  // --- Bus fee links ---
  @Get('bus-links/by-bus/:busId')
  @Roles('admin')
  async getBusLink(
    @Query('school_id') requestedSchoolId: string | undefined,
    @Param('busId') busId: string,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.busLinks.getByBus(req.user, schoolId, busId);
    return { success: true, data };
  }

  @Put('bus-links')
  @Roles('admin')
  async upsertBusLink(@Body() body: UpsertBusFeeLinkDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.busLinks.upsert(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  // --- Course fee links ---
  @Get('course-links/by-course/:courseId')
  @Roles('admin')
  async getCourseLink(
    @Query('school_id') requestedSchoolId: string | undefined,
    @Param('courseId') courseId: string,
    @Request() req: { user: User },
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.courseLinks.getByCourse(req.user, schoolId, courseId);
    return { success: true, data };
  }

  @Put('course-links')
  @Roles('admin')
  async upsertCourseLink(@Body() body: UpsertCourseFeeLinkDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.courseLinks.upsert(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  // --- Student charge sheets ---
  @Get('charge-sheet-summaries')
  @Roles('admin')
  async listChargeSheetSummaries(
    @Request() req: { user: User },
    @Query('student_ids') studentIdsRaw?: string,
  ) {
    const studentIds = (studentIdsRaw || '')
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    const data = await this.chargeSheets.listSchoolSummaries(req.user, {
      studentIds: studentIds.length ? studentIds : undefined,
    });
    return { success: true, data };
  }

  @Get('reports/due-installments')
  @Roles('admin')
  async dueInstallmentsReport(
    @Query('as_of') asOf: string | undefined,
    @Query('bucket') bucket: string | undefined,
    @Request() req: { user: User },
  ) {
    const data = await this.chargeSheets.dueInstallmentsReport(req.user, {
      asOf,
      bucket: bucket as 'all' | 'due' | 'late' | 'upcoming' | undefined,
    });
    return { success: true, data };
  }

  @Get('students/:studentId/charge-sheet')
  @Roles('admin', 'parent', 'student')
  async getStudentSheet(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const data = await this.chargeSheets.getForStudent(req.user, studentId);
    return { success: true, data };
  }

  @Post('students/:studentId/charge-sheet/refresh')
  @Roles('admin')
  async refreshStudentSheet(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const data = await this.chargeSheets.buildOrRefresh(req.user, studentId);
    return { success: true, data };
  }

  @Put('students/:studentId/charge-sheet/plan')
  @Roles('admin')
  async assignPlan(
    @Param('studentId') studentId: string,
    @Body() body: AssignStudentChargePlanDto,
    @Request() req: { user: User },
  ) {
    const data = await this.chargeSheets.assignPlan(req.user, studentId, body);
    return { success: true, data };
  }

  @Put('students/:studentId/charge-sheet/discounts')
  @Roles('admin')
  async setDiscounts(
    @Param('studentId') studentId: string,
    @Body() body: SetChargeSheetDiscountsDto,
    @Request() req: { user: User },
  ) {
    const data = await this.chargeSheets.setDiscounts(req.user, studentId, body);
    return { success: true, data };
  }

  @Post('students/:studentId/charge-sheet/pay-upfront')
  @Roles('admin')
  async payUpfront(
    @Param('studentId') studentId: string,
    @Body() body: RecordChargePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.recordAdminPayment(req.user, studentId, {
      targetType: 'upfront',
      amount: body.amount,
      remarks: body.remarks,
    });
    return { success: true, data: data.sheet };
  }

  @Post('installments/:installmentId/pay')
  @Roles('admin')
  async payInstallment(
    @Param('installmentId') installmentId: string,
    @Body() body: RecordChargePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.recordAdminPaymentByInstallment(
      req.user,
      installmentId,
      body.amount,
      body.remarks,
    );
    return { success: true, data: data.sheet };
  }

  @Get('payments/pending')
  @Roles('admin', 'platform')
  async listPendingPayments(@Request() req: { user: User }) {
    const data = await this.feePayments.listPendingForSchool(req.user);
    return { success: true, data };
  }

  @Get('payments/pending-reconcile')
  @Roles('admin', 'platform')
  async listPendingReconcile(@Request() req: { user: User }) {
    const data = await this.feePayments.listReadyToTransfer(req.user);
    return { success: true, data };
  }

  @Get('transfers')
  @Roles('admin', 'platform')
  async listTransfers(@Request() req: { user: User }) {
    const data = await this.feePayments.listTransfers(req.user);
    return { success: true, data };
  }

  @Post('transfers')
  @Roles('admin', 'platform')
  async createTransfer(@Body() body: CreateFeeTransferDto, @Request() req: { user: User }) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.feePayments.createTransfer(req.user, {
      school_id: schoolId,
      payment_ids: body.payment_ids,
      reference: body.reference,
      notes: body.notes,
    });
    return { success: true, data };
  }

  @Post('transfers/:id/approve')
  @Roles('admin')
  async approveTransfer(
    @Param('id') id: string,
    @Body() body: ReviewFeePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.approveTransfer(req.user, id, body.notes);
    return { success: true, data };
  }

  @Post('transfers/:id/reject')
  @Roles('admin')
  async rejectTransfer(
    @Param('id') id: string,
    @Body() body: ReviewFeePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.rejectTransfer(req.user, id, body.notes);
    return { success: true, data };
  }

  @Get('students/:studentId/payments')
  @Roles('admin', 'parent', 'student')
  async listStudentPayments(@Param('studentId') studentId: string, @Request() req: { user: User }) {
    const data = await this.feePayments.listForStudent(req.user, studentId);
    return { success: true, data };
  }

  @Post('students/:studentId/payments/offline')
  @Roles('admin', 'parent')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/payment-proofs';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = (file.originalname.split('.').pop() || 'bin').toLowerCase();
          cb(null, `proof_${Date.now()}_${Math.random().toString(36).slice(2, 10)}.${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ok = /^(image\/(jpeg|jpg|png|webp)|application\/pdf)$/i.test(file.mimetype);
        if (!ok) return cb(new BadRequestException('Upload a JPG, PNG, or PDF receipt') as any, false);
        cb(null, true);
      },
    }),
  )
  async submitOfflinePayment(
    @Param('studentId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: SubmitOfflinePaymentDto,
    @Request() req: { user: User; body?: Record<string, unknown> },
  ) {
    if (!file) throw new BadRequestException('Please attach a payment receipt');
    const proof = {
      remarks: body.remarks,
      locale: (body.locale === 'en' ? 'en' : 'ar') as 'en' | 'ar',
      proofUrl: `/api/files/payment-proofs/${file.filename}`,
      proofOriginalName: file.originalname,
    };
    const rawAlloc =
      body.allocations ??
      (typeof req.body?.allocations === 'string' ? req.body.allocations : undefined);
    const wantsAllocations =
      body.use_allocations === '1' || (rawAlloc != null && String(rawAlloc).trim() !== '');
    if (wantsAllocations) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(String(rawAlloc ?? ''));
      } catch {
        throw new BadRequestException('Invalid allocations');
      }
      if (!Array.isArray(parsed)) throw new BadRequestException('Invalid allocations');
      const allocations = parsed.map((row) => {
        const installmentId = String((row as { installment_id?: string })?.installment_id || '');
        const amount = Number((row as { amount?: number })?.amount);
        if (!installmentId || !Number.isFinite(amount) || amount <= 0) {
          throw new BadRequestException('Invalid allocations');
        }
        return { installmentId, amount };
      });
      const data = await this.feePayments.submitOfflineAllocations(req.user, studentId, {
        ...proof,
        allocations,
      });
      return { success: true, data };
    }
    const targetType = body.target_type === 'installment' ? 'installment' : 'upfront';
    const data = await this.feePayments.submitOffline(req.user, studentId, {
      targetType,
      installmentId: body.installment_id || null,
      ...proof,
    });
    return { success: true, data };
  }

  @Post('students/:studentId/payments/thawani/session')
  @Roles('admin', 'parent')
  async createThawaniSession(
    @Param('studentId') studentId: string,
    @Body() body: CreateThawaniSessionDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.createThawaniSession(req.user, studentId, {
      targetType: body.target_type,
      installmentId: body.installment_id,
      successUrl: body.success_url,
      cancelUrl: body.cancel_url,
      locale: body.locale,
    });
    return { success: true, data };
  }

  @Post('payments/:id/thawani/confirm')
  @Roles('admin', 'parent')
  async confirmThawani(@Param('id') id: string, @Request() req: { user: User }) {
    const data = await this.feePayments.confirmThawani(req.user, id);
    return { success: true, data };
  }

  @Post('payments/:id/approve')
  @Roles('admin', 'platform')
  async approvePayment(
    @Param('id') id: string,
    @Body() body: ReviewFeePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.approve(req.user, id, body.notes);
    return { success: true, data };
  }

  @Post('payments/:id/reject')
  @Roles('admin', 'platform')
  async rejectPayment(
    @Param('id') id: string,
    @Body() body: ReviewFeePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.feePayments.reject(req.user, id, body.notes);
    return { success: true, data };
  }

  @Public()
  @Post('payments/thawani/webhook')
  async thawaniWebhook(@Body() body: Record<string, unknown>) {
    const data = await this.feePayments.handleThawaniWebhook(body ?? {});
    return { success: true, data };
  }
}
