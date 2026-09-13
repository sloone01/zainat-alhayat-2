import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingRoomOpenedAt1792170000000 implements MigrationInterface {
  name = 'MeetingRoomOpenedAt1792170000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ADD COLUMN IF NOT EXISTS "opened_at" TIMESTAMPTZ NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "meeting_rooms"
        ADD COLUMN IF NOT EXISTS "opened_by" uuid NULL
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
        'meeting.started',
        'Meeting started',
        'Sent to invitees when staff opens a video meeting room.',
        'both',
        'school',
        '{{title}} is live — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p><strong>{{title}}</strong> has started.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: "{{title}}" is live. {{joinUrl}}',
        '{{title}} بدأ — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>بدأ اجتماع <strong>{{title}}</strong>.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: "{{title}}" بدأ. {{joinUrl}}',
        '{{title}} is live — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p><strong>{{title}}</strong> has started.</p><p><a href="{{joinUrl}}">Join</a></p>$html$,
        '{{schoolName}}: "{{title}}" is live. {{joinUrl}}',
        '{{title}} بدأ — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>بدأ اجتماع <strong>{{title}}</strong>.</p><p><a href="{{joinUrl}}">انضمام</a></p>$html$,
        '{{schoolName}}: "{{title}}" بدأ. {{joinUrl}}',
        $json$[{"name":"title","description":"Meeting title"},{"name":"recipientName","description":"Invitee name"},{"name":"joinUrl","description":"Join link"}]$json$::jsonb
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
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'meeting.started'`,
    );
    await queryRunner.query(`ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "opened_by"`);
    await queryRunner.query(`ALTER TABLE "meeting_rooms" DROP COLUMN IF EXISTS "opened_at"`);
  }
}
