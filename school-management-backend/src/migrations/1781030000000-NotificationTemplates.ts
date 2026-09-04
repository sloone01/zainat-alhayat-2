import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationTemplates1781030000000 implements MigrationInterface {
  name = 'NotificationTemplates1781030000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_template_definitions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "template_key" character varying(120) NOT NULL,
        "display_name" character varying(200) NOT NULL,
        "description" text,
        "channel" character varying(20) NOT NULL,
        "default_subject" text,
        "default_body_html" text,
        "default_body_sms" text,
        "variable_hints" jsonb,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_template_definitions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_template_definitions_key" UNIQUE ("template_key")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_notification_templates" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "template_key" character varying(120) NOT NULL,
        "subject_override" text,
        "body_html_override" text,
        "body_sms_override" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_notification_templates" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_school_notification_templates_school_key" UNIQUE ("school_id", "template_key"),
        CONSTRAINT "FK_school_notification_templates_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      INSERT INTO "notification_template_definitions" (
        "id",
        "template_key",
        "display_name",
        "description",
        "channel",
        "default_subject",
        "default_body_html",
        "default_body_sms",
        "variable_hints"
      )
      SELECT
        uuid_generate_v4(),
        'payment.receipt',
        'Payment receipt',
        'Used when a payment is recorded (email + SMS). Each school can change wording, footer, and layout in HTML.',
        'both',
        'Payment received — {{schoolName}}',
        $html$<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Payment receipt</title>
</head>
<body style="margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);">
    <tr>
      <td style="padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;">
        <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
        <div style="font-size:13px;opacity:.95;margin-top:4px;">Payment notification</div>
      </td>
    </tr>
    <tr>
      <td style="padding:24px 28px;">
        <p style="margin:0 0 12px;">Dear {{recipientName}},</p>
        <p style="margin:0 0 16px;line-height:1.55;">We have recorded a payment for <strong>{{studentName}}</strong>.</p>
        <table role="presentation" cellspacing="0" cellpadding="0" style="width:100%;border:1px solid #e5e7eb;border-radius:8px;">
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Amount</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-weight:600;text-align:right;">{{amount}} {{currency}}</td></tr>
          <tr><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;color:#6b7280;font-size:13px;">Date</td><td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">{{date}}</td></tr>
          <tr><td style="padding:10px 12px;color:#6b7280;font-size:13px;vertical-align:top;">Remarks</td><td style="padding:10px 12px;text-align:right;">{{remarks}}</td></tr>
        </table>
        <p style="margin:20px 0 0;font-size:13px;color:#6b7280;line-height:1.5;">{{footerText}}</p>
      </td>
    </tr>
  </table>
</body>
</html>$html$,
        'Payment {{amount}} {{currency}} for {{studentName}} at {{schoolName}} on {{date}}. {{remarks}}',
        $json$[
          {"name":"schoolName","description":"School display name"},
          {"name":"studentName","description":"Student full name"},
          {"name":"recipientName","description":"Parent or payer name"},
          {"name":"amount","description":"Amount (formatted)"},
          {"name":"currency","description":"Currency code, e.g. OMR"},
          {"name":"date","description":"Payment date"},
          {"name":"remarks","description":"Note or reference"},
          {"name":"footerText","description":"Footer line (address, thank-you, etc.)"}
        ]$json$::jsonb
      WHERE NOT EXISTS (
        SELECT 1 FROM "notification_template_definitions" d WHERE d."template_key" = 'payment.receipt'
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_notification_templates"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_template_definitions"`);
  }
}
