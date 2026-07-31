import {
  Body,
  Controller,
  Get,
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
