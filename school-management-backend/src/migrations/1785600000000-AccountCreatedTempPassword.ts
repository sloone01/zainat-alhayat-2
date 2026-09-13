import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Account-created emails include the temporary password so admins no longer
 * need a shared default like Oomani@123.
 */
export class AccountCreatedTempPassword1785600000000 implements MigrationInterface {
  name = 'AccountCreatedTempPassword1785600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_subject" = 'Your account — {{schoolName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>An account was created for you at {{schoolName}}.</p><p>Sign in with <strong>{{email}}</strong> and temporary password: <strong>{{tempPassword}}</strong></p><p>Change it after you sign in.</p>$html$,
        "default_body_sms" = '{{schoolName}}: account ready. {{email}} / {{tempPassword}}',
        "default_subject_ar" = 'حسابك — {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم إنشاء حساب لك في {{schoolName}}.</p><p>سجّل الدخول بـ <strong>{{email}}</strong> وكلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>غيّرها بعد تسجيل الدخول.</p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: حسابك جاهز. {{email}} / {{tempPassword}}',
        "factory_subject" = 'Your account — {{schoolName}}',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>An account was created for you at {{schoolName}}.</p><p>Sign in with <strong>{{email}}</strong> and temporary password: <strong>{{tempPassword}}</strong></p><p>Change it after you sign in.</p>$html$,
        "factory_body_sms" = '{{schoolName}}: account ready. {{email}} / {{tempPassword}}',
        "factory_subject_ar" = 'حسابك — {{schoolName}}',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم إنشاء حساب لك في {{schoolName}}.</p><p>سجّل الدخول بـ <strong>{{email}}</strong> وكلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>غيّرها بعد تسجيل الدخول.</p>$html$,
        "factory_body_sms_ar" = '{{schoolName}}: حسابك جاهز. {{email}} / {{tempPassword}}',
        "variable_hints" = '[{"name":"schoolName","description":"School name"},{"name":"recipientName","description":"User name"},{"name":"email","description":"Login email"},{"name":"tempPassword","description":"Temporary password"}]'::jsonb
      WHERE "template_key" = 'auth.account_created'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "default_subject" = 'Your account — {{schoolName}}',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>An account was created for you at {{schoolName}}. Sign in with {{email}} and the password given by the school.</p>$html$,
        "default_body_sms" = '{{schoolName}}: your account is ready ({{email}}).',
        "default_subject_ar" = 'حسابك — {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم إنشاء حساب لك في {{schoolName}}. سجّل الدخول بـ {{email}} وكلمة المرور التي أعطتها المدرسة.</p>$html$,
        "default_body_sms_ar" = '{{schoolName}}: حسابك جاهز ({{email}}).',
        "variable_hints" = '[{"name":"recipientName","description":"User name"},{"name":"email","description":"Login email"}]'::jsonb
      WHERE "template_key" = 'auth.account_created'
    `);
  }
}
