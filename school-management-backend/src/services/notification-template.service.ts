import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { SchoolLandingPage } from '../entities/school-landing-page.entity';
import {
  NotificationTemplateDefinition,
  type NotificationTemplateAudience,
} from '../entities/notification-template-definition.entity';
import { SchoolNotificationTemplate } from '../entities/school-notification-template.entity';
import { SchoolNotificationLayout } from '../entities/school-notification-layout.entity';
import type {
  PreviewNotificationTemplateDto,
  UpdateSchoolNotificationTemplateDto,
} from '../dto/notification-template.dto';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import {
  absolutizePublicUrl,
  applyEmailLayout,
  brandingVariables,
  buildSchoolLogoHtml,
  type SchoolNotificationBranding,
  wrapEmailWithSchoolChrome,
} from '../notifications/school-notification-branding';

/** Replace `{{ key }}` placeholders (supports spaces inside braces). */
export function applyNotificationTemplateVariables(
  template: string | null | undefined,
  variables: Record<string, string>,
): string {
  if (template == null || template === '') return '';
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) =>
    Object.prototype.hasOwnProperty.call(variables, key)
      ? String(variables[key])
      : `{{${key}}}`,
  );
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * HTML-context variant of `applyNotificationTemplateVariables`: every substituted value is
 * HTML-escaped, since variables (student/parent/school names) originate from user input.
 * Keys ending in `Html` (e.g. `schoolLogoHtml`) carry server-built, pre-escaped markup and
 * are inserted as-is. Use this for `body_html`; keep the plain variant for subject/SMS.
 */
export function applyNotificationTemplateVariablesHtml(
  template: string | null | undefined,
  variables: Record<string, string>,
): string {
  if (template == null || template === '') return '';
  return template.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key: string) => {
    if (!Object.prototype.hasOwnProperty.call(variables, key)) return `{{${key}}}`;
    const value = String(variables[key]);
    return key.endsWith('Html') ? value : escapeHtml(value);
  });
}

export type NotificationTemplateLocaleBlock = {
  subject: string;
  body_html: string;
  body_sms: string;
};

export type MergedNotificationTemplate = {
  template_key: string;
  display_name: string;
  description: string | null;
  channel: string;
  audience: NotificationTemplateAudience;
  en: NotificationTemplateLocaleBlock;
  ar: NotificationTemplateLocaleBlock;
  variable_hints: { name: string; description: string }[] | null;
  uses_school_overrides: boolean;
  uses_custom_default: boolean;
  layout_id: string | null;
};

const PAYMENT_RECEIPT_SUBJECT_EN = 'Payment received — {{schoolName}}';
const PAYMENT_RECEIPT_SUBJECT_AR = 'تم استلام الدفعة — {{schoolName}}';

@Injectable()
export class NotificationTemplateService {
  constructor(
    @InjectRepository(NotificationTemplateDefinition)
    private readonly defRepo: Repository<NotificationTemplateDefinition>,
    @InjectRepository(SchoolNotificationTemplate)
    private readonly schoolTplRepo: Repository<SchoolNotificationTemplate>,
    @InjectRepository(SchoolNotificationLayout)
    private readonly layoutRepo: Repository<SchoolNotificationLayout>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(SchoolLandingPage)
    private readonly landingRepo: Repository<SchoolLandingPage>,
    private readonly config: ConfigService,
  ) {}

  private publicAppBase(): string {
    const raw =
      this.config.get<string>('PUBLIC_APP_URL')?.trim() ||
      this.config.get<string>('CORS_ORIGIN')?.split(',')[0]?.trim() ||
      '';
    return raw;
  }

