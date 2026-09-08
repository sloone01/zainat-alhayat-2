import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ClaimGuard } from '../rbac/claim.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { NotificationTemplateService } from '../services/notification-template.service';
import {
  PreviewNotificationTemplateDto,
  UpdateSchoolNotificationTemplateDto,
} from '../dto/notification-template.dto';
import type { NotificationTemplateAudience } from '../entities/notification-template-definition.entity';

@Controller('platform/notification-templates')
@UseGuards(JwtAuthGuard, ClaimGuard)
export class PlatformNotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  @Get('sample-variables')
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async sampleVariables() {
    const data = await this.templateService.getDefaultSampleVariables(null);
    return { success: true, data };
  }

  @Post('preview')
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  @HttpCode(HttpStatus.OK)
  async preview(
    @Request() req: { user: import('../entities/user.entity').User },
    @Body() body: PreviewNotificationTemplateDto,
  ) {
    const data = await this.templateService.preview(body, req.user);
    return { success: true, data };
  }

  @Get()
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async list(
    @Request() req: { user: import('../entities/user.entity').User },
    @Query('audience') audience?: NotificationTemplateAudience | 'all',
  ) {
    const data = await this.templateService.listMergedForPlatform(req.user, audience);
    return { success: true, data, count: data.length };
  }

  @Get(':templateKey')
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'view' },
    { page: 'platform_schools', action: 'view' },
  )
  async one(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
  ) {
    const data = await this.templateService.getMergedForPlatform(req.user, templateKey);
    return { success: true, data };
  }

  @Put(':templateKey')
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'manage' },
    { page: 'platform_schools', action: 'manage' },
  )
  async upsert(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
    @Body() body: UpdateSchoolNotificationTemplateDto,
  ) {
    const data = await this.templateService.updateDefinition(req.user, templateKey, body);
    return { success: true, data, message: 'Shared default updated' };
  }

  @Delete(':templateKey')
  @RequireAnyClaim(
    { page: 'platform_notification_templates', action: 'manage' },
    { page: 'platform_schools', action: 'manage' },
  )
  @HttpCode(HttpStatus.OK)
  async reset(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
  ) {
    const data = await this.templateService.resetDefinitionToFactory(req.user, templateKey);
    return { success: true, data, message: 'Reset to product default' };
  }
}
