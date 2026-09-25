import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SchoolReportExportConfig,
  SchoolReportExportTemplate,
} from '../entities/school-report-export.entity';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import {
  applyEmailLayout,
  brandingVariables,
  ensureDocumentLocale,
} from '../notifications/school-notification-branding';
import {
  defaultReportExportLayoutHtml,
  dueInstallmentsReportLayoutHtml,
  isLegacyEmailReportShell,
  isOutdatedReportShell,
  reportOrientationFromHtml,
} from '../reports/default-report-export-layout';
import { NotificationTemplateService } from './notification-template.service';

export type UpsertReportExportTemplateDto = {
  name: string;
  name_ar?: string | null;
  html_en: string;
  html_ar?: string | null;
  is_default?: boolean;
};

/** Filled in for {{date}} when a report is previewed or exported. */
function reportGeneratedAt(locale: 'en' | 'ar'): string {
  return new Date().toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

@Injectable()
export class ReportExportTemplateService {
  constructor(
    @InjectRepository(SchoolReportExportTemplate)
    private readonly repo: Repository<SchoolReportExportTemplate>,
    @InjectRepository(SchoolReportExportConfig)
    private readonly configRepo: Repository<SchoolReportExportConfig>,
    private readonly templateService: NotificationTemplateService,
  ) {}

  private schoolOf(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  private assertContentSlot(html: string) {
    if (!/\{\{\s*content\s*\}\}/i.test(html)) {
      throw new BadRequestException(
        'Template HTML must include {{content}} where the report table is inserted',
      );
    }
  }

  private async clearDefault(schoolId: string) {
    await this.repo
      .createQueryBuilder()
      .update(SchoolReportExportTemplate)
      .set({ is_default: false })
      .where('school_id = :schoolId', { schoolId })
      .execute();
  }

  /** Starter print layout for due and late payments. Safe to call more than once. */
  async ensureDueInstallmentsTemplate(schoolId: string): Promise<SchoolReportExportTemplate> {
    const marker = 'data-rpt-vars="student installment dueDate balance status"';
    const existing = await this.repo
      .createQueryBuilder('t')
      .where('t.school_id = :schoolId', { schoolId })
      .andWhere(
        '(t.name = :name OR t.name_ar = :nameAr OR t.html_en LIKE :marker)',
        {
          name: 'Due and late payments',
          nameAr: 'المستحق والمتأخر',
          marker: `%${marker}%`,
        },
      )
      .getOne();
    if (existing) return existing;

    const saved = await this.repo.save(
      this.repo.create({
        school_id: schoolId,
        name: 'Due and late payments',
        name_ar: 'المستحق والمتأخر',
        html_en: dueInstallmentsReportLayoutHtml('en'),
        html_ar: dueInstallmentsReportLayoutHtml('ar'),
        is_default: false,
      }),
    );
    await this.configRepo
      .createQueryBuilder()
      .update(SchoolReportExportConfig)
      .set({ template_id: saved.id })
      .where('school_id = :schoolId', { schoolId })
      .andWhere('report_key = :key', { key: 'due-installments' })
      .andWhere('template_id IS NULL')
      .execute();
    return saved;
  }

  async ensureDefault(schoolId: string): Promise<SchoolReportExportTemplate> {
    const existing = await this.repo.findOne({
      where: { school_id: schoolId, is_default: true },
    });
    let fallback = existing;
    if (!fallback) {
      const any = await this.repo.findOne({ where: { school_id: schoolId } });
      if (any) {
        any.is_default = true;
        fallback = await this.repo.save(any);
      } else {
        fallback = await this.repo.save(
          this.repo.create({
            school_id: schoolId,
            name: 'Default report layout',
            name_ar: 'التصميم الافتراضي للتقرير',
            html_en: defaultReportExportLayoutHtml('en', 'portrait'),
            html_ar: defaultReportExportLayoutHtml('ar', 'portrait'),
            is_default: true,
          }),
        );
      }
    }
    await this.ensureDueInstallmentsTemplate(schoolId);
    return fallback;
  }

  /** Replace leftover email-card shells with the print page (keeps custom HTML). */
  private async present(row: SchoolReportExportTemplate): Promise<SchoolReportExportTemplate> {
    let changed = false;
    const enOrient = isLegacyEmailReportShell(row.html_en)
      ? 'portrait'
      : reportOrientationFromHtml(row.html_en);
    if (isLegacyEmailReportShell(row.html_en) || isOutdatedReportShell(row.html_en)) {
      row.html_en = defaultReportExportLayoutHtml('en', enOrient);
      changed = true;
    }
    const arSource = row.html_ar?.trim() ? row.html_ar : row.html_en;
    const arOrient = isLegacyEmailReportShell(arSource)
      ? 'portrait'
      : reportOrientationFromHtml(arSource);
    if (
      !row.html_ar?.trim() ||
      isLegacyEmailReportShell(row.html_ar) ||
      isOutdatedReportShell(row.html_ar)
    ) {
      if (changed || row.html_ar?.trim()) {
        row.html_ar = defaultReportExportLayoutHtml('ar', changed ? enOrient : arOrient);
        changed = true;
      }
    }
    return changed ? this.repo.save(row) : row;
  }

  async list(user: User, requestedSchoolId?: string | null) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    await this.ensureDefault(schoolId);
    const rows = await this.repo.find({
      where: { school_id: schoolId },
      order: { is_default: 'DESC', name: 'ASC' },
    });
    return Promise.all(rows.map((row) => this.present(row)));
  }

  async listOptions(schoolId: string) {
    await this.ensureDefault(schoolId);
    const rows = await this.repo.find({
      where: { school_id: schoolId },
      order: { is_default: 'DESC', name: 'ASC' },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      name_ar: r.name_ar,
      is_default: r.is_default,
    }));
  }

  async get(user: User, id: string, requestedSchoolId?: string | null) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const row = await this.repo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Template not found');
    return this.present(row);
  }

  async create(
    user: User,
    dto: UpsertReportExportTemplateDto,
    requestedSchoolId?: string | null,
  ) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    this.assertContentSlot(dto.html_en);
    if (dto.html_ar?.trim()) this.assertContentSlot(dto.html_ar);
    if (dto.is_default) await this.clearDefault(schoolId);
    return this.repo.save(
      this.repo.create({
        school_id: schoolId,
        name: dto.name.trim(),
        name_ar: dto.name_ar?.trim() || null,
        html_en: dto.html_en,
        html_ar: dto.html_ar?.trim() || null,
        is_default: Boolean(dto.is_default),
      }),
    );
  }

  async update(
    user: User,
    id: string,
    dto: UpsertReportExportTemplateDto,
    requestedSchoolId?: string | null,
  ) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const row = await this.repo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Template not found');
    this.assertContentSlot(dto.html_en);
    if (dto.html_ar?.trim()) this.assertContentSlot(dto.html_ar);
    if (dto.is_default) await this.clearDefault(schoolId);
    row.name = dto.name.trim();
    row.name_ar = dto.name_ar?.trim() || null;
    row.html_en = dto.html_en;
    row.html_ar = dto.html_ar?.trim() || null;
    row.is_default = Boolean(dto.is_default);
    return this.repo.save(row);
  }

  async remove(user: User, id: string, requestedSchoolId?: string | null) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    const row = await this.repo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Template not found');
    await this.repo.remove(row);
    await this.ensureDefault(schoolId);
  }

  async existsInSchool(schoolId: string, templateId: string): Promise<boolean> {
    return this.repo.exist({ where: { id: templateId, school_id: schoolId } });
  }

  async resolveHtml(
    schoolId: string,
    templateId: string | null | undefined,
    locale: 'en' | 'ar',
  ): Promise<string | null> {
    let row: SchoolReportExportTemplate | null = null;
    if (templateId) {
      row = await this.repo.findOne({ where: { id: templateId, school_id: schoolId } });
    }
    if (!row) {
      row = await this.repo.findOne({ where: { school_id: schoolId, is_default: true } });
    }
    if (!row) return null;
    row = await this.present(row);
    if (locale === 'ar') return row.html_ar?.trim() || row.html_en;
    return row.html_en;
  }

  async resolveBrandedHtml(
    schoolId: string,
    templateId: string | null,
    locale: 'en' | 'ar',
  ): Promise<string | null> {
    const html = await this.resolveHtml(schoolId, templateId, locale);
    if (!html?.trim()) return null;
    const branding = await this.templateService.getSchoolBranding(schoolId);
    const vars: Record<string, string> = {
      ...brandingVariables(branding),
      schoolName: branding.schoolName,
      schoolLogo: branding.schoolLogo,
      schoolLogoHtml: branding.schoolLogoHtml,
      footerText: branding.footerText,
      date: reportGeneratedAt(locale),
    };
    return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, key: string) => {
      if (String(key).toLowerCase() === 'content') return match;
      return vars[key] != null ? String(vars[key]) : '';
    });
  }

  async preview(
    user: User,
    dto: {
      locale?: 'en' | 'ar';
      html: string;
      sample_content?: string;
      school_id?: string;
    },
  ) {
    const schoolId =
      dto.school_id != null ? this.schoolOf(user, dto.school_id) : resolveActorSchoolId(user);
    const locale = dto.locale === 'en' ? 'en' : 'ar';
    const sample =
      dto.sample_content?.trim() ||
      (locale === 'ar'
        ? '<p>نص تجريبي لجدول التقرير.</p>'
        : '<p>Sample report table content.</p>');
    const branding =
      schoolId != null ? await this.templateService.getSchoolBranding(schoolId) : null;
    const vars: Record<string, string> = branding
      ? {
          ...brandingVariables(branding),
          schoolName: branding.schoolName,
          schoolLogo: branding.schoolLogo,
          schoolLogoHtml: branding.schoolLogoHtml,
          footerText: branding.footerText,
          date: reportGeneratedAt(locale),
        }
      : { date: reportGeneratedAt(locale) };
    const shell = applyEmailLayout(dto.html, sample);
    const withVars = shell.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) =>
      vars[key] != null ? String(vars[key]) : '',
    );
    return { html: ensureDocumentLocale(withVars, locale) };
  }
}
