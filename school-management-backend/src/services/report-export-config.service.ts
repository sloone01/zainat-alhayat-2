import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  buildPage,
  clampPage,
  likeTerm,
  parsePageQuery,
  type PageQuery,
  type PageResult,
} from '../common/pagination';
import { SchoolReportExportConfig } from '../entities/school-report-export.entity';
import { SchoolSystemSetting } from '../entities/school-system-setting.entity';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import {
  REPORT_EXPORT_DEFINITIONS,
  getReportExportDefinition,
} from '../common/reports/report-export-catalog';
import { ReportExportTemplateService } from './report-export-template.service';
import { STUDENT_EXPORT_SETTING_KEY } from './student-export-config.service';

@Injectable()
export class ReportExportConfigService {
  constructor(
    @InjectRepository(SchoolReportExportConfig)
    private readonly configRepo: Repository<SchoolReportExportConfig>,
    @InjectRepository(SchoolSystemSetting)
    private readonly settingRepo: Repository<SchoolSystemSetting>,
    private readonly templates: ReportExportTemplateService,
  ) {}

  private schoolOf(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  async list(user: User, requestedSchoolId?: string | null) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    await this.templates.ensureDefault(schoolId);
    await this.migrateLegacyStudentSetting(schoolId);

    const rows = await this.configRepo.find({ where: { school_id: schoolId } });
    const byKey = new Map(rows.map((r) => [r.report_key, r]));

    return REPORT_EXPORT_DEFINITIONS.map((def) => {
      const saved = byKey.get(def.key);
      const columns = saved
        ? def.normalizeColumns(saved.columns)
        : [...def.defaultColumns];
      return {
        key: def.key,
        name_en: def.nameEn,
        name_ar: def.nameAr,
        source_path: def.sourcePath,
        columns,
        template_id: saved?.template_id ?? null,
        configured: Boolean(saved),
      };
    });
  }

  async listPage(
    user: User,
    requestedSchoolId: string | null | undefined,
    query: PageQuery & { q?: string },
  ): Promise<PageResult<Awaited<ReturnType<ReportExportConfigService['list']>>[number]>> {
    const rows = await this.list(user, requestedSchoolId);
    const needle = likeTerm(query.q);
    const q = needle ? needle.slice(1, -1) : '';
    const filtered = q
      ? rows.filter((row) => `${row.name_en} ${row.name_ar} ${row.source_path}`.toLowerCase().includes(q))
      : rows;
    const { page, limit } = parsePageQuery(query);
    const total = filtered.length;
    const safePage = clampPage(page, total, limit);
    return buildPage(filtered.slice((safePage - 1) * limit, safePage * limit), total, safePage, limit);
  }

  async getOne(
    user: User,
    key: string,
    requestedSchoolId?: string | null,
    locale: 'en' | 'ar' = 'ar',
  ) {
    const def = getReportExportDefinition(key);
    if (!def) throw new NotFoundException('Unknown report export');
    const schoolId = this.schoolOf(user, requestedSchoolId);
    await this.templates.ensureDefault(schoolId);
    await this.migrateLegacyStudentSetting(schoolId);

    let row = await this.configRepo.findOne({
      where: { school_id: schoolId, report_key: key },
    });
    if (!row) {
      const dueTemplate =
        key === 'due-installments'
          ? await this.templates.ensureDueInstallmentsTemplate(schoolId)
          : null;
      row = this.configRepo.create({
        school_id: schoolId,
        report_key: key,
        columns: [...def.defaultColumns],
        template_id: dueTemplate?.id ?? null,
      });
      row = await this.configRepo.save(row);
    }

    if (row.template_id) {
      const ok = await this.templates.existsInSchool(schoolId, row.template_id);
      if (!ok) {
        row.template_id = null;
        row = await this.configRepo.save(row);
      }
    }

    const template_html = await this.templates.resolveBrandedHtml(
      schoolId,
      row.template_id,
      locale,
    );

    return {
      key: def.key,
      name_en: def.nameEn,
      name_ar: def.nameAr,
      source_path: def.sourcePath,
      columns: def.normalizeColumns(row.columns),
      template_id: row.template_id,
      available_columns: [...def.availableColumns],
      templates: await this.templates.listOptions(schoolId),
      template_html,
    };
  }

  async update(
    user: User,
    key: string,
    body: { columns: string[]; template_id?: string | null },
    requestedSchoolId?: string | null,
  ) {
    const def = getReportExportDefinition(key);
    if (!def) throw new NotFoundException('Unknown report export');
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const columns = def.normalizeColumns(body.columns);

    let template_id =
      body.template_id === undefined
        ? undefined
        : body.template_id == null || body.template_id === ''
          ? null
          : body.template_id;
    if (template_id) {
      const ok = await this.templates.existsInSchool(schoolId, template_id);
      if (!ok) throw new NotFoundException('Template not found');
    }

    let row = await this.configRepo.findOne({
      where: { school_id: schoolId, report_key: key },
    });
    if (!row) {
      row = this.configRepo.create({
        school_id: schoolId,
        report_key: key,
        columns,
        template_id: template_id ?? null,
      });
    } else {
      row.columns = columns;
      if (template_id !== undefined) row.template_id = template_id;
    }
    row = await this.configRepo.save(row);
    return {
      key,
      columns: def.normalizeColumns(row.columns),
      template_id: row.template_id,
    };
  }

  /** One-time migrate from school_system_settings `reports.student_export`. */
  private async migrateLegacyStudentSetting(schoolId: string) {
    const existing = await this.configRepo.findOne({
      where: { school_id: schoolId, report_key: 'students' },
    });
    if (existing) return;

    const setting = await this.settingRepo.findOne({
      where: { school_id: schoolId, setting_key: STUDENT_EXPORT_SETTING_KEY },
    });
    if (!setting?.value_json || typeof setting.value_json !== 'object') return;
    const raw = setting.value_json as { columns?: unknown; layout_id?: unknown };
    const def = getReportExportDefinition('students');
    if (!def) return;
    const columns = def.normalizeColumns(raw.columns);
    let template_id: string | null = null;
    // Old config pointed at notification layouts; ignore that FK and start clean.
    void raw.layout_id;
    await this.configRepo.save(
      this.configRepo.create({
        school_id: schoolId,
        report_key: 'students',
        columns,
        template_id,
      }),
    );
  }
}
