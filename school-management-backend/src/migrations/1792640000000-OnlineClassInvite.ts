import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnlineClassInvite1792640000000 implements MigrationInterface {
  name = 'OnlineClassInvite1792640000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "online_video_sessions"
        ADD COLUMN IF NOT EXISTS "invited_at" TIMESTAMPTZ NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "online_video_sessions"
        ADD COLUMN IF NOT EXISTS "started_at" TIMESTAMPTZ NULL
    `);

    await queryRunner.query(`
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
        'online.class_invited',
        'Online class invite',
        'Sent to class parents when the teacher shares the join link. Email and push now; SMS body is ready for WhatsApp later.',
        'both',
        'school',
        'Join {{courseName}} — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>You are invited to the online class for <strong>{{courseName}}</strong> ({{groupName}}) on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: join {{courseName}} ({{groupName}}) on {{date}}. {{joinUrl}}',
        'دعوة لحصة {{courseName}} — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لحصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: انضم إلى {{courseName}} ({{groupName}}) بتاريخ {{date}}. {{joinUrl}}',
        'Join {{courseName}} — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>You are invited to the online class for <strong>{{courseName}}</strong> ({{groupName}}) on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: join {{courseName}} ({{groupName}}) on {{date}}. {{joinUrl}}',
        'دعوة لحصة {{courseName}} — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لحصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: انضم إلى {{courseName}} ({{groupName}}) بتاريخ {{date}}. {{joinUrl}}',
        $json$[{"name":"courseName","description":"Course name"},{"name":"groupName","description":"Class name"},{"name":"date","description":"Session date"},{"name":"recipientName","description":"Guardian name"},{"name":"joinUrl","description":"Join link"}]$json$::jsonb
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
    `);

    await queryRunner.query(`
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
        'online.class_started',
        'Online class started',
        'Sent to class parents when the teacher starts the online class. Email and push now; SMS body is ready for WhatsApp later.',
        'both',
        'school',
        'Online class started — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>The online class for <strong>{{courseName}}</strong> ({{groupName}}) has started on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: {{courseName}} ({{groupName}}) is live. {{joinUrl}}',
        'بدء حصة إلكترونية — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>بدأت حصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: بدأت حصة {{courseName}} ({{groupName}}). {{joinUrl}}',
        'Online class started — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>The online class for <strong>{{courseName}}</strong> ({{groupName}}) has started on {{date}}.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: {{courseName}} ({{groupName}}) is live. {{joinUrl}}',
        'بدء حصة إلكترونية — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>بدأت حصة <strong>{{courseName}}</strong> ({{groupName}}) بتاريخ {{date}}.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: بدأت حصة {{courseName}} ({{groupName}}). {{joinUrl}}',
        $json$[{"name":"courseName","description":"Course name"},{"name":"groupName","description":"Class name"},{"name":"date","description":"Session date"},{"name":"recipientName","description":"Guardian name"},{"name":"joinUrl","description":"Join link"}]$json$::jsonb
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
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'online.class_invited'`,
    );
    await queryRunner.query(`ALTER TABLE "online_video_sessions" DROP COLUMN IF EXISTS "started_at"`);
    await queryRunner.query(`ALTER TABLE "online_video_sessions" DROP COLUMN IF EXISTS "invited_at"`);
  }
}
