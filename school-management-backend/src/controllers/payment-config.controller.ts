import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import {
  PaymentConfigService,
  type UpsertCatalogDto,
  type UpsertCoursePaymentProfileDto,
  type UpsertLevelDto,
  type UpsertLevelPaymentProfileDto,
} from '../services/payment-config.service';

@Controller('payment-config')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class PaymentConfigController {
  constructor(private readonly paymentConfigService: PaymentConfigService) {}

  // --- Levels ---
  @Get('levels')
  async listLevels(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.listLevels(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get('levels-summary')
  async listLevelsSummary(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.listLevelsWithProfileStatus(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Post('levels')
  async createLevel(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: UpsertLevelDto,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.createLevel(req.user, schoolId, body);
    return { success: true, data, message: 'Level created' };
  }

  @Patch('levels/:id')
  async updateLevel(@Param('id') id: string, @Body() body: Partial<UpsertLevelDto>, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.updateLevel(req.user, id, body);
    return { success: true, data, message: 'Level updated' };
  }

  @Delete('levels/:id')
  async deleteLevel(@Param('id') id: string, @Request() req: { user: User }) {
    await this.paymentConfigService.deleteLevel(req.user, id);
    return { success: true, message: 'Level deleted' };
  }

  // --- Charge types ---
  @Get('charge-types')
  async listChargeTypes(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.listChargeTypes(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Post('charge-types')
  async createChargeType(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: UpsertCatalogDto,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.createChargeType(req.user, schoolId, body);
    return { success: true, data, message: 'Charge type created' };
  }

  @Patch('charge-types/:id')
  async updateChargeType(@Param('id') id: string, @Body() body: Partial<UpsertCatalogDto>, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.updateChargeType(req.user, id, body);
    return { success: true, data, message: 'Charge type updated' };
  }

  @Delete('charge-types/:id')
  async deleteChargeType(@Param('id') id: string, @Request() req: { user: User }) {
    await this.paymentConfigService.deleteChargeType(req.user, id);
    return { success: true, message: 'Charge type deleted' };
  }

  // --- Discount types ---
  @Get('discount-types')
  async listDiscountTypes(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.listDiscountTypes(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Post('discount-types')
  async createDiscountType(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: UpsertCatalogDto,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.createDiscountType(req.user, schoolId, body);
    return { success: true, data, message: 'Discount type created' };
  }

  @Patch('discount-types/:id')
  async updateDiscountType(
    @Param('id') id: string,
    @Body() body: Partial<UpsertCatalogDto>,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.updateDiscountType(req.user, id, body);
    return { success: true, data, message: 'Discount type updated' };
  }

  @Delete('discount-types/:id')
  async deleteDiscountType(@Param('id') id: string, @Request() req: { user: User }) {
    await this.paymentConfigService.deleteDiscountType(req.user, id);
    return { success: true, message: 'Discount type deleted' };
  }

  @Get('school-flags')
  async getSchoolFlags(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.getSchoolPaymentFlags(req.user, schoolId);
    return { success: true, data };
  }

  @Patch('school-flags')
  async patchSchoolFlags(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: { allow_admin_adjust_student_total: boolean },
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.updateSchoolPaymentFlags(req.user, schoolId, body);
    return { success: true, data, message: 'School payment options updated' };
  }

  // --- Per-level payment profile ---
  @Get('profiles/by-level/:levelId')
  async getProfile(@Param('levelId') levelId: string, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.getProfileForLevel(req.user, levelId);
    return { success: true, data };
  }

  @Put('profiles/by-level/:levelId')
  async putProfile(
    @Param('levelId') levelId: string,
    @Body() body: UpsertLevelPaymentProfileDto,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.upsertProfileForLevel(req.user, levelId, body);
    return { success: true, data, message: 'Payment profile saved' };
  }

  @Get('courses-payment-summary')
  async coursesPaymentSummary(@Query('school_id', ParseIntPipe) schoolId: number, @Request() req: { user: User }) {
    const data = await this.paymentConfigService.listCoursesPaymentSummary(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get('profiles/by-course/:courseId')
  async getCourseProfile(
    @Param('courseId') courseId: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.getProfileForCourse(req.user, courseId, schoolId);
    return { success: true, data };
  }

  @Put('profiles/by-course/:courseId')
  async putCourseProfile(
    @Param('courseId') courseId: string,
    @Body() body: UpsertCoursePaymentProfileDto,
    @Request() req: { user: User },
  ) {
    const data = await this.paymentConfigService.upsertProfileForCourse(req.user, courseId, body);
    return { success: true, data, message: 'Course payment profile saved' };
  }
}
