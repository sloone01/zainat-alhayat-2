import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Confirmation email/SMS to the school owner after public /subscribe signup
 * (pending platform approval).
 */
export class SchoolRegistrationReceivedTemplate1790300000000 implements MigrationInterface {
  name = 'SchoolRegistrationReceivedTemplate1790300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `
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
        'platform.school_registration_received',
        'School signup confirmation',
        'Sent to the school owner when they submit a registration request on /subscribe.',
        'both',
        'system',
        'We received your registration — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>Thank you for registering <strong>{{schoolName}}</strong>.</p><p>Your request is pending review by the platform team. We will email you when it is approved.</p><p>Account email: <strong>{{email}}</strong></p><p>Selected plan: <strong>{{planName}}</strong></p>$html$,
        '{{schoolName}}: registration received. We will email you after review.',
        'استلمنا طلب تسجيلك — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>شكراً لتسجيل <strong>{{schoolName}}</strong>.</p><p>طلبك قيد المراجعة من فريق المنصة. سنراسل لك عند الموافقة.</p><p>بريد الحساب: <strong>{{email}}</strong></p><p>الباقة المختارة: <strong>{{planName}}</strong></p>$html$,
        '{{schoolName}}: تم استلام التسجيل. سنراسل لك بعد المراجعة.',
        'We received your registration — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>Thank you for registering <strong>{{schoolName}}</strong>.</p><p>Your request is pending review by the platform team. We will email you when it is approved.</p><p>Account email: <strong>{{email}}</strong></p><p>Selected plan: <strong>{{planName}}</strong></p>$html$,
        '{{schoolName}}: registration received. We will email you after review.',
        'استلمنا طلب تسجيلك — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>شكراً لتسجيل <strong>{{schoolName}}</strong>.</p><p>طلبك قيد المراجعة من فريق المنصة. سنراسل لك عند الموافقة.</p><p>بريد الحساب: <strong>{{email}}</strong></p><p>الباقة المختارة: <strong>{{planName}}</strong></p>$html$,
        '{{schoolName}}: تم استلام التسجيل. سنراسل لك بعد المراجعة.',
        $json$[{"name":"recipientName","description":"Owner name"},{"name":"email","description":"Owner login email"},{"name":"planName","description":"Selected plan name or code"},{"name":"schoolName","description":"School name"}]$json$::jsonb
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
      `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'platform.school_registration_received'`,
    );
  }
}
