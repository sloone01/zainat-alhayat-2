import { MigrationInterface, QueryRunner } from 'typeorm';

export class PasswordResetToken1792410000000 implements MigrationInterface {
  name = 'PasswordResetToken1792410000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS password_reset_token_hash varchar(64),
      ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_users_password_reset_token_hash
      ON users (password_reset_token_hash)
      WHERE password_reset_token_hash IS NOT NULL
    `);

    const html = `<p>Dear {{recipientName}},</p><p><a href="{{resetUrl}}">Reset your password</a></p><p>This link expires in one hour. Your current password stays the same until you use it.</p>`;
    const htmlAr = `<p>عزيزي/عزيزتي {{recipientName}}،</p><p><a href="{{resetUrl}}">إعادة تعيين كلمة المرور</a></p><p>ينتهي هذا الرابط خلال ساعة. تبقى كلمة المرور الحالية كما هي حتى تستخدمه.</p>`;
    const hints = JSON.stringify([
      { name: 'schoolName', description: 'School name' },
      { name: 'recipientName', description: 'User name' },
      { name: 'resetUrl', description: 'Password reset link (includes a one-time token)' },
    ]);

    await queryRunner.query(
      `
      UPDATE notification_template_definitions
      SET
        description = 'Sent when a password reset link is requested. Does not change the password.',
        default_subject = 'Reset your password — {{schoolName}}',
        default_body_html = $html$${html}$html$,
        default_body_sms = '{{schoolName}}: reset password {{resetUrl}}',
        default_subject_ar = 'إعادة تعيين كلمة المرور — {{schoolName}}',
        default_body_html_ar = $html$${htmlAr}$html$,
        default_body_sms_ar = '{{schoolName}}: إعادة تعيين كلمة المرور {{resetUrl}}',
        factory_subject = 'Reset your password — {{schoolName}}',
        factory_body_html = $html$${html}$html$,
        factory_body_sms = '{{schoolName}}: reset password {{resetUrl}}',
        factory_subject_ar = 'إعادة تعيين كلمة المرور — {{schoolName}}',
        factory_body_html_ar = $html$${htmlAr}$html$,
        factory_body_sms_ar = '{{schoolName}}: إعادة تعيين كلمة المرور {{resetUrl}}',
        variable_hints = $1::jsonb
      WHERE template_key = 'auth.password_reset'
      `,
      [hints],
    );

    await queryRunner.query(`
      UPDATE school_notification_templates
      SET
        subject_override = NULL,
        body_html_override = NULL,
        body_sms_override = NULL,
        subject_override_ar = NULL,
        body_html_override_ar = NULL,
        body_sms_override_ar = NULL
      WHERE template_key = 'auth.password_reset'
        AND (
          COALESCE(body_html_override, '') LIKE '%tempPassword%'
          OR COALESCE(body_sms_override, '') LIKE '%tempPassword%'
          OR COALESCE(body_html_override_ar, '') LIKE '%tempPassword%'
          OR COALESCE(body_sms_override_ar, '') LIKE '%tempPassword%'
          OR COALESCE(subject_override, '') LIKE '%tempPassword%'
          OR COALESCE(subject_override_ar, '') LIKE '%tempPassword%'
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_users_password_reset_token_hash`);
    await queryRunner.query(`
      ALTER TABLE users
      DROP COLUMN IF EXISTS password_reset_token_hash,
      DROP COLUMN IF EXISTS password_reset_expires_at
    `);
  }
}
