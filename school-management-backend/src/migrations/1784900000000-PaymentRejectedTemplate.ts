import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentRejectedTemplate1784900000000 implements MigrationInterface {
  name = 'PaymentRejectedTemplate1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "notification_template_definitions" (
        "id", "template_key", "display_name", "description", "channel",
        "default_subject", "default_body_html", "default_body_sms",
        "default_subject_ar", "default_body_html_ar", "default_body_sms_ar",
        "variable_hints"
      )
      VALUES
      (
        uuid_generate_v4(),
        'payment.rejected',
        'Payment receipt rejected',
        'Sent to guardians when an uploaded payment receipt is rejected.',
        'both',
        'Receipt not accepted — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>The payment receipt for <strong>{{studentName}}</strong> was not accepted.</p><p>Amount: {{amount}} {{currency}}</p><p>{{notes}}</p>$html$,
        '{{schoolName}}: receipt for {{studentName}} ({{amount}} {{currency}}) was not accepted.',
        'لم يُقبل الإيصال — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>لم يُقبل إيصال الدفع لطالب <strong>{{studentName}}</strong>.</p><p>المبلغ: {{amount}} {{currency}}</p><p>{{notes}}</p>$html$,
        '{{schoolName}}: لم يُقبل إيصال {{studentName}} ({{amount}} {{currency}}).',
        '[{"name":"schoolName","description":"School name"},{"name":"studentName","description":"Student name"},{"name":"recipientName","description":"Guardian name"},{"name":"amount","description":"Amount"},{"name":"currency","description":"Currency"},{"name":"notes","description":"Rejection notes"}]'::jsonb
      )
      ON CONFLICT ("template_key") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "notification_template_definitions"
      WHERE "template_key" = 'payment.rejected'
    `);
  }
}
