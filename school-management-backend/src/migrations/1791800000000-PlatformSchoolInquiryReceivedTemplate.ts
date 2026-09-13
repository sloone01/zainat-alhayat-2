import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedCallout,
  brandedParagraph,
} from '../notifications/school-notification-branding';

/**
 * Confirmation email to the visitor who submitted the landing consult form.
 */
export class PlatformSchoolInquiryReceivedTemplate1791800000000 implements MigrationInterface {
  name = 'PlatformSchoolInquiryReceivedTemplate1791800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const htmlEn =
      brandedParagraph('Thank you for contacting FIKR about <strong>{{schoolName}}</strong>.') +
      brandedCallout(
        `We received your request.<br/>Email: {{email}}<br/>Mobile: {{phone}}`,
      ) +
      brandedParagraph('Our team will communicate with you shortly.');
    const htmlAr =
      brandedParagraph('شكراً لتواصلك مع فكر بشأن <strong>{{schoolName}}</strong>.') +
      brandedCallout(`استلمنا طلبك.<br/>البريد: {{email}}<br/>الجوال: {{phone}}`) +
      brandedParagraph('سيتواصل فريقنا معك قريباً.');

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
        'platform.school_inquiry_received',
        'Landing page inquiry confirmation',
        'Sent to the visitor after they submit the consult form on the marketing hub.',
        'both',
        'system',
        'We received your FIKR request — {{schoolName}}',
        $1,
        'FIKR received your request for {{schoolName}}. Our team will contact you shortly.',
        'استلمنا طلبك على فكر — {{schoolName}}',
        $2,
        'استلمنا طلبك لمدرسة {{schoolName}}. سيتواصل فريقنا معك قريباً.',
        'We received your FIKR request — {{schoolName}}',
        $1,
        'FIKR received your request for {{schoolName}}. Our team will contact you shortly.',
        'استلمنا طلبك على فكر — {{schoolName}}',
        $2,
        'استلمنا طلبك لمدرسة {{schoolName}}. سيتواصل فريقنا معك قريباً.',
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
          { name: 'recipientName', description: 'Visitor / school name' },
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'platform.school_inquiry_received'`,
    );
  }
}
