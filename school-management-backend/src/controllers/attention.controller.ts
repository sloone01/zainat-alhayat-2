import { Controller, Get, Query, Request } from '@nestjs/common';
import { BizLog } from '../common/logging/biz-log.decorator';
import { User } from '../entities/user.entity';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { AttentionService } from '../services/attention.service';

@Controller('attention')
export class AttentionController {
  constructor(private readonly attention: AttentionService) {}

  @Get()
  @BizLog('start listing pending actions')
  @RequireAnyClaim(
    { page: 'dashboard', action: 'view' },
    { page: 'parent_dashboard', action: 'view' },
    { page: 'enrollments', action: 'view' },
    { page: 'student_payments', action: 'view' },
    { page: 'approvals', action: 'view' },
    { page: 'absence_excuses', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async list(@Request() req: { user: User }, @Query('locale') locale?: string) {
    const data = await this.attention.list(req.user, locale === 'en' ? 'en' : 'ar');
    return { success: true, data };
  }
}
