import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  brandedOtpBlock,
  brandedParagraph,
} from '../notifications/school-notification-branding';

/** OTP code sits on white — no teal panel behind the digits. */
export class SignupOtpWhiteBackground1792310000000 implements MigrationInterface {
  name = 'SignupOtpWhiteBackground1792310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const htmlEn =
      brandedParagraph('Use this code to verify your email on FIKR:') +
      brandedOtpBlock('{{otpCode}}') +
      brandedParagraph(
        `This code expires in <strong>{{expiresMinutes}}</strong> minutes. If you did not request it, you can ignore this email.`,
      );
    const htmlAr =
      brandedParagraph('استخدم هذا الرمز للتحقق من بريدك على منصة فكر:') +
      brandedOtpBlock('{{otpCode}}') +
      brandedParagraph(
        `ينتهي الرمز خلال <strong>{{expiresMinutes}}</strong> دقيقة. إذا لم تطلب الرمز، تجاهل هذه الرسالة.`,
      );

    await queryRunner.query(
      `UPDATE "notification_template_definitions"
       SET "default_body_html" = $2, "default_body_html_ar" = $3,
           "factory_body_html" = $2, "factory_body_html_ar" = $3
       WHERE "template_key" = $1`,
      ['platform.signup_email_otp', htmlEn, htmlAr],
    );
  }

  public async down(): Promise<void> {
    // Restyle — revert from git if needed.
  }
}
