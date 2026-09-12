import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedCallout,
  brandedParagraph,
  FIKR_BRAND,
} from '../notifications/school-notification-branding';

/**
 * Approval notice for an owner who already has a staff login (linked membership).
 * No temporary password — they keep their current credentials.
 */
export class SchoolApprovedExistingOwnerTemplate1792271000000 implements MigrationInterface {
  name = 'SchoolApprovedExistingOwnerTemplate1792271000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const htmlEn =
      brandedParagraph('Dear {{recipientName}},') +
      brandedParagraph(
        `<strong>{{schoolName}}</strong> is registered and active on FIKR.`,
      ) +
      brandedCallout(`Sign in with <strong>{{email}}</strong>`) +
      brandedParagraph(
        `Plan: <strong>{{planName}}</strong><br/>Amount: <strong>{{amount}} {{currency}}</strong>`,
      ) +
      brandedParagraph('{{paidNote}}') +
      brandedParagraph(
        `<a href="{{loginUrl}}" style="color:${FIKR_BRAND.teal};font-weight:700;">{{loginUrl}}</a>`,
      );

    const htmlAr =
      brandedParagraph('عزيزي/عزيزتي {{recipientName}}،') +
      brandedParagraph(
        `تم تسجيل <strong>{{schoolName}}</strong> وتفعيلها على منصة فكر.`,
      ) +
      brandedCallout(`سجّل الدخول بـ <strong>{{email}}</strong>`) +
      brandedParagraph(
        `الخطة: <strong>{{planName}}</strong><br/>المبلغ: <strong>{{amount}} {{currency}}</strong>`,
      ) +
      brandedParagraph('{{paidNote}}') +
      brandedParagraph(
        `<a href="{{loginUrl}}" style="color:${FIKR_BRAND.teal};font-weight:700;">{{loginUrl}}</a>`,
      );

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
        'platform.school_approved_existing',
        'School approved (existing login)',
        'Sent to an existing staff owner when the platform approves another school for their login. No temporary password.',
        'both',
        'system',
        '{{schoolName}} is approved',
        $1,
        '{{schoolName}} approved. Sign in with {{email}}.',
        'تمت الموافقة على {{schoolName}}',
        $2,
        'تمت الموافقة على {{schoolName}}. سجّل الدخول بـ {{email}}.',
        '{{schoolName}} is approved',
        $1,
        '{{schoolName}} approved. Sign in with {{email}}.',
        'تمت الموافقة على {{schoolName}}',
        $2,
        'تمت الموافقة على {{schoolName}}. سجّل الدخول بـ {{email}}.',
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
          { name: 'recipientName', description: 'Owner name' },
          { name: 'schoolName', description: 'School name' },
          { name: 'email', description: 'Login email' },
          { name: 'planName', description: 'Plan name' },
          { name: 'amount', description: 'Amount' },
          { name: 'invoiceTotal', description: 'Invoice total' },
          { name: 'currency', description: 'Currency' },
          { name: 'loginUrl', description: 'Sign-in URL' },
          { name: 'paidNote', description: 'Optional payment note' },
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'platform.school_approved_existing'`,
    );
  }
}
