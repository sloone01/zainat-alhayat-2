import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { resolveActorSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { NotificationTemplateService } from '../services/notification-template.service';
import {
  PreviewNotificationTemplateDto,
  UpdateSchoolNotificationTemplateDto,
} from '../dto/notification-template.dto';

@Controller('notification-templates')
@UseGuards(JwtAuthGuard)
export class NotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  private schoolOf(req: { user: User }, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get('definitions')
  @RequireClaim('notification_templates', 'view')
  async definitions() {
    const data = await this.templateService.listDefinitions();
    return { success: true, data, count: data.length };
  }

  @Get('sample-variables')
  @RequireClaim('notification_templates', 'view')
  async sampleVariables(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.templateService.getDefaultSampleVariables(schoolId);
    return { success: true, data };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('notification_templates', 'view')
  async preview(
    @Request() req: { user: User },
    @Body() body: PreviewNotificationTemplateDto,
  ) {
    const schoolId =
      body.school_id != null ? this.schoolOf(req, body.school_id) : resolveActorSchoolId(req.user);
    const data = await this.templateService.preview(
      schoolId != null ? { ...body, school_id: schoolId } : body,
      req.user,
    );
    return { success: true, data };
  }

  @Get()
  @RequireClaim('notification_templates', 'view')
  async listForSchool(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.templateService.listMergedForSchool(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get(':templateKey')
  @RequireClaim('notification_templates', 'view')
  async one(
    @Request() req: { user: User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.templateService.getMerged(req.user, schoolId, templateKey);
    return { success: true, data };
  }

  @Put(':templateKey')
  @RequireClaim('notification_templates', 'edit')
  async upsert(
    @Request() req: { user: User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Body() body: UpdateSchoolNotificationTemplateDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.templateService.upsertSchoolTemplate(
      req.user,
      schoolId,
      templateKey,
      body,
    );
    return { success: true, data, message: 'Template saved for your school' };
  }

  @Delete(':templateKey')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('notification_templates', 'edit')
  async reset(
    @Request() req: { user: User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.templateService.resetSchoolTemplate(req.user, schoolId, templateKey);
    return { success: true, data, message: 'Reset to system default' };
  }
}
