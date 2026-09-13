import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Combined owner email for platform register submit / approve:
 * registration confirmation + login credentials + payment receipt details.
 */
export class PlatformSchoolApprovedCombinedReceipt1791000000000 implements MigrationInterface {
  name = 'PlatformSchoolApprovedCombinedReceipt1791000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "display_name" = 'Platform school registered (credentials + receipt)',
        "description" = 'Owner welcome: school active, temporary password, and payment receipt (file attached when uploaded).',
        "default_subject" = '{{schoolName}} is ready — login & payment receipt',
        "default_body_html" = $html$<p>Dear {{recipientName}},</p><p><strong>{{schoolName}}</strong> is registered and active.</p><p>Sign in with <strong>{{email}}</strong><br/>Temporary password: <strong>{{tempPassword}}</strong></p><p>Plan: <strong>{{planName}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>Change the password after you sign in. If a receipt file was uploaded, it is attached.</p>$html$,
        "default_body_sms" = '{{schoolName}} ready. {{email}} / {{tempPassword}}. Paid {{amount}} {{currency}}.',
        "default_subject_ar" = '{{schoolName}} جاهزة — الدخول وإيصال السداد',
        "default_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تسجيل <strong>{{schoolName}}</strong> وتفعيلها.</p><p>سجّل الدخول بـ <strong>{{email}}</strong><br/>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>الخطة: <strong>{{planName}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>غيّر كلمة المرور بعد تسجيل الدخول. إذا رُفع ملف إيصال فهو مرفق.</p>$html$,
        "default_body_sms_ar" = '{{schoolName}} جاهزة. {{email}} / {{tempPassword}}. دُفع {{amount}} {{currency}}.',
        "factory_subject" = '{{schoolName}} is ready — login & payment receipt',
        "factory_body_html" = $html$<p>Dear {{recipientName}},</p><p><strong>{{schoolName}}</strong> is registered and active.</p><p>Sign in with <strong>{{email}}</strong><br/>Temporary password: <strong>{{tempPassword}}</strong></p><p>Plan: <strong>{{planName}}</strong><br/>Amount paid: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>Change the password after you sign in. If a receipt file was uploaded, it is attached.</p>$html$,
        "factory_body_sms" = '{{schoolName}} ready. {{email}} / {{tempPassword}}. Paid {{amount}} {{currency}}.',
        "factory_subject_ar" = '{{schoolName}} جاهزة — الدخول وإيصال السداد',
        "factory_body_html_ar" = $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تسجيل <strong>{{schoolName}}</strong> وتفعيلها.</p><p>سجّل الدخول بـ <strong>{{email}}</strong><br/>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>الخطة: <strong>{{planName}}</strong><br/>المبلغ المدفوع: <strong>{{amount}} {{currency}}</strong></p><p>{{paidNote}}</p><p><a href="{{loginUrl}}">{{loginUrl}}</a></p><p>غيّر كلمة المرور بعد تسجيل الدخول. إذا رُفع ملف إيصال فهو مرفق.</p>$html$,
        "factory_body_sms_ar" = '{{schoolName}} جاهزة. {{email}} / {{tempPassword}}. دُفع {{amount}} {{currency}}.',
        "variable_hints" = '[{"name":"recipientName","description":"Owner name"},{"name":"schoolName","description":"School name"},{"name":"email","description":"Login email"},{"name":"tempPassword","description":"Temporary password"},{"name":"planName","description":"Plan name"},{"name":"amount","description":"Amount paid"},{"name":"invoiceTotal","description":"Invoice total"},{"name":"currency","description":"Currency"},{"name":"loginUrl","description":"Sign-in URL"},{"name":"paidNote","description":"Optional payment note"}]'::jsonb
      WHERE "template_key" = 'platform.school_approved'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "display_name" = 'Platform school approved',
        "description" = 'Sent to the school owner when registration is approved.'
      WHERE "template_key" = 'platform.school_approved'
    `);
  }
}
