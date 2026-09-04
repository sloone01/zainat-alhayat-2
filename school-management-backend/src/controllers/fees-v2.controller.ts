import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  ParseIntPipe,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { InstallmentPlanService } from '../services/installment-plan.service';
import { GradeFeeLinkService } from '../services/grade-fee-link.service';
import { BusFeeLinkService } from '../services/bus-fee-link.service';
import { CourseFeeLinkService } from '../services/course-fee-link.service';
import { StudentChargeSheetService } from '../services/student-charge-sheet.service';
import { FeePackageStructureService } from '../services/fee-package-structure.service';
import {
  AssignStudentChargePlanDto,
  RecordChargePaymentDto,
  SetChargeSheetDiscountsDto,
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
  ) {}

  // --- Independent fee packages (structure only) ---
  @Get('packages')
  @Roles('admin')
  async listPackages(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
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
    const data = await this.packageStructure.upsert(req.user, body);
    return { success: true, data };
  }

  @Put('packages/:id')
  @Roles('admin')
  async updatePackage(
    @Param('id') id: string,
    @Body() body: UpsertFeePackageStructureDto,
    @Request() req: { user: User },
  ) {
    const data = await this.packageStructure.upsert(req.user, body, id);
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
  async listPlans(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
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
    const data = await this.installmentPlans.upsert(req.user, body);
    return { success: true, data };
  }

  @Put('installment-plans/:id')
  @Roles('admin')
  async updatePlan(
    @Param('id') id: string,
    @Body() body: UpsertInstallmentPlanDto,
    @Request() req: { user: User },
  ) {
    const data = await this.installmentPlans.upsert(req.user, body, id);
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
  async listGradeLinks(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.gradeLinks.list(req.user, schoolId);
    return { success: true, data };
  }

  @Get('grade-links/by-level/:levelId')
  @Roles('admin')
  async getGradeLink(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Param('levelId') levelId: string,
    @Request() req: { user: User },
  ) {
    const data = await this.gradeLinks.getByLevel(req.user, schoolId, levelId);
    return { success: true, data };
  }

  @Put('grade-links')
  @Roles('admin')
  async upsertGradeLink(@Body() body: UpsertGradeFeeLinkDto, @Request() req: { user: User }) {
    const data = await this.gradeLinks.upsert(req.user, body);
    return { success: true, data };
  }

  // --- Bus fee links ---
  @Get('bus-links/by-bus/:busId')
  @Roles('admin')
  async getBusLink(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Param('busId') busId: string,
    @Request() req: { user: User },
  ) {
    const data = await this.busLinks.getByBus(req.user, schoolId, busId);
    return { success: true, data };
  }

  @Put('bus-links')
  @Roles('admin')
  async upsertBusLink(@Body() body: UpsertBusFeeLinkDto, @Request() req: { user: User }) {
    const data = await this.busLinks.upsert(req.user, body);
    return { success: true, data };
  }

  // --- Course fee links ---
  @Get('course-links/by-course/:courseId')
  @Roles('admin')
  async getCourseLink(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Param('courseId') courseId: string,
    @Request() req: { user: User },
  ) {
    const data = await this.courseLinks.getByCourse(req.user, schoolId, courseId);
    return { success: true, data };
  }

  @Put('course-links')
  @Roles('admin')
  async upsertCourseLink(@Body() body: UpsertCourseFeeLinkDto, @Request() req: { user: User }) {
    const data = await this.courseLinks.upsert(req.user, body);
    return { success: true, data };
  }

  // --- Student charge sheets ---
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
  @Roles('admin', 'parent')
  async payUpfront(
    @Param('studentId') studentId: string,
    @Body() body: RecordChargePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.chargeSheets.recordUpfrontPayment(req.user, studentId, body);
    return { success: true, data };
  }

  @Post('installments/:installmentId/pay')
  @Roles('admin', 'parent')
  async payInstallment(
    @Param('installmentId') installmentId: string,
    @Body() body: RecordChargePaymentDto,
    @Request() req: { user: User },
  ) {
    const data = await this.chargeSheets.recordInstallmentPayment(req.user, installmentId, body);
    return { success: true, data };
  }
}
