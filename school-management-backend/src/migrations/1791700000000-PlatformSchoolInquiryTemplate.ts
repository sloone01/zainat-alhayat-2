import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedCallout,
  brandedParagraph,
} from '../notifications/school-notification-branding';

/**
 * Landing-page consult form emails platform operators (isSuperAdmin / isSystemUser).
 */
export class PlatformSchoolInquiryTemplate1791700000000 implements MigrationInterface {
  name = 'PlatformSchoolInquiryTemplate1791700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const htmlEn =
      brandedParagraph('A school asked to continue with a FIKR subscription from the marketing site:') +
      brandedCallout(
        `<strong>{{schoolName}}</strong><br/>Email: {{email}}<br/>Mobile: {{phone}}<br/>Size: {{schoolSize}}`,
      ) +
      brandedParagraph('Please contact them to continue the conversation.');
    const htmlAr =
      brandedParagraph('طلبت مدرسة المتابعة للاشتراك في منصة فكر من صفحة التعريف:') +
      brandedCallout(
        `<strong>{{schoolName}}</strong><br/>البريد: {{email}}<br/>الجوال: {{phone}}<br/>الحجم: {{schoolSize}}`,
      ) +
      brandedParagraph('يرجى التواصل معهم لمتابعة الطلب.');

    await queryRunner.query(
      `
      INSERT INTO "notification_template_definitions" (
        "id", "template_key", "display_name", "description", "channel", "audience",
        "default_subject", "default_body_html", "default_body_sms",
        "default_subject_ar", "default_body_html_ar", "default_body_sms_ar",
        "factory_subject", "factory_body_html", "factory_body_sms",
        "factory_subject_ar", "factory_body_html_ar", "factory_body_sms_ar",
        "variable_hints"
      )
      VALUES (
        uuid_generate_v4(),
        'platform.school_inquiry',
        'Landing page subscription inquiry',
        'Sent to platform operators when a visitor submits the consult form on the marketing hub.',
        'both',
        'system',
        'New subscription inquiry: {{schoolName}}',
        $1,
        'FIKR inquiry: {{schoolName}} — {{phone}} ({{email}}). Size: {{schoolSize}}.',
        'طلب اشتراك جديد: {{schoolName}}',
        $2,
        'طلب فكر: {{schoolName}} — {{phone}} ({{email}}). الحجم: {{schoolSize}}.',
        'New subscription inquiry: {{schoolName}}',
        $1,
        'FIKR inquiry: {{schoolName}} — {{phone}} ({{email}}). Size: {{schoolSize}}.',
        'طلب اشتراك جديد: {{schoolName}}',
        $2,
        'طلب فكر: {{schoolName}} — {{phone}} ({{email}}). الحجم: {{schoolSize}}.',
        $3::jsonb
      )
      ON CONFLICT ("template_key") DO UPDATE SET
        "display_name" = EXCLUDED."display_name",
        "description" = EXCLUDED."description",
        "channel" = EXCLUDED."channel",
        "audience" = EXCLUDED."audience",
        "default_subject" = EXCLUDED."default_subject",
        "default_body_html" = EXCLUDED."default_body_html",
        "default_body_sms" = EXCLUDED."default_body_sms",
        "default_subject_ar" = EXCLUDED."default_subject_ar",
        "default_body_html_ar" = EXCLUDED."default_body_html_ar",
        "default_body_sms_ar" = EXCLUDED."default_body_sms_ar",
        "factory_subject" = EXCLUDED."factory_subject",
        "factory_body_html" = EXCLUDED."factory_body_html",
        "factory_body_sms" = EXCLUDED."factory_body_sms",
        "factory_subject_ar" = EXCLUDED."factory_subject_ar",
        "factory_body_html_ar" = EXCLUDED."factory_body_html_ar",
        "factory_body_sms_ar" = EXCLUDED."factory_body_sms_ar",
        "variable_hints" = EXCLUDED."variable_hints"
      `,
      [
        htmlEn,
        htmlAr,
        JSON.stringify([
          { name: 'schoolName', description: 'School / institution name' },
          { name: 'email', description: 'Contact email' },
          { name: 'phone', description: 'Mobile number' },
          { name: 'schoolSize', description: 'Selected school size band' },
          { name: 'recipientName', description: 'Operator display name' },
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'platform.school_inquiry'`,
    );
  }
}
