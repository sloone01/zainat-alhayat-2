import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { NotificationTemplateDefinition } from '../entities/notification-template-definition.entity';
import { SchoolNotificationTemplate } from '../entities/school-notification-template.entity';
import type {
  PreviewNotificationTemplateDto,
  UpdateSchoolNotificationTemplateDto,
} from '../dto/notification-template.dto';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';

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
  en: NotificationTemplateLocaleBlock;
  ar: NotificationTemplateLocaleBlock;
  variable_hints: { name: string; description: string }[] | null;
  uses_school_overrides: boolean;
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
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
  ) {}

  private assertAdminSchool(user: User, schoolId: number): void {
    if (user.role !== 'admin') {
      throw new ForbiddenException('Only administrators can manage notification templates');
    }
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
      throw new ForbiddenException('You can only manage templates for your school');
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

  private mergeOne(
    def: NotificationTemplateDefinition,
    row: SchoolNotificationTemplate | null,
  ): MergedNotificationTemplate {
    const uses_school_overrides = !!row;
    return {
      template_key: def.template_key,
      display_name: def.display_name,
      description: def.description,
      channel: def.channel,
      en: this.mergeLocale(def, row, 'en'),
      ar: this.mergeLocale(def, row, 'ar'),
      variable_hints: def.variable_hints,
      uses_school_overrides,
    };
  }

  async listMergedForSchool(user: User, schoolId: number): Promise<MergedNotificationTemplate[]> {
    this.assertAdminSchool(user, schoolId);
    const defs = await this.listDefinitions();
    const rows = await this.schoolTplRepo.find({ where: { school_id: schoolId } });
    const byKey = new Map(rows.map((r) => [r.template_key, r]));
    return defs.map((d) => this.mergeOne(d, byKey.get(d.template_key) ?? null));
  }

  async getMerged(user: User, schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertAdminSchool(user, schoolId);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    const row = await this.schoolTplRepo.findOne({
      where: { school_id: schoolId, template_key: templateKey },
    });
    return this.mergeOne(def, row);
  }

  /**
   * Resolves the final subject/bodies for a school (system defaults + school overrides).
   * Use from payment or other modules when sending email/SMS.
   */
  async resolveForSend(
    schoolId: number,
    templateKey: string,
    locale: 'en' | 'ar' = 'en',
  ): Promise<{ subject: string; body_html: string; body_sms: string }> {
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
    const row = await this.schoolTplRepo.findOne({
      where: { school_id: schoolId, template_key: templateKey },
    });
    return this.mergeLocale(def, row, locale);
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

    let enSubject = dto.en.subject;
    let arSubject = dto.ar.subject;
    if (templateKey === NOTIFICATION_TEMPLATE_KEYS.PAYMENT_RECEIPT) {
      enSubject = def.default_subject?.trim() || PAYMENT_RECEIPT_SUBJECT_EN;
      arSubject = def.default_subject_ar?.trim() || PAYMENT_RECEIPT_SUBJECT_AR;
    }

    let row = await this.schoolTplRepo.findOne({
      where: { school_id: schoolId, template_key: templateKey },
    });
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
      });
    } else {
      row.subject_override = enSubject;
      row.body_html_override = dto.en.body_html;
      row.body_sms_override = dto.en.body_sms ?? null;
      row.subject_override_ar = arSubject;
      row.body_html_override_ar = dto.ar.body_html;
      row.body_sms_override_ar = dto.ar.body_sms ?? null;
    }
    await this.schoolTplRepo.save(row);
    return this.mergeOne(def, row);
  }

  async resetSchoolTemplate(user: User, schoolId: number, templateKey: string): Promise<MergedNotificationTemplate> {
    this.assertAdminSchool(user, schoolId);
    const def = await this.defRepo.findOne({ where: { template_key: templateKey } });
    if (!def) throw new NotFoundException(`Unknown template: ${templateKey}`);
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
    if (dto.school_id != null) {
      this.assertAdminSchool(user, dto.school_id);
      const school = await this.schoolRepo.findOne({ where: { id: dto.school_id } });
      if (school != null) {
        const n = school.name?.trim();
        vars.schoolName = n && n.length > 0 ? n : 'Your School';
      }
    }
    return {
      subject: applyNotificationTemplateVariables(dto.subject, vars),
      body_html: applyNotificationTemplateVariables(dto.body_html, vars),
      body_sms: applyNotificationTemplateVariables(dto.body_sms ?? '', vars),
    };
  }

  /** Sample values for preview UI (payment receipt). */
  async getDefaultSampleVariables(schoolId: number): Promise<Record<string, string>> {
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    return {
      schoolName: school?.name ?? 'Your School',
      studentName: 'Ahmad Ali',
      recipientName: 'Parent Name',
      amount: '120.00',
      currency: 'OMR',
      date: new Date().toISOString().slice(0, 10),
      remarks: 'Term 1 — partial payment',
      footerText:
        school?.address?.trim() ||
        'Thank you for your trust. For questions, reply to this email or contact the school office.',
    };
  }
}
