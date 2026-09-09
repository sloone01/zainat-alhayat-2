import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * School approval email must include the auto-generated temporary password
 * (signup no longer collects a password).
 */
export class SchoolApprovedTempPassword1790200000000 implements MigrationInterface {
  name = 'SchoolApprovedTempPassword1790200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "description" = 'Sent to the school owner when the platform approves the school, with a temporary login password.',
        "default_subject" = '{{schoolName}} is approved — your login',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>{{schoolName}} is now active.</p><p>Sign in with <strong>{{email}}</strong> and temporary password: <strong>{{tempPassword}}</strong></p><p>Change it after you sign in.</p>$html$,
        "default_body_sms" = '{{schoolName}} approved. {{email}} / {{tempPassword}}',
        "default_subject_ar" = 'تمت الموافقة على {{schoolName}} — بيانات الدخول',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أصبحت {{schoolName}} نشطة.</p><p>سجّل الدخول بـ <strong>{{email}}</strong> وكلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>غيّرها بعد تسجيل الدخول.</p>$html$,
        "default_body_sms_ar" = 'تمت الموافقة على {{schoolName}}. {{email}} / {{tempPassword}}',
        "factory_subject" = '{{schoolName}} is approved — your login',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p>{{schoolName}} is now active.</p><p>Sign in with <strong>{{email}}</strong> and temporary password: <strong>{{tempPassword}}</strong></p><p>Change it after you sign in.</p>$html$,
        "factory_body_sms" = '{{schoolName}} approved. {{email}} / {{tempPassword}}',
        "factory_subject_ar" = 'تمت الموافقة على {{schoolName}} — بيانات الدخول',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أصبحت {{schoolName}} نشطة.</p><p>سجّل الدخول بـ <strong>{{email}}</strong> وكلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>غيّرها بعد تسجيل الدخول.</p>$html$,
        "factory_body_sms_ar" = 'تمت الموافقة على {{schoolName}}. {{email}} / {{tempPassword}}',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"},{"name":"email","description":"Login email"},{"name":"tempPassword","description":"Temporary password"},{"name":"schoolName","description":"School name"}]'::jsonb
      WHERE "template_key" = 'platform.school_approved'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "description" = 'Sent to the school owner when the platform approves the school.',
        "default_subject" = '{{schoolName}} is approved',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p>{{schoolName}} is now active. You can sign in and start using the system.</p>$html$,
        "default_body_sms" = '{{schoolName}} is approved. You can sign in now.',
        "default_subject_ar" = 'تمت الموافقة على {{schoolName}}',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أصبحت {{schoolName}} نشطة. يمكنك تسجيل الدخول الآن.</p>$html$,
        "default_body_sms_ar" = 'تمت الموافقة على {{schoolName}}. يمكنك تسجيل الدخول.',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"}]'::jsonb
      WHERE "template_key" = 'platform.school_approved'
    `);
  }
}
