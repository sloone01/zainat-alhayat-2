import { MigrationInterface, QueryRunner } from 'typeorm';

const EN_HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment receipt</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">
  <div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">
      {{schoolLogoHtml}}
      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
      <div style="font-size:13px;opacity:.95;margin-top:4px;">Payment notification</div>
    </div>
    <div class="nt-email-body" style="padding:24px 28px;">
      <p style="margin:0 0 12px;">Dear {{recipientName}},</p>
      <p style="margin:0 0 16px;line-height:1.55;">We have recorded a payment for <strong>{{studentName}}</strong>.</p>
      <p style="margin:0 0 8px;"><strong>Amount:</strong> {{amount}} {{currency}}</p>
      <p style="margin:0 0 8px;"><strong>Date:</strong> {{date}}</p>
      <p style="margin:0 0 16px;"><strong>Remarks:</strong> {{remarks}}</p>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>
    </div>
  </div>
</body>
</html>`;

const AR_HTML = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>إيصال الدفع</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;">
  <div class="nt-email-card" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
    <div style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">
      {{schoolLogoHtml}}
      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
      <div style="font-size:13px;opacity:.95;margin-top:4px;">إشعار بالدفع</div>
    </div>
    <div class="nt-email-body" style="padding:24px 28px;">
      <p style="margin:0 0 12px;">عزيزي/عزيزتي {{recipientName}}،</p>
      <p style="margin:0 0 16px;line-height:1.55;">تم تسجيل دفعة باسم <strong>{{studentName}}</strong>.</p>
      <p style="margin:0 0 8px;"><strong>المبلغ:</strong> {{amount}} {{currency}}</p>
      <p style="margin:0 0 8px;"><strong>التاريخ:</strong> {{date}}</p>
      <p style="margin:0 0 16px;"><strong>ملاحظات:</strong> {{remarks}}</p>
      <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>
    </div>
  </div>
</body>
</html>`;

export class RestorePaymentReceiptTemplate1785100000000 implements MigrationInterface {
  name = 'RestorePaymentReceiptTemplate1785100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
      INSERT INTO "notification_template_definitions" (
        "id", "template_key", "display_name", "description", "channel",
        "default_subject", "default_body_html", "default_body_sms",
        "default_subject_ar", "default_body_html_ar", "default_body_sms_ar",
        "variable_hints"
      )
      VALUES (
        uuid_generate_v4(),
        'payment.receipt',
        'Payment receipt',
        'Used when a payment is recorded (email + SMS).',
        'both',
        'Payment received — {{schoolName}}',
        $1,
        'Payment {{amount}} {{currency}} for {{studentName}} at {{schoolName}} on {{date}}. {{remarks}}',
        'تم استلام الدفعة — {{schoolName}}',
        $2,
        'دفعة {{amount}} {{currency}} للطالب {{studentName}} في {{schoolName}} بتاريخ {{date}}. {{remarks}}',
        $3::jsonb
      )
      ON CONFLICT ("template_key") DO UPDATE SET
        "default_body_html" = EXCLUDED."default_body_html",
        "default_body_html_ar" = EXCLUDED."default_body_html_ar"
      `,
      [
        EN_HTML,
        AR_HTML,
        JSON.stringify([
          { name: 'schoolName', description: 'School display name' },
          { name: 'studentName', description: 'Student full name' },
          { name: 'recipientName', description: 'Parent or payer name' },
          { name: 'amount', description: 'Amount (formatted)' },
          { name: 'currency', description: 'Currency code, e.g. OMR' },
          { name: 'date', description: 'Payment date' },
          { name: 'remarks', description: 'Note or reference' },
          { name: 'footerText', description: 'Footer line (address, thank-you, etc.)' },
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "notification_template_definitions" WHERE "template_key" = 'payment.receipt'
    `);
  }
}
