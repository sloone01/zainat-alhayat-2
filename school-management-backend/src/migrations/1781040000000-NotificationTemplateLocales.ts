import { MigrationInterface, QueryRunner } from 'typeorm';

/** Arabic defaults for payment.receipt (full HTML documents / SMS). */
const AR_SUBJECT = 'تم استلام الدفعة — {{schoolName}}';
const AR_SMS =
  'دفعة {{amount}} {{currency}} للطالب {{studentName}} في {{schoolName}} بتاريخ {{date}}. {{remarks}}';

const AR_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>إيصال الدفع</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
    <tr>
      <td style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">
        <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
        <div style="font-size:13px;opacity:.95;margin-top:4px;">إشعار بالدفع</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;">
        <p style="margin:0 0 12px;">عزيزي/عزيزتي {{recipientName}}،</p>
        <p style="margin:0 0 16px;line-height:1.55;">تم تسجيل دفعة باسم <strong>{{studentName}}</strong>.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;">
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">المبلغ</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;text-align:left;">{{amount}} {{currency}}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">التاريخ</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:left;">{{date}}</td></tr>
          <tr><td style="padding:10px 12px;color:#6b7280;font-size:13px;vertical-align:top;">ملاحظات</td><td style="padding:10px 12px;text-align:left;">{{remarks}}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>
      </td>
    </tr>
  </table>
</body>
</html>`;

export class NotificationTemplateLocales1781040000000 implements MigrationInterface {
  name = 'NotificationTemplateLocales1781040000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" ADD COLUMN IF NOT EXISTS "default_subject_ar" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" ADD COLUMN IF NOT EXISTS "default_body_html_ar" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" ADD COLUMN IF NOT EXISTS "default_body_sms_ar" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" ADD COLUMN IF NOT EXISTS "subject_override_ar" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" ADD COLUMN IF NOT EXISTS "body_html_override_ar" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" ADD COLUMN IF NOT EXISTS "body_sms_override_ar" text`,
    );

    const esc = (s: string) => s.replace(/'/g, "''");
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_subject_ar" = '${esc(AR_SUBJECT)}',
        "default_body_html_ar" = '${esc(AR_HTML)}',
        "default_body_sms_ar" = '${esc(AR_SMS)}'
      WHERE "template_key" = 'payment.receipt'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" DROP COLUMN IF EXISTS "body_sms_override_ar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" DROP COLUMN IF EXISTS "body_html_override_ar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "school_notification_templates" DROP COLUMN IF EXISTS "subject_override_ar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" DROP COLUMN IF EXISTS "default_body_sms_ar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" DROP COLUMN IF EXISTS "default_body_html_ar"`,
    );
    await queryRunner.query(
      `ALTER TABLE "notification_template_definitions" DROP COLUMN IF EXISTS "default_subject_ar"`,
    );
  }
}
