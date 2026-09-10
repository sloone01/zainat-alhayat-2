import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import type { Express } from 'express';
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

const receiptMime = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'application/pdf',
]);

function invoiceReceiptFilter(
  _req: Express.Request,
  file: Express.Multer.File,
  cb: (error: Error | null, acceptFile: boolean) => void,
) {
  if (receiptMime.has(file.mimetype)) {
    cb(null, true);
    return;
  }
  cb(new BadRequestException('Only PDF or image files are allowed for receipts'), false);
}

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

  @Get('custom-plan-requests')
  @RequireClaim('platform_schools', 'view')
  async listCustomPlanRequests(@Req() req: { user: User }) {
    const data = await this.billing.listCustomPlanRequests(req.user);
    return { success: true, data, count: data.length };
  }

  @Patch('custom-plan-requests/:id')
  @RequireClaim('platform_schools', 'edit')
  async updateCustomPlanRequest(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: { status?: 'new' | 'contacted' | 'closed'; admin_notes?: string | null },
  ) {
    const data = await this.billing.updateCustomPlanRequest(req.user, id, dto);
    return { success: true, data };
  }

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
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.billing.getSchoolSubscription(req.user, id);
    return { success: true, data };
  }

  @Put('schools/:id/subscription')
  @RequireClaim('platform_schools', 'manage')
  async upsertSubscription(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpsertSchoolSubscriptionDto,
  ) {
    const data = await this.billing.upsertSchoolSubscription(req.user, id, dto);
    return { success: true, data };
  }

  @Get('schools/:id/modules')
  @RequireClaim('platform_schools', 'view')
  async listSchoolModules(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const data = await this.billing.listSchoolModules(req.user, id);
    return { success: true, data };
  }

  /** Per-school module grants that survive a plan sync. */
  @Put('schools/:id/modules')
  @RequireClaim('platform_schools', 'manage')
  async setSchoolModules(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
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
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: IssueInvoiceDto,
  ) {
    const data = await this.billing.issueInvoice(req.user, id, dto);
    return { success: true, data };
  }

  @Post('invoices/:id/mark-paid')
  @RequireClaim('platform_schools', 'manage')
  @UseInterceptors(
    FileInterceptor('receipt', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/platform-invoice-receipts';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ts = Date.now();
          const rand = Math.random().toString(36).slice(2, 12);
          const ext = (file.originalname.split('.').pop() || 'bin').slice(0, 8);
          cb(null, `inv_${ts}_${rand}.${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: invoiceReceiptFilter,
    }),
  )
  async markPaid(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: MarkInvoicePaidDto,
    @UploadedFile() receipt?: Express.Multer.File,
  ) {
    const paidReceiptUrl = receipt?.filename
      ? `/api/files/platform-invoice-receipts/${receipt.filename}`
      : undefined;
    const data = await this.billing.markInvoicePaid(req.user, id, dto, paidReceiptUrl);
    return { success: true, data };
  }
}
