import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * OTP email for verifying owner email on public /subscribe before registration.
 */
export class SignupEmailOtpTemplate1790400000000 implements MigrationInterface {
  name = 'SignupEmailOtpTemplate1790400000000';

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
        'platform.signup_email_otp',
        'Signup email verification OTP',
        'Sent when a visitor requests an email verification code on /subscribe.',
        'email',
        'system',
        'Your verification code: {{otpCode}}',
        $html$<p>Your email verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">{{otpCode}}</p><p>This code expires in {{expiresMinutes}} minutes. If you did not request it, you can ignore this email.</p>$html$,
        NULL,
        'رمز التحقق: {{otpCode}}',
        $html$<p>رمز التحقق من بريدك الإلكتروني:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">{{otpCode}}</p><p>ينتهي خلال {{expiresMinutes}} دقيقة. إذا لم تطلب الرمز، تجاهل هذه الرسالة.</p>$html$,
        NULL,
        'Your verification code: {{otpCode}}',
        $html$<p>Your email verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">{{otpCode}}</p><p>This code expires in {{expiresMinutes}} minutes. If you did not request it, you can ignore this email.</p>$html$,
        NULL,
        'رمز التحقق: {{otpCode}}',
        $html$<p>رمز التحقق من بريدك الإلكتروني:</p><p style="font-size:28px;font-weight:700;letter-spacing:0.2em;">{{otpCode}}</p><p>ينتهي خلال {{expiresMinutes}} دقيقة. إذا لم تطلب الرمز، تجاهل هذه الرسالة.</p>$html$,
        NULL,
        $json$[{"name":"otpCode","description":"Six-digit verification code"},{"name":"expiresMinutes","description":"Minutes until the code expires"},{"name":"email","description":"Email being verified"},{"name":"recipientName","description":"Recipient display name"}]$json$::jsonb
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
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = 'platform.signup_email_otp'`,
    );
  }
}
