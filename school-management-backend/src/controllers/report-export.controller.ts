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
  StreamableFile,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireAnyClaim } from '../rbac/require-claim.decorator';
import { RequestedSchoolIdPipe, resolveActorSchoolId } from '../common/security/school-access';
import { wantsPage } from '../common/pagination';
import { User } from '../entities/user.entity';
import { ReportExportConfigService } from '../services/report-export-config.service';
import { ReportExportTemplateService } from '../services/report-export-template.service';
import { CourseListDocumentRow, DueDocumentRow, ReportDocxService } from '../services/report-docx.service';
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
  { page: 'courses', action: 'view' },
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
    private readonly reportDocx: ReportDocxService,
  ) {}

  @Get('exports')
  @RequireAnyClaim(...VIEW_CLAIMS)
  async listExports(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    if (wantsPage(page)) {
      const data = await this.configs.listPage(req.user, requestedSchoolId, { page, limit, q });
      return { success: true, data };
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
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('q') q?: string,
  ) {
    if (resolveActorSchoolId(req.user, requestedSchoolId) == null) {
      throw new BadRequestException('school_id is required');
    }
    if (wantsPage(page)) {
      const data = await this.templates.listPage(req.user, requestedSchoolId, { page, limit, q });
      return { success: true, data };
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

  /** Course list as a filled Word file. PDF is that same file converted. Excel stays on the client. */
  @Post('courses/document')
  @RequireAnyClaim({ page: 'courses', action: 'view' })
  async coursesDocument(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: CourseListDocumentBody,
  ): Promise<StreamableFile> {
    const schoolId = resolveActorSchoolId(req.user, requestedSchoolId);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    const format = body?.format === 'pdf' ? 'pdf' : 'docx';
    const locale = body?.locale === 'en' ? 'en' : 'ar';
    const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 5000).map(cleanCourseRow) : [];
    if (!rows.length) throw new BadRequestException('rows are required');
    const labels = body?.labels || {};
    const file = await this.reportDocx.renderCourseList({
      schoolId,
      locale,
      title: text(body?.title),
      subtitle: text(body?.subtitle),
      labels: {
        labelTitle: text(labels.title),
        labelCategory: text(labels.category),
        labelStatus: text(labels.status),
        labelPhases: text(labels.phases),
        labelMilestones: text(labels.milestones),
      },
      rows,
      format,
    });
    return new StreamableFile(file.buffer, {
      type: file.mime,
      disposition: `attachment; filename="${file.filename}"`,
    });
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

  /** Due/late payments as a filled Word file. PDF is that same file converted. */
  @Post('due-installments/document')
  @HttpCode(HttpStatus.OK)
  @RequireAnyClaim(
    { page: 'reports_fees_due', action: 'export' },
    { page: 'reports_fees_due', action: 'view' },
  )
  async dueInstallmentsDocument(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: DueInstallmentsDocumentBody,
  ): Promise<StreamableFile> {
    const schoolId = resolveActorSchoolId(req.user, requestedSchoolId);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    const format = body?.format === 'pdf' ? 'pdf' : 'docx';
    const locale = body?.locale === 'en' ? 'en' : 'ar';
    const rows = Array.isArray(body?.rows) ? body.rows.slice(0, 5000).map(cleanRow) : [];
    if (!rows.length) throw new BadRequestException('rows are required');
    const labels = body?.labels || {};
    const file = await this.reportDocx.renderDueInstallments({
      schoolId,
      locale,
      title: text(body?.title),
      subtitle: text(body?.subtitle),
      labels: {
        labelStudent: text(labels.student),
        labelInstallment: text(labels.installment),
        labelDueDate: text(labels.dueDate),
        labelBalance: text(labels.balance),
        labelStatus: text(labels.status),
        labelAmountDue: text(labels.amountDue),
        labelAmountPaid: text(labels.amountPaid),
        labelDaysOverdue: text(labels.daysOverdue),
      },
      rows,
      format,
    });
    return new StreamableFile(file.buffer, {
      type: file.mime,
      disposition: `attachment; filename="${file.filename}"`,
    });
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

type CourseListDocumentBody = {
  format?: 'docx' | 'pdf';
  locale?: 'en' | 'ar';
  title?: string;
  subtitle?: string;
  labels?: Partial<Record<keyof CourseListDocumentRow, string>>;
  rows?: Array<Partial<CourseListDocumentRow>>;
};

type DueInstallmentsDocumentBody = {
  format?: 'docx' | 'pdf';
  locale?: 'en' | 'ar';
  title?: string;
  subtitle?: string;
  labels?: Partial<Record<keyof DueDocumentRow, string>>;
  rows?: Array<Partial<DueDocumentRow>>;
};

function text(value: unknown): string {
  return String(value ?? '').slice(0, 500);
}

function cleanCourseRow(row: Partial<CourseListDocumentRow>): CourseListDocumentRow {
  return {
    title: text(row?.title),
    category: text(row?.category),
    status: text(row?.status),
    phases: text(row?.phases),
    milestones: text(row?.milestones),
  };
}

function cleanRow(row: Partial<DueDocumentRow>): DueDocumentRow {
  return {
    student: text(row?.student),
    installment: text(row?.installment),
    dueDate: text(row?.dueDate),
    balance: text(row?.balance),
    status: text(row?.status),
    amountDue: text(row?.amountDue),
    amountPaid: text(row?.amountPaid),
    daysOverdue: text(row?.daysOverdue),
  };
}
