import { MigrationInterface, QueryRunner } from 'typeorm';

type Seed = {
  key: string;
  name: string;
  description: string;
  channel: 'email' | 'sms' | 'both';
  audience: 'school' | 'system';
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
    key: 'payment.installment_due',
    name: 'Installment due',
    description: 'Sent to guardians on the installment due date.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Installment due — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>An installment for <strong>{{studentName}}</strong> is due on {{date}} ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: installment for {{studentName}} is due on {{date}} ({{amount}} {{currency}}).',
    subjectAr: 'استحقاق قسط — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يستحق قسط <strong>{{studentName}}</strong> بتاريخ {{date}} ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: قسط {{studentName}} مستحق بتاريخ {{date}} ({{amount}} {{currency}}).',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Due date' },
      { name: 'amount', description: 'Balance due' },
      { name: 'currency', description: 'Currency' },
      { name: 'notes', description: 'Installment label' },
    ],
  },
  {
    key: 'payment.installment_late',
    name: 'Installment overdue',
    description: 'Sent to guardians when an installment is past due.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Overdue installment — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>An installment for <strong>{{studentName}}</strong> was due on {{date}} and is still unpaid ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: overdue installment for {{studentName}} ({{amount}} {{currency}}).',
    subjectAr: 'قسط متأخر — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>قسط <strong>{{studentName}}</strong> كان مستحقاً بتاريخ {{date}} وما زال غير مسدّد ({{amount}} {{currency}}).</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: قسط متأخر لـ {{studentName}} ({{amount}} {{currency}}).',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Due date' },
      { name: 'amount', description: 'Balance due' },
      { name: 'currency', description: 'Currency' },
      { name: 'notes', description: 'Installment label' },
    ],
  },
  {
    key: 'attendance.present',
    name: 'Student present',
    description: 'Sent to guardians when a student is marked present.',
    channel: 'both',
    audience: 'school',
    subjectEn: '{{studentName}} is present — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> was marked present on {{date}}.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: {{studentName}} is present on {{date}}.',
    subjectAr: 'حضور {{studentName}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>سُجّل حضور <strong>{{studentName}}</strong> بتاريخ {{date}}.</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: حضور {{studentName}} بتاريخ {{date}}.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Attendance date' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'chat.direct_message',
    name: 'Direct chat message',
    description: 'Push when someone sends a direct message.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'New message from {{senderName}}',
    htmlEn: '<p>{{senderName}}: {{preview}}</p>',
    smsEn: '{{senderName}}: {{preview}}',
    subjectAr: 'رسالة جديدة من {{senderName}}',
    htmlAr: '<p>{{senderName}}: {{preview}}</p>',
    smsAr: '{{senderName}}: {{preview}}',
    hints: [
      { name: 'senderName', description: 'Sender name' },
      { name: 'preview', description: 'Message preview' },
    ],
  },
  {
    key: 'chat.group_message',
    name: 'Group chat message',
    description: 'Push when someone posts in a group chat.',
    channel: 'both',
    audience: 'school',
    subjectEn: '{{title}}: {{senderName}}',
    htmlEn: '<p>{{senderName}} in {{title}}: {{preview}}</p>',
    smsEn: '{{title}} — {{senderName}}: {{preview}}',
    subjectAr: '{{title}}: {{senderName}}',
    htmlAr: '<p>{{senderName}} في {{title}}: {{preview}}</p>',
    smsAr: '{{title}} — {{senderName}}: {{preview}}',
    hints: [
      { name: 'title', description: 'Group name' },
      { name: 'senderName', description: 'Sender name' },
      { name: 'preview', description: 'Message preview' },
    ],
  },
  {
    key: 'grade.marks_updated',
    name: 'Grades updated',
    description: 'Sent to guardians when marks are saved.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Grades updated for {{studentName}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Marks were updated for <strong>{{studentName}}</strong> in {{courseName}}.</p>',
    smsEn: '{{schoolName}}: grades updated for {{studentName}} ({{courseName}}).',
    subjectAr: 'تحديث درجات {{studentName}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تحديث درجات <strong>{{studentName}}</strong> في {{courseName}}.</p>',
    smsAr: '{{schoolName}}: تم تحديث درجات {{studentName}} ({{courseName}}).',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'courseName', description: 'Course name' },
    ],
  },
  {
    key: 'progress.updated',
    name: 'Progress updated',
    description: 'Sent to guardians when student progress is saved.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Progress update for {{studentName}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Progress was updated for <strong>{{studentName}}</strong> in {{courseName}} ({{status}}).</p>',
    smsEn: '{{schoolName}}: progress updated for {{studentName}} ({{courseName}}).',
    subjectAr: 'تحديث تقدم {{studentName}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تحديث تقدم <strong>{{studentName}}</strong> في {{courseName}} ({{status}}).</p>',
    smsAr: '{{schoolName}}: تم تحديث تقدم {{studentName}} ({{courseName}}).',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'courseName', description: 'Course name' },
      { name: 'status', description: 'Progress status' },
    ],
  },
  {
    key: 'course.material_uploaded',
    name: 'Course material uploaded',
    description: 'Sent when a teacher uploads course material (if the course sends notifications).',
    channel: 'both',
    audience: 'school',
    subjectEn: 'New material: {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>New material <strong>{{title}}</strong> was added to {{courseName}}.</p>',
    smsEn: '{{schoolName}}: new material "{{title}}" in {{courseName}}.',
    subjectAr: 'مادة جديدة: {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أُضيفت مادة <strong>{{title}}</strong> إلى {{courseName}}.</p>',
    smsAr: '{{schoolName}}: مادة جديدة "{{title}}" في {{courseName}}.',
    hints: [
      { name: 'title', description: 'Material title' },
      { name: 'courseName', description: 'Course name' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'session.completed',
    name: 'Session completed',
    description: 'Sent when a weekly session is marked complete (if the course sends notifications).',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Session completed: {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>The session <strong>{{title}}</strong> in {{courseName}} was completed.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}}: session "{{title}}" completed.',
    subjectAr: 'اكتمال حصة: {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>اكتملت الحصة <strong>{{title}}</strong> في {{courseName}}.</p><p>{{notes}}</p>',
    smsAr: '{{schoolName}}: اكتملت الحصة "{{title}}".',
    hints: [
      { name: 'title', description: 'Session title' },
      { name: 'courseName', description: 'Course name' },
      { name: 'notes', description: 'Completion notes' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'session.media_uploaded',
    name: 'Session media uploaded',
    description: 'Sent when photos or videos are added to a session (if the course sends notifications).',
    channel: 'both',
    audience: 'school',
    subjectEn: 'New session media — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>New {{title}} was added to {{courseName}}.</p>',
    smsEn: '{{schoolName}}: new session media in {{courseName}}.',
    subjectAr: 'وسائط حصة جديدة — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أُضيف {{title}} إلى {{courseName}}.</p>',
    smsAr: '{{schoolName}}: وسائط جديدة في {{courseName}}.',
    hints: [
      { name: 'title', description: 'Media type or file name' },
      { name: 'courseName', description: 'Course name' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'bus.boarded',
    name: 'Student boarded bus',
    description: 'Sent to guardians when a student boards the bus.',
    channel: 'both',
    audience: 'school',
    subjectEn: '{{studentName}} boarded the bus — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> boarded the bus on {{date}}.</p>',
    smsEn: '{{schoolName}}: {{studentName}} boarded the bus.',
    subjectAr: 'صعود {{studentName}} للحافلة — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>صعد <strong>{{studentName}}</strong> إلى الحافلة بتاريخ {{date}}.</p>',
    smsAr: '{{schoolName}}: صعد {{studentName}} إلى الحافلة.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Trip date' },
    ],
  },
  {
    key: 'bus.dropped_off',
    name: 'Student dropped off',
    description: 'Sent to guardians when a student is dropped off.',
    channel: 'both',
    audience: 'school',
    subjectEn: '{{studentName}} was dropped off — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> was dropped off on {{date}}.</p>',
    smsEn: '{{schoolName}}: {{studentName}} was dropped off.',
    subjectAr: 'نزول {{studentName}} من الحافلة — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>نزل <strong>{{studentName}}</strong> من الحافلة بتاريخ {{date}}.</p>',
    smsAr: '{{schoolName}}: نزل {{studentName}} من الحافلة.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'date', description: 'Trip date' },
    ],
  },
  {
    key: 'online.class_started',
    name: 'Online class started',
    description: 'Sent to group parents when an online room is created.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Online class started — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>An online class for {{courseName}} is starting on {{date}}.</p>',
    smsEn: '{{schoolName}}: online class for {{courseName}} is starting.',
    subjectAr: 'بدء حصة إلكترونية — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>بدأت حصة إلكترونية لـ {{courseName}} بتاريخ {{date}}.</p>',
    smsAr: '{{schoolName}}: بدأت حصة إلكترونية لـ {{courseName}}.',
    hints: [
      { name: 'courseName', description: 'Course name' },
      { name: 'date', description: 'Session date' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'online.session_missed',
    name: 'Online session missed',
    description: 'Sent when a student did not attend a past online session.',
    channel: 'both',
    audience: 'school',
    subjectEn: '{{studentName}} missed an online class — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p><strong>{{studentName}}</strong> did not attend the online class for {{courseName}} on {{date}}.</p>',
    smsEn: '{{schoolName}}: {{studentName}} missed {{courseName}} on {{date}}.',
    subjectAr: 'غياب {{studentName}} عن حصة إلكترونية — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>لم يحضر <strong>{{studentName}}</strong> الحصة الإلكترونية لـ {{courseName}} بتاريخ {{date}}.</p>',
    smsAr: '{{schoolName}}: غياب {{studentName}} عن {{courseName}} بتاريخ {{date}}.',
    hints: [
      { name: 'studentName', description: 'Student name' },
      { name: 'recipientName', description: 'Guardian name' },
      { name: 'courseName', description: 'Course name' },
      { name: 'date', description: 'Session date' },
    ],
  },
  {
    key: 'schedule.cancelled',
    name: 'Class cancelled',
    description: 'Sent to group parents when a class slot is cancelled.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Class cancelled — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>The class {{courseName}} on {{title}} ({{date}}) was cancelled.</p>',
    smsEn: '{{schoolName}}: {{courseName}} on {{title}} was cancelled.',
    subjectAr: 'إلغاء حصة — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>أُلغيت حصة {{courseName}} يوم {{title}} ({{date}}).</p>',
    smsAr: '{{schoolName}}: أُلغيت {{courseName}} يوم {{title}}.',
    hints: [
      { name: 'courseName', description: 'Course name' },
      { name: 'title', description: 'Day of week' },
      { name: 'date', description: 'Time' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'activity.updated',
    name: 'Activity updated',
    description: 'Sent when an activity date or location changes.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Activity updated: {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Activity <strong>{{title}}</strong> was updated. New date: {{date}}{{location}}.</p>',
    smsEn: '{{schoolName}}: activity "{{title}}" updated ({{date}}).',
    subjectAr: 'تحديث نشاط: {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تحديث النشاط <strong>{{title}}</strong>. التاريخ الجديد: {{date}}{{location}}.</p>',
    smsAr: '{{schoolName}}: تم تحديث النشاط "{{title}}" ({{date}}).',
    hints: [
      { name: 'title', description: 'Activity title' },
      { name: 'date', description: 'Activity date' },
      { name: 'location', description: 'Location' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'letter.approval_reminder',
    name: 'Approval letter reminder',
    description: 'Sent to a parent who has not answered an approval letter.',
    channel: 'both',
    audience: 'school',
    subjectEn: 'Reminder: please answer {{title}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Please review and answer the letter <strong>{{title}}</strong>.</p>',
    smsEn: '{{schoolName}}: please answer "{{title}}".',
    subjectAr: 'تذكير: يرجى الرد على {{title}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>يرجى مراجعة الرسالة <strong>{{title}}</strong> والرد عليها.</p>',
    smsAr: '{{schoolName}}: يرجى الرد على "{{title}}".',
    hints: [
      { name: 'title', description: 'Letter title' },
      { name: 'recipientName', description: 'Guardian name' },
    ],
  },
  {
    key: 'platform.school_rejected',
    name: 'School registration rejected',
    description: 'Sent to the school owner when the platform rejects the school.',
    channel: 'both',
    audience: 'system',
    subjectEn: '{{schoolName}} registration was not approved',
    htmlEn: '<p>Dear {{recipientName}},</p><p>The registration for {{schoolName}} was not approved.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}} registration was not approved.',
    subjectAr: 'لم تُقبل مدرسة {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>لم تتم الموافقة على تسجيل {{schoolName}}.</p><p>{{notes}}</p>',
    smsAr: 'لم تتم الموافقة على تسجيل {{schoolName}}.',
    hints: [
      { name: 'recipientName', description: 'Owner name' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'platform.school_suspended',
    name: 'School suspended',
    description: 'Sent to the school owner when the platform suspends the school.',
    channel: 'both',
    audience: 'system',
    subjectEn: '{{schoolName}} is suspended',
    htmlEn: '<p>Dear {{recipientName}},</p><p>{{schoolName}} has been suspended.</p><p>{{notes}}</p>',
    smsEn: '{{schoolName}} has been suspended.',
    subjectAr: 'تعليق {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تعليق {{schoolName}}.</p><p>{{notes}}</p>',
    smsAr: 'تم تعليق {{schoolName}}.',
    hints: [
      { name: 'recipientName', description: 'Owner name' },
      { name: 'notes', description: 'Notes' },
    ],
  },
  {
    key: 'platform.school_registered',
    name: 'School registration received',
    description: 'Sent to platform operators when a school signs up.',
    channel: 'both',
    audience: 'system',
    subjectEn: 'New school registration: {{schoolName}}',
    htmlEn: '<p>A new school registered: <strong>{{schoolName}}</strong>.</p><p>Owner: {{recipientName}} ({{email}}).</p>',
    smsEn: 'New school registration: {{schoolName}}.',
    subjectAr: 'تسجيل مدرسة جديدة: {{schoolName}}',
    htmlAr: '<p>سجّلت مدرسة جديدة: <strong>{{schoolName}}</strong>.</p><p>المالك: {{recipientName}} ({{email}}).</p>',
    smsAr: 'تسجيل مدرسة جديدة: {{schoolName}}.',
    hints: [
      { name: 'recipientName', description: 'Owner name' },
      { name: 'email', description: 'Owner email' },
    ],
  },
  {
    key: 'platform.invoice_issued',
    name: 'Platform invoice issued',
    description: 'Sent to the school owner when a platform invoice is issued.',
    channel: 'both',
    audience: 'system',
    subjectEn: 'Invoice {{reference}} — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Invoice {{reference}} for {{amount}} {{currency}} has been issued for {{schoolName}}.</p>',
    smsEn: '{{schoolName}}: invoice {{reference}} ({{amount}} {{currency}}).',
    subjectAr: 'فاتورة {{reference}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>صدرت الفاتورة {{reference}} بمبلغ {{amount}} {{currency}} لـ {{schoolName}}.</p>',
    smsAr: '{{schoolName}}: فاتورة {{reference}} ({{amount}} {{currency}}).',
    hints: [
      { name: 'recipientName', description: 'Owner name' },
      { name: 'reference', description: 'Invoice id' },
      { name: 'amount', description: 'Amount' },
      { name: 'currency', description: 'Currency' },
    ],
  },
  {
    key: 'platform.invoice_paid',
    name: 'Platform invoice paid',
    description: 'Sent to the school owner when a platform invoice is marked paid.',
    channel: 'both',
    audience: 'system',
    subjectEn: 'Invoice {{reference}} paid — {{schoolName}}',
    htmlEn: '<p>Dear {{recipientName}},</p><p>Invoice {{reference}} ({{amount}} {{currency}}) is marked paid.</p>',
    smsEn: '{{schoolName}}: invoice {{reference}} is paid.',
    subjectAr: 'سداد الفاتورة {{reference}} — {{schoolName}}',
    htmlAr: '<p>عزيزي/عزيزتي {{recipientName}}،</p><p>تم تعليم الفاتورة {{reference}} ({{amount}} {{currency}}) كمدفوعة.</p>',
    smsAr: '{{schoolName}}: تم سداد الفاتورة {{reference}}.',
    hints: [
      { name: 'recipientName', description: 'Owner name' },
      { name: 'reference', description: 'Invoice id' },
      { name: 'amount', description: 'Amount' },
      { name: 'currency', description: 'Currency' },
    ],
  },
];

export class RemainingNotificationTemplatesAndPlatform1785300000000 implements MigrationInterface {
  name = 'RemainingNotificationTemplatesAndPlatform1785300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "audience" varchar(20) NOT NULL DEFAULT 'school'
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_subject" text
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_body_html" text
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_body_sms" text
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_subject_ar" text
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_body_html_ar" text
    `);
    await queryRunner.query(`
      ALTER TABLE "notification_template_definitions"
      ADD COLUMN IF NOT EXISTS "factory_body_sms_ar" text
    `);

    await queryRunner.query(`
      UPDATE "notification_template_definitions"
      SET
        "factory_subject" = COALESCE("factory_subject", "default_subject"),
        "factory_body_html" = COALESCE("factory_body_html", "default_body_html"),
        "factory_body_sms" = COALESCE("factory_body_sms", "default_body_sms"),
        "factory_subject_ar" = COALESCE("factory_subject_ar", "default_subject_ar"),
        "factory_body_html_ar" = COALESCE("factory_body_html_ar", "default_body_html_ar"),
        "factory_body_sms_ar" = COALESCE("factory_body_sms_ar", "default_body_sms_ar"),
        "audience" = CASE
          WHEN "template_key" LIKE 'platform.%' THEN 'system'
          ELSE COALESCE("audience", 'school')
        END
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "notification_send_log" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "template_key" varchar(120) NOT NULL,
        "entity_id" varchar(160) NOT NULL,
        "school_id" int,
        "sent_on" date NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_notification_send_log" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_notification_send_log_key_entity_day" UNIQUE ("template_key", "entity_id", "sent_on")
      )
    `);

    for (const s of SEEDS) {
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
          uuid_generate_v4(), $1, $2, $3, $4, $5,
          $6, $7, $8, $9, $10, $11,
          $6, $7, $8, $9, $10, $11,
          $12::jsonb
        )
        ON CONFLICT ("template_key") DO NOTHING
        `,
        [
          s.key,
          s.name,
          s.description,
          s.channel,
          s.audience,
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
    await queryRunner.query(`DROP TABLE IF EXISTS "notification_send_log"`);
  }
}
