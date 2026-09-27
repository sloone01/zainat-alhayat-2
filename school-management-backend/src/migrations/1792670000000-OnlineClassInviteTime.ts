import { MigrationInterface, QueryRunner } from 'typeorm';

/** Invite copy names the timetable date and time, and says the class is online then. */
export class OnlineClassInviteTime1792670000000 implements MigrationInterface {
  name = 'OnlineClassInviteTime1792670000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "description" = 'Sent to class parents and students when the teacher shares the join link. The class is online at the usual session date and time. Email and push now; SMS body is ready for WhatsApp later.',
        "default_subject" = 'Online class — {{courseName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p><strong>{{courseName}}</strong> ({{groupName}}) will be held online at the usual session time, on {{dateEn}} from {{startTime}} to {{endTime}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        "default_body_sms" = '{{schoolName}}: {{courseName}} will be online at the usual time, {{dateEn}} {{startTime}}–{{endTime}}. {{joinUrl}}',
        "default_subject_ar" = 'حصة عن بُعد — {{courseName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>ستُقام حصة <strong>{{courseName}}</strong> ({{groupName}}) عن بُعد في نفس موعد الحصة، يوم {{dateAr}} من {{startTime}} إلى {{endTime}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: حصة {{courseName}} ستكون عن بُعد في نفس الموعد، {{dateAr}} من {{startTime}} إلى {{endTime}}. {{joinUrl}}',
        "factory_subject" = 'Online class — {{courseName}}',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p><strong>{{courseName}}</strong> ({{groupName}}) will be held online at the usual session time, on {{dateEn}} from {{startTime}} to {{endTime}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        "factory_body_sms" = '{{schoolName}}: {{courseName}} will be online at the usual time, {{dateEn}} {{startTime}}–{{endTime}}. {{joinUrl}}',
        "factory_subject_ar" = 'حصة عن بُعد — {{courseName}}',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>ستُقام حصة <strong>{{courseName}}</strong> ({{groupName}}) عن بُعد في نفس موعد الحصة، يوم {{dateAr}} من {{startTime}} إلى {{endTime}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: حصة {{courseName}} ستكون عن بُعد في نفس الموعد، {{dateAr}} من {{startTime}} إلى {{endTime}}. {{joinUrl}}',
        "variable_hints" = $json$[{"name":"courseName","description":"Course name"},{"name":"groupName","description":"Class name"},{"name":"date","description":"Session date"},{"name":"dateAr","description":"Session date in Arabic"},{"name":"dateEn","description":"Session date in English"},{"name":"startTime","description":"Session start"},{"name":"endTime","description":"Session end"},{"name":"recipientName","description":"Recipient name"},{"name":"joinUrl","description":"Join link"}]$json$::jsonb
      WHERE "template_key" = 'online.class_invited'
    `);
    await queryRunner.query(`
      UPDATE "school_notification_templates"
      SET
        "subject_override" = NULL,
        "body_html_override" = NULL,
        "body_sms_override" = NULL,
        "subject_override_ar" = NULL,
        "body_html_override_ar" = NULL,
        "body_sms_override_ar" = NULL
      WHERE "template_key" = 'online.class_invited'
        AND (
          "body_html_override" = $html$<p>Dear {{recipientName}},</p><p>You are invited to the online class for <strong>{{courseName}}</strong> ({{groupName}}) on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$
          OR "body_html_override_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لحصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$
          OR "body_sms_override" = '{{schoolName}}: join {{courseName}} ({{groupName}}) on {{date}}. {{joinUrl}}'
          OR "body_sms_override_ar" = '{{schoolName}}: انضم إلى {{courseName}} ({{groupName}}) بتاريخ {{date}}. {{joinUrl}}'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_subject" = 'Join {{courseName}} — {{schoolName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>You are invited to the online class for <strong>{{courseName}}</strong> ({{groupName}}) on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        "default_body_sms" = '{{schoolName}}: join {{courseName}} ({{groupName}}) on {{date}}. {{joinUrl}}',
        "default_subject_ar" = 'دعوة لحصة {{courseName}} — {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لحصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: انضم إلى {{courseName}} ({{groupName}}) بتاريخ {{date}}. {{joinUrl}}',
        "factory_subject" = 'Join {{courseName}} — {{schoolName}}',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>You are invited to the online class for <strong>{{courseName}}</strong> ({{groupName}}) on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        "factory_body_sms" = '{{schoolName}}: join {{courseName}} ({{groupName}}) on {{date}}. {{joinUrl}}',
        "factory_subject_ar" = 'دعوة لحصة {{courseName}} — {{schoolName}}',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لحصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: انضم إلى {{courseName}} ({{groupName}}) بتاريخ {{date}}. {{joinUrl}}'
      WHERE "template_key" = 'online.class_invited'
    `);
  }
}
