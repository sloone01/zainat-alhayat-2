import { MigrationInterface, QueryRunner } from 'typeorm';

export class LetterApprovalReminderActionLinks1792210000000 implements MigrationInterface {
  name = 'LetterApprovalReminderActionLinks1792210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_subject" = 'Reminder: please answer {{title}} — {{schoolName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>Please review and answer the letter <strong>{{title}}</strong>.</p><p><a href="{{approveUrl}}">Approve</a> · <a href="{{rejectUrl}}">Reject</a></p>$html$,
        "default_body_sms" = '{{schoolName}}: please answer "{{title}}". {{actionUrl}}',
        "default_subject_ar" = 'تذكير: يرجى الرد على {{title}} — {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يرجى مراجعة الرسالة <strong>{{title}}</strong> والرد عليها.</p><p><a href="{{approveUrl}}">موافقة</a> · <a href="{{rejectUrl}}">رفض</a></p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: يرجى الرد على "{{title}}". {{actionUrl}}',
        "factory_subject" = 'Reminder: please answer {{title}} — {{schoolName}}',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>Please review and answer the letter <strong>{{title}}</strong>.</p><p><a href="{{approveUrl}}">Approve</a> · <a href="{{rejectUrl}}">Reject</a></p>$html$,
        "factory_body_sms" = '{{schoolName}}: please answer "{{title}}". {{actionUrl}}',
        "factory_subject_ar" = 'تذكير: يرجى الرد على {{title}} — {{schoolName}}',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يرجى مراجعة الرسالة <strong>{{title}}</strong> والرد عليها.</p><p><a href="{{approveUrl}}">موافقة</a> · <a href="{{rejectUrl}}">رفض</a></p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: يرجى الرد على "{{title}}". {{actionUrl}}',
        "variable_hints" = $json$[{"name":"title","description":"Letter title"},{"name":"recipientName","description":"Guardian name"},{"name":"actionUrl","description":"Signed page to review the letter"},{"name":"approveUrl","description":"Signed approve link"},{"name":"rejectUrl","description":"Signed reject link"}]$json$::jsonb,
        "channel" = 'both'
      WHERE "template_key" = 'letter.approval_reminder'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>Please review and answer the letter <strong>{{title}}</strong>.</p>$html$,
        "default_body_sms" = '{{schoolName}}: please answer "{{title}}".',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يرجى مراجعة الرسالة <strong>{{title}}</strong> والرد عليها.</p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: يرجى الرد على "{{title}}".',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>Please review and answer the letter <strong>{{title}}</strong>.</p>$html$,
        "factory_body_sms" = '{{schoolName}}: please answer "{{title}}".',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يرجى مراجعة الرسالة <strong>{{title}}</strong> والرد عليها.</p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: يرجى الرد على "{{title}}".',
        "variable_hints" = $json$[{"name":"title","description":"Letter title"},{"name":"recipientName","description":"Guardian name"}]$json$::jsonb
      WHERE "template_key" = 'letter.approval_reminder'
    `);
  }
}
