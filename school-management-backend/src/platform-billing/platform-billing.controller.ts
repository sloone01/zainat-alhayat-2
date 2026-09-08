import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { PlatformBillingService } from './platform-billing.service';
import {
  IssueInvoiceDto,
  MarkInvoicePaidDto,
  UpdatePlatformModuleDto,
  CreatePlatformPlanDto,
  UpdatePlatformPlanDto,
  UpsertSchoolSubscriptionDto,
} from './dto/platform-billing.dto';

@Controller('platform')
@UseGuards(JwtAuthGuard, ClaimGuard)
@UsePipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }),
)
export class PlatformBillingController {
  constructor(private readonly billing: PlatformBillingService) {}

  @Get('plans')
  @RequireClaim('platform_schools', 'view')
  async listPlans(@Req() req: { user: User }) {
    const data = await this.billing.listPlansForAdmin(req.user);
    return { success: true, data };
  }

  @Get('plans/:code')
  @RequireClaim('platform_schools', 'view')
  async getPlan(
    @Req() req: { user: User },
    @Param('code') code: string,
  ) {
    const data = await this.billing.getPlanDetail(req.user, code);
    return { success: true, data };
  }

  @Post('plans')
  @RequireClaim('platform_schools', 'manage')
  @HttpCode(HttpStatus.CREATED)
  async createPlan(@Req() req: { user: User }, @Body() dto: CreatePlatformPlanDto) {
    const data = await this.billing.createPlan(req.user, dto);
    return { success: true, data, message: 'Plan created' };
  }

  @Delete('plans/:code')
  @RequireClaim('platform_schools', 'manage')
  async deletePlan(@Req() req: { user: User }, @Param('code') code: string) {
    const data = await this.billing.deletePlan(req.user, code);
    return { success: true, data, message: 'Plan deleted' };
  }

  @Put('plans/:code')
  @RequireClaim('platform_schools', 'manage')
  async updatePlan(
    @Req() req: { user: User },
    @Param('code') code: string,
    @Body() dto: UpdatePlatformPlanDto,
  ) {
    const data = await this.billing.updatePlan(req.user, code, dto);
    return { success: true, data, message: 'Plan updated' };
  }

  @Get('modules')
  @RequireClaim('platform_schools', 'view')
  async listModules(@Req() req: { user: User }) {
    const data = await this.billing.listModules(req.user);
    return { success: true, data };
  }

  @Put('modules/:code')
  @RequireClaim('platform_schools', 'manage')
  async updateModule(
    @Req() req: { user: User },
    @Param('code') code: string,
    @Body() dto: UpdatePlatformModuleDto,
  ) {
    const data = await this.billing.updateModule(req.user, code, dto);
    return { success: true, data, message: 'Module updated' };
  }

  @Get('schools/:id/subscription')
  @RequireClaim('platform_schools', 'view')
  async getSubscription(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.billing.getSchoolSubscription(req.user, id);
    return { success: true, data };
  }

  @Put('schools/:id/subscription')
  @RequireClaim('platform_schools', 'manage')
  async upsertSubscription(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpsertSchoolSubscriptionDto,
  ) {
    const data = await this.billing.upsertSchoolSubscription(req.user, id, dto);
    return { success: true, data };
  }

  @Get('schools/:id/modules')
  @RequireClaim('platform_schools', 'view')
  async listSchoolModules(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
  ) {
    const data = await this.billing.listSchoolModules(req.user, id);
    return { success: true, data };
  }

  /** Per-school module grants that survive a plan sync. */
  @Put('schools/:id/modules')
  @RequireClaim('platform_schools', 'manage')
  async setSchoolModules(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body('module_codes') moduleCodes: string[],
  ) {
    const data = await this.billing.setSchoolManualModules(
      req.user,
      id,
      Array.isArray(moduleCodes) ? moduleCodes : [],
    );
    return { success: true, data, message: 'School modules updated' };
  }

  @Post('schools/:id/invoices')
  @RequireClaim('platform_schools', 'manage')
  async issueInvoice(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IssueInvoiceDto,
  ) {
    const data = await this.billing.issueInvoice(req.user, id, dto);
    return { success: true, data };
  }

  @Post('invoices/:id/mark-paid')
  @RequireClaim('platform_schools', 'manage')
  async markPaid(
    @Req() req: { user: User },
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: MarkInvoicePaidDto,
  ) {
    const data = await this.billing.markInvoicePaid(req.user, id, dto);
    return { success: true, data };
  }
}
