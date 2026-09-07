import { MigrationInterface, QueryRunner } from 'typeorm';

export class NotificationEventTemplates1784800000000 implements MigrationInterface {
  name = 'NotificationEventTemplates1784800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "notification_template_definitions" (
        "id", "template_key", "display_name", "description", "channel",
        "default_subject", "default_body_html", "default_body_sms",
        "default_subject_ar", "default_body_html_ar", "default_body_sms_ar",
        "variable_hints"
      )
      VALUES
      (
        uuid_generate_v4(),
        'payment.offline_submitted',
        'Offline receipt submitted',
        'Sent to the school when a parent uploads a payment receipt.',
        'email',
        'New receipt to review — {{schoolName}}',
        $html$<p>A parent submitted a payment receipt for <strong>{{studentName}}</strong>.</p><p>Amount: {{amount}} {{currency}}</p><p>Review it under Pending receipts.</p>$html$,
        'New receipt for {{studentName}}: {{amount}} {{currency}}.',
        'إيصال جديد للمراجعة — {{schoolName}}',
        $html$<p>رفع ولي الأمر إيصالاً لطالب <strong>{{studentName}}</strong>.</p><p>المبلغ: {{amount}} {{currency}}</p><p>راجعه من الإيصالات المعلقة.</p>$html$,
        'إيصال جديد لـ {{studentName}}: {{amount}} {{currency}}.',
        '[{"name":"schoolName","description":"School name"},{"name":"studentName","description":"Student name"},{"name":"amount","description":"Amount"},{"name":"currency","description":"Currency"}]'::jsonb
      ),
      (
        uuid_generate_v4(),
        'transfer.pending_school',
        'Transfer awaiting school confirmation',
        'Sent to the school when the platform creates a fee transfer.',
        'email',
        'Transfer to confirm — {{schoolName}}',
        $html$<p>A fee transfer is waiting for school confirmation.</p><p>Amount: {{amount}} {{currency}}</p><p>Reference: {{reference}}</p>$html$,
        'Transfer to confirm: {{amount}} {{currency}} ({{reference}}).',
        'تحويل بانتظار تأكيد المدرسة — {{schoolName}}',
        $html$<p>يوجد تحويل رسوم بانتظار تأكيد المدرسة.</p><p>المبلغ: {{amount}} {{currency}}</p><p>المرجع: {{reference}}</p>$html$,
        'تحويل للتأكيد: {{amount}} {{currency}} ({{reference}}).',
        '[{"name":"schoolName","description":"School name"},{"name":"amount","description":"Amount"},{"name":"currency","description":"Currency"},{"name":"reference","description":"Transfer reference"}]'::jsonb
      ),
      (
        uuid_generate_v4(),
        'enrollment.accepted',
        'Enrollment accepted',
        'Sent to guardians when an enrollment application is accepted.',
        'both',
        'Enrollment accepted — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>The enrollment of <strong>{{studentName}}</strong> at {{schoolName}} has been accepted.</p>$html$,
        '{{schoolName}}: enrollment of {{studentName}} was accepted.',
        'تم قبول التسجيل — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم قبول تسجيل <strong>{{studentName}}</strong> في {{schoolName}}.</p>$html$,
        '{{schoolName}}: تم قبول تسجيل {{studentName}}.',
        '[{"name":"schoolName","description":"School name"},{"name":"studentName","description":"Student name"},{"name":"recipientName","description":"Guardian name"}]'::jsonb
      ),
      (
        uuid_generate_v4(),
        'enrollment.rejected',
        'Enrollment not accepted',
        'Sent to guardians when an enrollment application is rejected.',
        'both',
        'Enrollment update — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>The enrollment of <strong>{{studentName}}</strong> was not accepted.</p><p>{{notes}}</p>$html$,
        '{{schoolName}}: enrollment of {{studentName}} was not accepted.',
        'تحديث طلب التسجيل — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>لم يُقبل تسجيل <strong>{{studentName}}</strong>.</p><p>{{notes}}</p>$html$,
        '{{schoolName}}: لم يُقبل تسجيل {{studentName}}.',
        '[{"name":"schoolName","description":"School name"},{"name":"studentName","description":"Student name"},{"name":"recipientName","description":"Guardian name"},{"name":"notes","description":"Rejection notes"}]'::jsonb
      ),
      (
        uuid_generate_v4(),
        'auth.password_reset',
        'Password reset',
        'Sent when a temporary password is generated.',
        'email',
        'Temporary password — {{schoolName}}',
        $html$<p>Dear {{recipientName}},</p><p>Your temporary password is: <strong>{{tempPassword}}</strong></p><p>Sign in and change it immediately.</p>$html$,
        '{{schoolName}}: temporary password {{tempPassword}}',
        'كلمة مرور مؤقتة — {{schoolName}}',
        $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>كلمة المرور المؤقتة: <strong>{{tempPassword}}</strong></p><p>سجّل الدخول وغيّرها فوراً.</p>$html$,
        '{{schoolName}}: كلمة المرور المؤقتة {{tempPassword}}',
        '[{"name":"schoolName","description":"School name"},{"name":"recipientName","description":"User name"},{"name":"tempPassword","description":"Temporary password"}]'::jsonb
      )
      ON CONFLICT ("template_key") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "notification_template_definitions"
      WHERE "template_key" IN (
        'payment.offline_submitted',
        'transfer.pending_school',
        'enrollment.accepted',
        'enrollment.rejected',
        'auth.password_reset'
      )
    `);
  }
}
