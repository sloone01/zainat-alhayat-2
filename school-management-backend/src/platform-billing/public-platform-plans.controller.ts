import { BadRequestException, Controller, Get, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { PlatformBillingService } from './platform-billing.service';
import { Public } from '../auth/public.decorator';

@Public()
@Controller('public/platform-plans')
export class PublicPlatformPlansController {
  constructor(private readonly billing: PlatformBillingService) {}

  @Get()
  async list() {
    const data = await this.billing.listPublicPlans();
    return { success: true, data };
  }

  /** Checks a signup promo code for a plan + period; does not redeem it. */
  @Get('promo')
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async previewPromo(
    @Query('code') code?: string,
    @Query('plan_code') planCode?: string,
    @Query('billing_period') billingPeriod?: string,
  ) {
    if (!code?.trim() || !planCode?.trim() || !billingPeriod?.trim()) {
      throw new BadRequestException('code, plan_code and billing_period are required');
    }
    const data = await this.billing.previewPromo(code, planCode, billingPeriod);
    return { success: true, data };
  }
}
