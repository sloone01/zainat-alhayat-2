import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  SchoolReportExportTemplate,
} from '../entities/school-report-export.entity';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import {
  applyEmailLayout,
  brandingVariables,
  defaultNotificationLayoutHtml,
  ensureDocumentLocale,
} from '../notifications/school-notification-branding';
import { NotificationTemplateService } from './notification-template.service';

export type UpsertReportExportTemplateDto = {
  name: string;
  name_ar?: string | null;
  html_en: string;
  html_ar?: string | null;
  is_default?: boolean;
};

@Injectable()
export class ReportExportTemplateService {
  constructor(
    @InjectRepository(SchoolReportExportTemplate)
    private readonly repo: Repository<SchoolReportExportTemplate>,
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

  async ensureDefault(schoolId: string): Promise<SchoolReportExportTemplate> {
    const existing = await this.repo.findOne({
      where: { school_id: schoolId, is_default: true },
    });
    if (existing) return existing;
    const any = await this.repo.findOne({ where: { school_id: schoolId } });
    if (any) {
      any.is_default = true;
      return this.repo.save(any);
    }
    return this.repo.save(
      this.repo.create({
        school_id: schoolId,
        name: 'Default report layout',
        name_ar: 'التصميم الافتراضي للتقرير',
        html_en: defaultNotificationLayoutHtml('en'),
        html_ar: defaultNotificationLayoutHtml('ar'),
        is_default: true,
      }),
    );
  }

  async list(user: User, requestedSchoolId?: string | null) {
    const schoolId = this.schoolOf(user, requestedSchoolId);
    await this.ensureDefault(schoolId);
    return this.repo.find({
      where: { school_id: schoolId },
      order: { is_default: 'DESC', name: 'ASC' },
    });
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
    return row;
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
        }
      : {};
    const shell = applyEmailLayout(dto.html, sample);
    const withVars = shell.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) =>
      vars[key] != null ? String(vars[key]) : '',
    );
    return { html: ensureDocumentLocale(withVars, locale) };
  }
}
