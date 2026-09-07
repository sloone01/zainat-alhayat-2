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
  async sampleVariables() {
    const data = await this.templateService.getDefaultSampleVariables(null);
    return { success: true, data };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  async preview(
    @Request() req: { user: import('../entities/user.entity').User },
    @Body() body: PreviewNotificationTemplateDto,
  ) {
    const data = await this.templateService.preview(body, req.user);
    return { success: true, data };
  }

  @Get()
  async list(
    @Request() req: { user: import('../entities/user.entity').User },
    @Query('audience') audience?: NotificationTemplateAudience | 'all',
  ) {
    const data = await this.templateService.listMergedForPlatform(req.user, audience);
    return { success: true, data, count: data.length };
  }

  @Get(':templateKey')
  async one(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
  ) {
    const data = await this.templateService.getMergedForPlatform(req.user, templateKey);
    return { success: true, data };
  }

  @Put(':templateKey')
  async upsert(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
    @Body() body: UpdateSchoolNotificationTemplateDto,
  ) {
    const data = await this.templateService.updateDefinition(req.user, templateKey, body);
    return { success: true, data, message: 'Shared default updated' };
  }

  @Delete(':templateKey')
  @HttpCode(HttpStatus.OK)
  async reset(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
  ) {
    const data = await this.templateService.resetDefinitionToFactory(req.user, templateKey);
    return { success: true, data, message: 'Reset to product default' };
  }
}