  async getSchoolBranding(schoolId: number | null): Promise<SchoolNotificationBranding> {
    if (schoolId == null) {
      return {
        schoolName: 'School',
        schoolLogo: '',
        schoolLogoHtml: '',
        footerText: 'Thank you for your trust. Contact the school office with any questions.',
      };
    }
    const [school, landing] = await Promise.all([
      this.schoolRepo.findOne({ where: { id: schoolId } }),
      this.landingRepo.findOne({ where: { school_id: schoolId } }),
    ]);
    const schoolName = school?.name?.trim() || 'School';
    const rawLogo = school?.logo_url?.trim() || landing?.logo_url?.trim() || '';
    const schoolLogo = absolutizePublicUrl(rawLogo, this.publicAppBase());
    return {
      schoolName,
      schoolLogo,
      schoolLogoHtml: buildSchoolLogoHtml(schoolLogo, schoolName),
      footerText:
        school?.address?.trim() ||
        'Thank you for your trust. For questions, reply to this email or contact the school office.',
    };
  }

  applySchoolBranding(
    variables: Record<string, string>,
    branding: SchoolNotificationBranding,
  ): Record<string, string> {
    return {
      ...brandingVariables(branding),
      ...variables,
      schoolName: branding.schoolName,
      schoolLogo: branding.schoolLogo,
      schoolLogoHtml: branding.schoolLogoHtml,
    };
  }

  private isPlatformUser(user: User): boolean {
    return !!(user.isSuperAdmin || user.isSystemUser);
  }

