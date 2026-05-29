import {
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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { NotificationTemplateService } from '../services/notification-template.service';
import {
  PreviewNotificationTemplateDto,
  UpdateSchoolNotificationTemplateDto,
} from '../dto/notification-template.dto';

@Controller('notification-templates')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class NotificationTemplateController {
  constructor(private readonly templateService: NotificationTemplateService) {}

  @Get('definitions')
  async definitions() {
    const data = await this.templateService.listDefinitions();
    return { success: true, data, count: data.length };
  }

  @Get('sample-variables')
  async sampleVariables(
    @Request() req: { user: { school_id?: number | null } },
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.templateService.getDefaultSampleVariables(schoolId);
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
  async listForSchool(
    @Request() req: { user: import('../entities/user.entity').User },
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.templateService.listMergedForSchool(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get(':templateKey')
  async one(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.templateService.getMerged(req.user, schoolId, templateKey);
    return { success: true, data };
  }

  @Put(':templateKey')
  async upsert(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body() body: UpdateSchoolNotificationTemplateDto,
  ) {
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
  async reset(
    @Request() req: { user: import('../entities/user.entity').User },
    @Param('templateKey') templateKey: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.templateService.resetSchoolTemplate(req.user, schoolId, templateKey);
    return { success: true, data, message: 'Reset to system default' };
  }
}
