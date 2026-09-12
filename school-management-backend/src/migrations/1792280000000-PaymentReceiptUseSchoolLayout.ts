import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * payment.receipt was a full HTML card (purple header) that bypassed school email
 * layouts — so sends skipped the school header / logo. Store content fragments only;
 * the school default layout wraps {{content}}.
 */
const EN_BODY = `<p style="margin:0 0 12px;">Dear {{recipientName}},</p>
<p style="margin:0 0 16px;line-height:1.55;">We have recorded a payment for <strong>{{studentName}}</strong>.</p>
<p style="margin:0 0 8px;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
<p style="margin:0 0 8px;"><strong>Date:</strong> {{date}}</p>
<p style="margin:0 0 8px;"><strong>Remarks:</strong> {{remarks}}</p>`;

const AR_BODY = `<p style="margin:0 0 12px;">عزيزي/عزيزتي {{recipientName}}،</p>
<p style="margin:0 0 16px;line-height:1.55;">تم تسجيل دفعة باسم <strong>{{studentName}}</strong>.</p>
<p style="margin:0 0 8px;"><strong>المبلغ:</strong> {{amount}} {{currency}}</p>
<p style="margin:0 0 8px;"><strong>التاريخ:</strong> {{date}}</p>
<p style="margin:0 0 8px;"><strong>ملاحظات:</strong> {{remarks}}</p>`;

export class PaymentReceiptUseSchoolLayout1792280000000 implements MigrationInterface {
  name = 'PaymentReceiptUseSchoolLayout1792280000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const esc = (s: string) => s.replace(/'/g, "''");
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_body_html" = '${esc(EN_BODY)}',
        "default_body_html_ar" = '${esc(AR_BODY)}',
        "factory_body_html" = '${esc(EN_BODY)}',
        "factory_body_html_ar" = '${esc(AR_BODY)}'
      WHERE "template_key" = 'payment.receipt'
    `);

    // School overrides that still ship a full HTML card → keep only the message body.
    await queryRunner.query(`
      UPDATE "school_notification_templates"
      SET
        "body_html_override" = CASE
          WHEN "body_html_override" IS NULL OR BTRIM("body_html_override") = '' THEN "body_html_override"
          WHEN "body_html_override" ~* 'nt-email-body' THEN
            substring("body_html_override" from '(?is)<div[^>]*nt-email-body[^>]*>(.*)</div>')
          WHEN "body_html_override" ~* '<body' THEN
            substring("body_html_override" from '(?is)<body[^>]*>(.*)</body>')
          ELSE "body_html_override"
        END,
        "body_html_override_ar" = CASE
          WHEN "body_html_override_ar" IS NULL OR BTRIM("body_html_override_ar") = '' THEN "body_html_override_ar"
          WHEN "body_html_override_ar" ~* 'nt-email-body' THEN
            substring("body_html_override_ar" from '(?is)<div[^>]*nt-email-body[^>]*>(.*)</div>')
          WHEN "body_html_override_ar" ~* '<body' THEN
            substring("body_html_override_ar" from '(?is)<body[^>]*>(.*)</body>')
          ELSE "body_html_override_ar"
        END
      WHERE "template_key" = 'payment.receipt'
        AND (
          COALESCE("body_html_override", '') ~* '(<!DOCTYPE|<html|nt-email-card)'
          OR COALESCE("body_html_override_ar", '') ~* '(<!DOCTYPE|<html|nt-email-card)'
        )
    `);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Previous full-document defaults live in earlier migrations; no destructive rollback.
  }
}