  private assertAdminSchool(user: User, schoolId: number): void {
    if (this.isPlatformUser(user)) return;
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage notification templates');
    }
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only manage templates for your school');
    }
  }

  private assertPlatformUser(user: User): void {
    if (!this.isPlatformUser(user)) {
      throw new ForbiddenException('Platform access required');
    }
  }

  private assertSchoolAudience(def: NotificationTemplateDefinition): void {
    if ((def.audience || 'school') === 'system') {
      throw new ForbiddenException('School administrators cannot edit system templates');
    }
  }

  async listDefinitions(): Promise<NotificationTemplateDefinition[]> {
    return this.defRepo.find({ order: { display_name: 'ASC' } });
  }

  private mergeLocale(
    def: NotificationTemplateDefinition,
    row: SchoolNotificationTemplate | null,
    locale: 'en' | 'ar',
  ): NotificationTemplateLocaleBlock {
    const isAr = locale === 'ar';
    let subject = isAr
      ? (row?.subject_override_ar ?? def.default_subject_ar ?? def.default_subject ?? '')
      : (row?.subject_override ?? def.default_subject ?? '');
    if (def.template_key === NOTIFICATION_TEMPLATE_KEYS.PAYMENT_RECEIPT) {
      subject = isAr
        ? (def.default_subject_ar?.trim() || PAYMENT_RECEIPT_SUBJECT_AR)
        : (def.default_subject?.trim() || PAYMENT_RECEIPT_SUBJECT_EN);
    }
    const body_html = isAr
      ? (row?.body_html_override_ar ?? def.default_body_html_ar ?? def.default_body_html ?? '')
      : (row?.body_html_override ?? def.default_body_html ?? '');
    const body_sms = isAr
      ? (row?.body_sms_override_ar ?? def.default_body_sms_ar ?? def.default_body_sms ?? '')
      : (row?.body_sms_override ?? def.default_body_sms ?? '');
    return { subject, body_html, body_sms };
  }

  private usesCustomDefault(def: NotificationTemplateDefinition): boolean {
    const norm = (v: string | null | undefined) => (v ?? '').trim();
    return (
      norm(def.default_subject) !== norm(def.factory_subject ?? def.default_subject) ||
      norm(def.default_body_html) !== norm(def.factory_body_html ?? def.default_body_html) ||
      norm(def.default_body_sms) !== norm(def.factory_body_sms ?? def.default_body_sms) ||
      norm(def.default_subject_ar) !== norm(def.factory_subject_ar ?? def.default_subject_ar) ||
      norm(def.default_body_html_ar) !==
        norm(def.factory_body_html_ar ?? def.default_body_html_ar) ||
      norm(def.default_body_sms_ar) !== norm(def.factory_body_sms_ar ?? def.default_body_sms_ar)
    );
  }

  private mergeOne(
    def: NotificationTemplateDefinition,
    row: SchoolNotificationTemplate | null,
  ): MergedNotificationTemplate {
    return {
      template_key: def.template_key,
      display_name: def.display_name,
      description: def.description,
      channel: def.channel,
      audience: def.audience || 'school',
      en: this.mergeLocale(def, row, 'en'),
      ar: this.mergeLocale(def, row, 'ar'),
      variable_hints: this.withBrandingHints(def.variable_hints),
      uses_school_overrides: !!row,
      uses_custom_default: this.usesCustomDefault(def),
      layout_id: row?.layout_id ?? null,
    };
  }

  async listMergedForSchool(user: User, schoolId: number): Promise<MergedNotificationTemplate[]> {
    this.assertAdminSchool(user, schoolId);
    const defs = (await this.listDefinitions()).filter((d) => (d.audience || 'school') === 'school');
    const rows = await this.schoolTplRepo.find({ where: { school_id: schoolId } });
    const byKey = new Map(rows.map((r) => [r.template_key, r]));
    return defs.map((d) => this.mergeOne(d, byKey.get(d.template_key) ?? null));
  }

  async getMerged(user: User, schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertAdminSchool(user, schoolId);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    this.assertSchoolAudience(def);
    const row = await this.schoolTplRepo.findOne({
      where: { school_id: schoolId, template_key: templateKey },
    });
    return this.mergeOne(def, row);
  }

  async listMergedForPlatform(
    user: User,
    audience?: NotificationTemplateAudience | 'all',
  ): Promise<MergedNotificationTemplate[]> {
    this.assertPlatformUser(user);
    let defs = await this.listDefinitions();
    if (audience === 'school' || audience === 'system') {
      defs = defs.filter((d) => (d.audience || 'school') === audience);
    }
    return defs.map((d) => this.mergeOne(d, null));
  }

  async getMergedForPlatform(user: User, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertPlatformUser(user);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    return this.mergeOne(def, null);
  }

  async updateDefinition(
    user: User,
    templateKey: string,
    dto: UpdateSchoolNotificationTemplateDto,
  ): Promise<MergedNotificationTemplate> {
    this.assertPlatformUser(user);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);

    let enSubject = dto.en.subject;
    let arSubject = dto.ar.subject;
    if (templateKey === NOTIFICATION_TEMPLATE_KEYS.PAYMENT_RECEIPT) {
      enSubject = def.factory_subject?.trim() || PAYMENT_RECEIPT_SUBJECT_EN;
      arSubject = def.factory_subject_ar?.trim() || PAYMENT_RECEIPT_SUBJECT_AR;
    }

    def.default_subject = enSubject;
    def.default_body_html = dto.en.body_html;
    def.default_body_sms = dto.en.body_sms ?? null;
    def.default_subject_ar = arSubject;
    def.default_body_html_ar = dto.ar.body_html;
    def.default_body_sms_ar = dto.ar.body_sms ?? null;
    await this.defRepo.save(def);
    return this.mergeOne(def, null);
  }

  async resetDefinitionToFactory(user: User, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertPlatformUser(user);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    def.default_subject = def.factory_subject;
    def.default_body_html = def.factory_body_html;
    def.default_body_sms = def.factory_body_sms;
    def.default_subject_ar = def.factory_subject_ar;
    def.default_body_html_ar = def.factory_body_html_ar;
    def.default_body_sms_ar = def.factory_body_sms_ar;
    await this.defRepo.save(def);
    return this.mergeOne(def, null);
  }

  /**
   * Resolves the final subject/bodies for a school (system defaults + school overrides).
   * Use from payment or other modules when sending email/SMS.
   */
  async getChannel(templateKey: string): Promise<string | null> {
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    return def?.channel ?? null;
  }

  async resolveForSend(
    schoolId: number | null,
    templateKey: string,
    locale: 'en' | 'ar' = 'en',
  ): Promise<{ subject: string; body_html: string; body_sms: string }> {
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    const row =
      schoolId != null
        ? await this.schoolTplRepo.findOne({
            where: { school_id: schoolId, template_key: templateKey },
          })
        : null;
    const merged = this.mergeLocale(def, row, locale);
    const subtitle = locale === 'ar' ? 'إشعار من المدرسة' : 'School notification';
    const body_html = await this.renderEmailHtml(
      schoolId,
      row?.layout_id ?? null,
      merged.body_html,
      locale,
      subtitle,
    );
    return {
      ...merged,
      body_html,
    };
  }

  private async renderEmailHtml(
    schoolId: number | null,
    layoutId: string | null,
    bodyHtml: string,
    locale: 'en' | 'ar',
    subtitle: string,
  ): Promise<string> {
    if (schoolId != null) {
      const layoutHtml = await this.resolveLayoutHtml(schoolId, layoutId, locale);
      if (layoutHtml) return applyEmailLayout(layoutHtml, bodyHtml);
    }
    return wrapEmailWithSchoolChrome(bodyHtml, locale, subtitle);
  }

  private async resolveLayoutHtml(
    schoolId: number,
    layoutId: string | null,
    locale: 'en' | 'ar',
  ): Promise<string | null> {
    let layout: SchoolNotificationLayout | null = null;
    if (layoutId) {
      layout = await this.layoutRepo.findOne({
        where: { id: layoutId, school_id: schoolId },
      });
    }
    if (!layout) {
      layout = await this.layoutRepo.findOne({
        where: { school_id: schoolId, is_default: true },
      });
    }
    if (!layout) return null;
    if (locale === 'ar') return layout.html_ar?.trim() || layout.html_en;
    return layout.html_en;
  }

  private withBrandingHints(
    hints: { name: string; description: string }[] | null,
  ): { name: string; description: string }[] {
    const extras = [
      { name: 'schoolName', description: 'School name (from school settings)' },
      { name: 'schoolLogo', description: 'School logo URL (from school settings)' },
    ];
    const seen = new Set<string>();
    const out: { name: string; description: string }[] = [];
    for (const h of [...extras, ...(hints ?? [])]) {
      if (seen.has(h.name)) continue;
      seen.add(h.name);
      out.push(h);
    }
    return out;
  }

  private sameAsDefault(
    def: NotificationTemplateDefinition,
    dto: UpdateSchoolNotificationTemplateDto,
  ): boolean {
    const norm = (v: string | null | undefined) => (v ?? '').trim();
    return (
      norm(dto.en.subject) === norm(def.default_subject) &&
      norm(dto.en.body_html) === norm(def.default_body_html) &&
      norm(dto.en.body_sms) === norm(def.default_body_sms) &&
      norm(dto.ar.subject) === norm(def.default_subject_ar ?? def.default_subject) &&
      norm(dto.ar.body_html) === norm(def.default_body_html_ar ?? def.default_body_html) &&
      norm(dto.ar.body_sms) === norm(def.default_body_sms_ar ?? def.default_body_sms)
    );
  }

  async upsertSchoolTemplate(
    user: User,
    schoolId: number,
    templateKey: string,
    dto: UpdateSchoolNotificationTemplateDto,
  ): Promise<MergedNotificationTemplate> {
    this.assertAdminSchool(user, schoolId);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    this.assertSchoolAudience(def);

    let enSubject = dto.en.subject;
    let arSubject = dto.ar.subject;
    if (templateKey === NOTIFICATION_TEMPLATE_KEYS.PAYMENT_RECEIPT) {
      enSubject = def.default_subject?.trim() || PAYMENT_RECEIPT_SUBJECT_EN;
      arSubject = def.default_subject_ar?.trim() || PAYMENT_RECEIPT_SUBJECT_AR;
    }

    if (
      this.sameAsDefault(def, {
        en: { ...dto.en, subject: enSubject },
        ar: { ...dto.ar, subject: arSubject },
      }) &&
      (dto.layout_id == null || dto.layout_id === '')
    ) {
      await this.schoolTplRepo.delete({ school_id: schoolId, template_key: templateKey });
      return this.mergeOne(def, null);
    }

    let row = await this.schoolTplRepo.findOne({
      where: { school_id: schoolId, template_key: templateKey },
    });
    const layoutId =
      dto.layout_id === undefined
        ? row?.layout_id ?? null
        : dto.layout_id === '' || dto.layout_id == null
          ? null
          : dto.layout_id;
    if (layoutId) {
      const layout = await this.layoutRepo.findOne({
        where: { id: layoutId, school_id: schoolId },
      });
      if (!layout) throw new NotFoundException('Layout not found');
    }
    if (!row) {
      row = this.schoolTplRepo.create({
        school_id: schoolId,
        template_key: templateKey,
        subject_override: enSubject,
        body_html_override: dto.en.body_html,
        body_sms_override: dto.en.body_sms ?? null,
        subject_override_ar: arSubject,
        body_html_override_ar: dto.ar.body_html,
        body_sms_override_ar: dto.ar.body_sms ?? null,
        layout_id: layoutId,
      });
    } else {
      row.subject_override = enSubject;
      row.body_html_override = dto.en.body_html;
      row.body_sms_override = dto.en.body_sms ?? null;
      row.subject_override_ar = arSubject;
      row.body_html_override_ar = dto.ar.body_html;
      row.body_sms_override_ar = dto.ar.body_sms ?? null;
      if (dto.layout_id !== undefined) row.layout_id = layoutId;
    }
    await this.schoolTplRepo.save(row);
    return this.mergeOne(def, row);
  }

  async resetSchoolTemplate(user: User, schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertAdminSchool(user, schoolId);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    this.assertSchoolAudience(def);
    await this.schoolTplRepo.delete({ school_id: schoolId, template_key: templateKey });
    return this.mergeOne(def, null);
  }

  async preview(
    dto: PreviewNotificationTemplateDto,
    user: User,
  ): Promise<{
    subject: string;
    body_html: string;
    body_sms: string;
  }> {
    const vars = { ...dto.sample_variables };
    const locale = dto.locale === 'en' ? 'en' : 'ar';
    if (dto.school_id != null) {
      this.assertAdminSchool(user, dto.school_id);
      const branding = await this.getSchoolBranding(dto.school_id);
      Object.assign(vars, this.applySchoolBranding(vars, branding));
    } else if (this.isPlatformUser(user)) {
      const branding = await this.getSchoolBranding(null);
      Object.assign(vars, this.applySchoolBranding(vars, branding));
    }
    const subtitle = locale === 'ar' ? 'إشعار من المدرسة' : 'School notification';
    const html = await this.renderEmailHtml(
      dto.school_id ?? null,
      dto.layout_id ?? null,
      dto.body_html,
      locale,
      subtitle,
    );
    return {
      subject: applyNotificationTemplateVariables(dto.subject, vars),
      body_html: applyNotificationTemplateVariablesHtml(html, vars),
      body_sms: applyNotificationTemplateVariables(dto.body_sms ?? '', vars),
    };
  }

  /** Sample values for preview UI — school name/logo always from school settings. */
  async getDefaultSampleVariables(schoolId: number | null): Promise<Record<string, string>> {
    const branding = await this.getSchoolBranding(schoolId);
    return {
      ...brandingVariables(branding),
      studentName: 'Ahmad Ali',
      recipientName: 'Parent Name',
      amount: '120.00',
      currency: 'OMR',
      date: new Date().toISOString().slice(0, 10),
      remarks: 'Term 1 — partial payment',
      reference: 'TR-2026-001',
      notes: 'Missing documents',
      tempPassword: 'abcd1234',
      title: 'Sample title',
      courseName: 'Mathematics',
      senderName: 'Teacher Name',
      preview: 'Hello, this is a short preview.',
      status: 'completed',
      location: ' — Hall 2',
      email: 'owner@example.com',
    };
  }
}
