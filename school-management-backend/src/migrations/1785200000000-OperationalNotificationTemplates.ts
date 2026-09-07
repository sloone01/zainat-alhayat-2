import { MigrationInterface, QueryRunner } from 'typeorm';

type Seed = {
  key: string;
  name: string;
  description: string;
  channel: 'email' | 'sms' | 'both';
  subjectEn: string;
  htmlEn: string;
  smsEn: string;
  subjectAr: string;
  htmlAr: string;
  smsAr: string;
  hints: { name: string; description: string }[];
};

const SEEDS: Seed[] = [
  {
    key: 'attendance.absent',
    name: 'Student absent',
    description: 'Sent to guardians when a student is marked absent.',
    channel: 'both',
    subjectEn: '{{studentName}} is absent — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> was marked absent on {{date}}.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: {{studentName}} is absent on {{date}}.',
    subjectAr: 'غياب {{studentName}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>سُجّل غياب <strong>{{studentName}}</strong> بتاريخ {{date}}.</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: غياب {{studentName}} بتاريخ {{date}}.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Attendance date' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'attendance.late',
    name: 'Student late',
    description: 'Sent to guardians when a student is marked late.',
    channel: 'both',
    subjectEn: '{{studentName}} arrived late — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> was marked late on {{date}}.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: {{studentName}} arrived late on {{date}}.',
    subjectAr: 'تأخر {{studentName}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>سُجّل تأخر <strong>{{studentName}}</strong> بتاريخ {{date}}.</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: تأخر {{studentName}} بتاريخ {{date}}.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Attendance date' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'enrollment.submitted',
    name: 'Enrollment application received',
    description: 'Sent when a new enrollment application is submitted.',
    channel: 'both',
    subjectEn: 'Enrollment received — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>We received an enrollment application for <strong>{{studentName}}</strong>.</p>',
    smsEn: '{{schoolName}}: enrollment received for {{studentName}}.',
    subjectAr: 'استلام طلب تسجيل — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم استلام طلب تسجيل لـ <strong>{{studentName}}</strong>.</p>',
    smsAr: '{{schoolName}}: تم استلام طلب تسجيل {{studentName}}.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian or school name' },
    ],
  },
  {
    key: 'meeting.scheduled',
    name: 'Meeting scheduled',
    description: 'Sent to invitees when a video meeting is created.',
    channel: 'both',
    subjectEn: 'Meeting: {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>You are invited to <strong>{{title}}</strong> on {{date}}.</p>',
    smsEn: '{{schoolName}}: meeting "{{title}}" on {{date}}.',
    subjectAr: 'اجتماع: {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>دعوة لاجتماع <strong>{{title}}</strong> بتاريخ {{date}}.</p>',
    smsAr: '{{schoolName}}: اجتماع "{{title}}" بتاريخ {{date}}.',
    hints: [
      { name: 'title', description: 'Meeting title' },
      { name: 'date', description: 'Scheduled time' },
      { name: 'recipientName', description: 'Invitee name' },
    ],
  },
  {
    key: 'activity.scheduled',
    name: 'Activity scheduled',
    description: 'Sent to group parents when an activity is created.',
    channel: 'both',
    subjectEn: 'Activity: {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>A new activity <strong>{{title}}</strong> is scheduled on {{date}}{{location}}.</p>',
    smsEn: '{{schoolName}}: activity "{{title}}" on {{date}}.',
    subjectAr: 'نشاط: {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>نشاط جديد <strong>{{title}}</strong> بتاريخ {{date}}{{location}}.</p>',
    smsAr: '{{schoolName}}: نشاط "{{title}}" بتاريخ {{date}}.',
    hints: [
      { name: 'title', description: 'Activity title' },
      { name: 'date', description: 'Activity date' },
      { name: 'location', description: 'Location' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'payment.approved_pending',
    name: 'Receipt approved — awaiting transfer',
    description: 'Sent to the school when the platform approves an offline receipt.',
    channel: 'email',
    subjectEn: 'Receipt approved — {{schoolName}}',
    htmlEn: '<p>A receipt for <strong>{{studentName}}</strong> ({{amount}} {{currency}}) was approved and is waiting for transfer.</p>',
    smsEn: '{{schoolName}}: receipt approved for {{studentName}} ({{amount}} {{currency}}).',
    subjectAr: 'اعتماد إيصال — {{schoolName}}',
    htmlAr: '<p>تم اعتماد إيصال <strong>{{studentName}}</strong> ({{amount}} {{currency}}) وهو بانتظار التحويل.</p>',
    smsAr: '{{schoolName}}: تم اعتماد إيصال {{studentName}} ({{amount}} {{currency}}).',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'amount', description: 'Amount' },
      { name: 'currency', description: 'Currency' },
    ],
  },
  {
    key: 'transfer.rejected',
    name: 'Transfer rejected',
    description: 'Sent when a school rejects a fee transfer.',
    channel: 'email',
    subjectEn: 'Transfer rejected — {{schoolName}}',
    htmlEn: '<p>The school rejected transfer {{reference}} ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: transfer {{reference}} was rejected.',
    subjectAr: 'رفض تحويل — {{schoolName}}',
    htmlAr: '<p>رفضت المدرسة التحويل {{reference}} ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: رُفض التحويل {{reference}}.',
    hints: [
      { name: 'reference', description: 'Transfer reference' },
      { name: 'amount', description: 'Amount' },
      { name: 'currency', description: 'Currency' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'auth.account_created',
    name: 'Account created',
    description: 'Sent when an administrator creates a user account.',
    channel: 'email',
    subjectEn: 'Your account — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>An account was created for you at {{schoolName}}. Sign in with {{email}} and the password given by the school.</p>',
    smsEn: '{{schoolName}}: your account is ready ({{email}}).',
    subjectAr: 'حسابك — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم إنشاء حساب لك في {{schoolName}}. سجّل الدخول بـ {{email}} وكلمة المرور التي أعطتها المدرسة.</p>',
    smsAr: '{{schoolName}}: حسابك جاهز ({{email}}).',
    hints: [
      { name: 'recipientName', description: 'User name' },
      { name: 'email', description: 'Login email' },
    ],
  },
  {
    key: 'letter.approval_resolved',
    name: 'Letter approval answered',
    description: 'Sent to the school when a parent approves or rejects a letter.',
    channel: 'email',
    subjectEn: 'Approval {{decision}} — {{schoolName}}',
    htmlEn: '<p>{{recipientName}} {{decision}} the letter <strong>{{title}}</strong>.</p>',
    smsEn: '{{schoolName}}: {{recipientName}} {{decision}} "{{title}}".',
    subjectAr: 'رد موافقة {{decision}} — {{schoolName}}',
    htmlAr: '<p>{{recipientName}} {{decision}} الرسالة <strong>{{title}}</strong>.</p>',
    smsAr: '{{schoolName}}: {{recipientName}} {{decision}} "{{title}}".',
    hints: [
      { name: 'recipientName', description: 'Parent name' },
      { name: 'title', description: 'Letter title' },
      { name: 'decision', description: 'approved or rejected' },
    ],
  },
  {
    key: 'platform.school_approved',
    name: 'School registration approved',
    description: 'Sent to the school owner when the platform approves the school.',
    channel: 'both',
    subjectEn: '{{schoolName}} is approved',
    htmlEn: '<p>Dear {{recipientName}},</p><p>{{schoolName}} is now active. You can sign in and start using the system.</p>',
    smsEn: '{{schoolName}} is approved. You can sign in now.',
    subjectAr: 'تمت الموافقة على {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أصبحت {{schoolName}} نشطة. يمكنك تسجيل الدخول الآن.</p>',
    smsAr: 'تمت الموافقة على {{schoolName}}. يمكنك تسجيل الدخول.',
    hints: [{ name: 'recipientName', description: 'Owner name' }],
  },
];

export class OperationalNotificationTemplates1785200000000 implements MigrationInterface {
  name = 'OperationalNotificationTemplates1785200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const s of SEEDS) {
      await queryRunner.query(
        `
        INSERT INTO "notification_template_definitions" (
          "id", "template_key", "display_name", "description", "channel",
          "default_subject", "default_body_html", "default_body_sms",
          "default_subject_ar", "default_body_html_ar", "default_body_sms_ar",
          "variable_hints"
        )
        VALUES (
          uuid_generate_v4(), $1, $2, $3, $4,
          $5, $6, $7, $8, $9, $10, $11::jsonb
        )
        ON CONFLICT ("template_key") DO NOTHING
        `,
        [
          s.key,
          s.name,
          s.description,
          s.channel,
          s.subjectEn,
          s.htmlEn,
          s.smsEn,
          s.subjectAr,
          s.htmlAr,
          s.smsAr,
          JSON.stringify(s.hints),
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "notification_template_definitions" WHERE "template_key" = ANY($1::text[])`,
      [SEEDS.map((s) => s.key)],
    );
  }
}
