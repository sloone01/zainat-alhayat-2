import { Controller, Get } from '@nestjs/common';
import { PlatformBillingService } from './platform-billing.service';

@Controller('public/platform-plans')
export class PublicPlatformPlansController {
  constructor(private readonly billing: PlatformBillingService) {}

  @Get()
  async list() {
    const data = await this.billing.listPublicPlans();
    return { success: true, data };
  }
}
