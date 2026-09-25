import {
  BadRequestException,
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
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { RequestedSchoolIdPipe, resolveActorSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { ReportExportConfigService } from '../services/report-export-config.service';
import { ReportExportTemplateService } from '../services/report-export-template.service';
import {
  PreviewReportExportTemplateDto,
  UpdateReportExportConfigDto,
  UpsertReportExportTemplateDto,
} from '../dto/report-export.dto';

const VIEW_CLAIMS = [
  { page: 'reports', action: 'view' },
  { page: 'reports_student_export', action: 'view' },
  { page: 'reports_exports', action: 'view' },
  { page: 'students', action: 'view' },
];

const EDIT_CLAIMS = [
  { page: 'reports', action: 'edit' },
  { page: 'reports_student_export', action: 'edit' },
  { page: 'reports_exports', action: 'edit' },
  { page: 'reports', action: 'export' },
];

@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportExportController {
  constructor(
    private readonly configs: ReportExportConfigService,
    private readonly templates: ReportExportTemplateService,
  ) {}

  @Get('exports')
  @RequireAnyClaim(...VIEW_CLAIMS)
  async listExports(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.configs.list(req.user, requestedSchoolId);
    return { success: true, data, count: data.length };
  }

  @Get('exports/:key')
  @RequireAnyClaim(...VIEW_CLAIMS)
  async getExport(
    @Request() req: { user: User },
    @Param('key') key: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('locale') localeRaw?: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const locale = localeRaw === 'en' ? 'en' : 'ar';
    const data = await this.configs.getOne(req.user, key, requestedSchoolId, locale);
    return { success: true, data };
  }

  @Put('exports/:key')
  @RequireAnyClaim(...EDIT_CLAIMS)
  async updateExport(
    @Request() req: { user: User },
    @Param('key') key: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: UpdateReportExportConfigDto,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.configs.update(req.user, key, body, requestedSchoolId);
    return { success: true, data };
  }

  @Get('export-templates')
  @RequireAnyClaim(...VIEW_CLAIMS, { page: 'reports_export_templates', action: 'view' })
  async listTemplates(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.templates.list(req.user, requestedSchoolId);
    return { success: true, data, count: data.length };
  }

  @Post('export-templates/preview')
  @HttpCode(HttpStatus.OK)
  @RequireAnyClaim(...VIEW_CLAIMS, { page: 'reports_export_templates', action: 'view' })
  async previewTemplate(
    @Request() req: { user: User },
    @Body() body: PreviewReportExportTemplateDto,
  ) {
    const data = await this.templates.preview(req.user, body);
    return { success: true, data };
  }

  @Post('export-templates')
  @RequireAnyClaim(...EDIT_CLAIMS, { page: 'reports_export_templates', action: 'edit' })
  async createTemplate(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: UpsertReportExportTemplateDto,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.templates.create(req.user, body, requestedSchoolId);
    return { success: true, data };
  }

  @Get('export-templates/:id')
  @RequireAnyClaim(...VIEW_CLAIMS, { page: 'reports_export_templates', action: 'view' })
  async getTemplate(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.templates.get(req.user, id, requestedSchoolId);
    return { success: true, data };
  }

  @Put('export-templates/:id')
  @RequireAnyClaim(...EDIT_CLAIMS, { page: 'reports_export_templates', action: 'edit' })
  async updateTemplate(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: UpsertReportExportTemplateDto,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    const data = await this.templates.update(req.user, id, body, requestedSchoolId);
    return { success: true, data };
  }

  @Delete('export-templates/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequireAnyClaim(...EDIT_CLAIMS, { page: 'reports_export_templates', action: 'delete' })
  async deleteTemplate(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    await this.templates.remove(req.user, id, requestedSchoolId);
  }

  /** Legacy alias used by older SPA builds. */
  @Get('student-export-config')
  @RequireAnyClaim(...VIEW_CLAIMS)
  async legacyGet(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('locale') localeRaw?: string,
  ) {
    const locale = localeRaw === 'en' ? 'en' : 'ar';
    const data = await this.configs.getOne(req.user, 'students', requestedSchoolId, locale);
    return {
      success: true,
      data: {
        columns: data.columns,
        layout_id: data.template_id,
        available_columns: data.available_columns,
        layouts: data.templates,
        layout_html: data.template_html,
      },
    };
  }

  @Put('student-export-config')
  @RequireAnyClaim(...EDIT_CLAIMS)
  async legacyPut(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: { columns: string[]; layout_id?: string | null },
  ) {
    const data = await this.configs.update(
      req.user,
      'students',
      { columns: body.columns, template_id: body.layout_id },
      requestedSchoolId,
    );
    return {
      success: true,
      data: { columns: data.columns, layout_id: data.template_id },
    };
  }
}
