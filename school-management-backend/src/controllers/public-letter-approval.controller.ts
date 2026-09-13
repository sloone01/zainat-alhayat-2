import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../auth/public.decorator';
import { PublicLetterApprovalDecisionDto } from '../dto/public-letter-approval.dto';
import { LetterApprovalLinkService } from '../chat/letter-approval-link.service';

@Public()
@Controller('public/letter-approvals')
export class PublicLetterApprovalController {
  constructor(private readonly links: LetterApprovalLinkService) {}

  @Get()
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async preview(@Query('token') token?: string) {
    const data = await this.links.preview(token || '');
    return { success: true, data };
  }

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  async decide(@Body() dto: PublicLetterApprovalDecisionDto) {
    const data = await this.links.decide(dto.token, dto.decision);
    return { success: true, data };
  }
}
