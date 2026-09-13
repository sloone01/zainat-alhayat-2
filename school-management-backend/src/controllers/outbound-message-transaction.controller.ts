import {
  BadRequestException,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import {
  isPlatformActor,
  resolveActorSchoolId,
  RequestedSchoolIdPipe,
} from '../common/security/school-access';
import { OutboundMessageTransactionService } from '../services/outbound-message-transaction.service';
import type {
  OutboundMessageChannel,
  OutboundMessageStatus,
} from '../entities/outbound-message-transaction.entity';

@Controller('notification-transactions')
export class OutboundMessageTransactionController {
  constructor(private readonly service: OutboundMessageTransactionService) {}

  @Get()
  @RequireAnyClaim(
    { page: 'notification_transactions', action: 'view' },
    { page: 'platform_notification_transactions', action: 'view' },
  )
  async list(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
    @Query('channel') channel?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
  ) {
    const platform = isPlatformActor(req.user);
    const schoolId = platform
      ? requestedSchoolId ?? null
      : resolveActorSchoolId(req.user, requestedSchoolId);
    if (!platform && schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.service.list({
      schoolId,
      platformScope: platform,
      channel: (channel as OutboundMessageChannel | '') || '',
      status: (status as OutboundMessageStatus | '') || '',
      search,
      page: page ? Number(page) : 1,
      pageSize: pageSize ? Number(pageSize) : 20,
    });
    return { success: true, data };
  }

  @Get(':id')
  @RequireAnyClaim(
    { page: 'notification_transactions', action: 'view' },
    { page: 'platform_notification_transactions', action: 'view' },
  )
  async getOne(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const row = await this.service.getByIdForActor(id, req.user, requestedSchoolId);
    return { success: true, data: row };
  }

  @Post(':id/resend')
  @RequireAnyClaim(
    { page: 'notification_transactions', action: 'manage' },
    { page: 'platform_notification_transactions', action: 'manage' },
  )
  async resend(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const row = await this.service.resend(id, req.user, requestedSchoolId);
    return { success: true, data: row };
  }
}
