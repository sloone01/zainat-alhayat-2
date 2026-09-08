import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { PlatformNotificationLayoutService } from '../services/platform-notification-layout.service';
import {
  PreviewNotificationLayoutDto,
  UpsertNotificationLayoutDto,
} from '../dto/notification-layout.dto';

@Controller('platform/notification-layouts')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class PlatformNotificationLayoutController {
  constructor(private readonly layoutService: PlatformNotificationLayoutService) {}

  @Get()
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async list(@Request() req: { user: User }) {
    const data = await this.layoutService.list(req.user);
    return { success: true, data, count: data.length };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async preview(@Request() req: { user: User }, @Body() body: PreviewNotificationLayoutDto) {
    const data = await this.layoutService.preview(req.user, body);
    return { success: true, data };
  }

  @Post()
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'manage' },
    { page: 'platform_schools', action: 'manage' },
  )
  async create(@Request() req: { user: User }, @Body() body: UpsertNotificationLayoutDto) {
    const data = await this.layoutService.create(req.user, body);
    return { success: true, data };
  }

  @Get(':id')
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async one(@Request() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    const data = await this.layoutService.get(req.user, id);
    return { success: true, data };
  }

  @Put(':id')
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'manage' },
    { page: 'platform_schools', action: 'manage' },
  )
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: UpsertNotificationLayoutDto,
  ) {
    const data = await this.layoutService.update(req.user, id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @RequireAnyClaim(
    { page: 'platform_notification_layouts', action: 'manage' },
    { page: 'platform_schools', action: 'manage' },
  )
  async remove(@Request() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    await this.layoutService.remove(req.user, id);
    return { success: true };
  }
}
