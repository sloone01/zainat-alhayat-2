import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityWithdrawnTemplate1792630000000 implements MigrationInterface {
  name = 'ActivityWithdrawnTemplate1792630000000';

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
        uuid_generate_v4(), $1, $2, $3, $4,
        $5, $6, $7, $8, $9, $10, $11::jsonb
      )
      ON CONFLICT ("template_key") DO NOTHING
      `,
      [
        'activity.withdrawn',
        'Activity withdrawn',
        'Sent to parents and students when an activity is withdrawn.',
        'both',
        'Activity withdrawn: {{title}} — {{schoolName}}',
        '<p>Dear {{recipientName}},</p><p>The activity <strong>{{title}}</strong> on {{date}}{{location}} has been withdrawn.</p>',
        '{{schoolName}}: activity "{{title}}" on {{date}} has been withdrawn.',
        'إلغاء نشاط: {{title}} — {{schoolName}}',
        '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم إلغاء النشاط <strong>{{title}}</strong> بتاريخ {{date}}{{location}}.</p>',
        '{{schoolName}}: تم إلغاء النشاط "{{title}}" بتاريخ {{date}}.',
        JSON.stringify([
          { name: 'title', description: 'Activity title' },
          { name: 'date', description: 'Activity date' },
          { name: 'location', description: 'Location' },
          { name: 'recipientName', description: 'Parent or student name' },
        ]),
      ],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'activity.withdrawn'`,
    );
  }
}
