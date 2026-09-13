import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { ActivityLogService } from './activity-log.service';
import type { ActivityLogQuery } from './activity-log.service';

@Controller('platform/logs')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class ActivityLogController {
  constructor(private readonly logs: ActivityLogService) {}

  @Get()
  @RequireClaim('platform_schools', 'view')
  async list(@Req() req: { user: User }, @Query() query: ActivityLogQuery) {
    const data = await this.logs.list(req.user, query);
    return { success: true, data };
  }

  @Get('methods')
  @RequireClaim('platform_schools', 'view')
  async methods(@Req() req: { user: User }) {
    const data = await this.logs.methods(req.user);
    return { success: true, data };
  }
}
