import { brandedActionLink, clearNotice } from './school-notification-branding';

export type ClearTemplateCopy = {
  htmlEn: string;
  htmlAr: string;
  smsEn?: string;
  smsAr?: string;
};

const DEAR_EN = 'Dear {{recipientName}},';
const DEAR_AR = 'عزيزي/عزيزتي {{recipientName}}،';

function joinLink(labelEn: string, labelAr: string): { en: string; ar: string } {
  return {
    en: brandedActionLink('{{joinUrl}}', labelEn),
    ar: brandedActionLink('{{joinUrl}}', labelAr),
  };
}

function resetLink(): { en: string; ar: string } {
  return {
    en: brandedActionLink('{{resetUrl}}', 'Reset password'),
    ar: brandedActionLink('{{resetUrl}}', 'إعادة تعيين كلمة المرور'),
  };
}

function approvalLinks(): { en: string; ar: string } {
  return {
    en: `${brandedActionLink('{{approveUrl}}', 'Approve')} &nbsp; ${brandedActionLink('{{rejectUrl}}', 'Reject', 'quiet')}`,
    ar: `${brandedActionLink('{{approveUrl}}', 'موافقة')} &nbsp; ${brandedActionLink('{{rejectUrl}}', 'رفض', 'quiet')}`,
  };
}

/** Stock email bodies: what happened, the facts, and what to do next. */
export const CLEAR_NOTIFICATION_COPY: Record<string, ClearTemplateCopy> = {
  'attendance.absent': {
    htmlEn: clearNotice({
      heading: 'Absence notice',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> was marked absent.',
      details: [
        ['Student', '{{studentName}}'],
        ['Date', '{{date}}'],
      ],
      follow: 'Contact the school office if this was not expected. {{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'إشعار غياب',
      greeting: DEAR_AR,
      lead: 'سُجّل غياب <strong>{{studentName}}</strong>.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['التاريخ', '{{date}}'],
      ],
      follow: 'تواصل مع إدارة المدرسة إذا كان هذا غير متوقع. {{notes}}',
    }),
    smsEn: '{{schoolName}}: {{studentName}} is absent on {{date}}. Contact the school if this was not expected.',
    smsAr: '{{schoolName}}: غياب {{studentName}} بتاريخ {{date}}. تواصل مع المدرسة إذا كان ذلك غير متوقع.',
  },
  'attendance.late': {
    htmlEn: clearNotice({
      heading: 'Late arrival',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> arrived late.',
      details: [
        ['Student', '{{studentName}}'],
        ['Date', '{{date}}'],
      ],
      follow: '{{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'تأخر في الحضور',
      greeting: DEAR_AR,
      lead: 'سُجّل تأخر <strong>{{studentName}}</strong>.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['التاريخ', '{{date}}'],
      ],
      follow: '{{notes}}',
    }),
    smsEn: '{{schoolName}}: {{studentName}} arrived late on {{date}}.',
    smsAr: '{{schoolName}}: تأخر {{studentName}} بتاريخ {{date}}.',
  },
  'attendance.present': {
    htmlEn: clearNotice({
      heading: 'Attendance confirmed',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> was marked present.',
      details: [
        ['Student', '{{studentName}}'],
        ['Date', '{{date}}'],
      ],
      follow: 'This confirms attendance for that day. {{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'تأكيد الحضور',
      greeting: DEAR_AR,
      lead: 'سُجّل حضور <strong>{{studentName}}</strong>.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['التاريخ', '{{date}}'],
      ],
      follow: 'هذا تأكيد حضور ذلك اليوم. {{notes}}',
    }),
    smsEn: '{{schoolName}}: {{studentName}} is present on {{date}}.',
    smsAr: '{{schoolName}}: حضور {{studentName}} بتاريخ {{date}}.',
  },
  'enrollment.submitted': {
    htmlEn: clearNotice({
      heading: 'Application received',
      greeting: DEAR_EN,
      lead: 'We received an enrollment application and will review it.',
      details: [['Student', '{{studentName}}']],
      follow: 'The school will contact you with the result.',
    }),
    htmlAr: clearNotice({
      heading: 'تم استلام الطلب',
      greeting: DEAR_AR,
      lead: 'تم استلام طلب التسجيل وستتم مراجعته.',
      details: [['الطالب', '{{studentName}}']],
      follow: 'ستتواصل المدرسة معك بالنتيجة.',
    }),
    smsEn: '{{schoolName}}: enrollment application received for {{studentName}}. The school will be in touch.',
    smsAr: '{{schoolName}}: تم استلام طلب تسجيل {{studentName}}. ستتواصل المدرسة معك.',
  },
  'enrollment.accepted': {
    htmlEn: clearNotice({
      heading: 'Enrollment accepted',
      greeting: DEAR_EN,
      lead: 'The enrollment application has been accepted.',
      details: [
        ['Student', '{{studentName}}'],
        ['School', '{{schoolName}}'],
      ],
      follow: 'The school will contact you about the next step.',
    }),
    htmlAr: clearNotice({
      heading: 'تم قبول التسجيل',
      greeting: DEAR_AR,
      lead: 'تم قبول طلب التسجيل.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المدرسة', '{{schoolName}}'],
      ],
      follow: 'ستتواصل المدرسة معك بخصوص الخطوة التالية.',
    }),
    smsEn: '{{schoolName}}: enrollment of {{studentName}} was accepted. The school will contact you.',
    smsAr: '{{schoolName}}: تم قبول تسجيل {{studentName}}. ستتواصل المدرسة معك.',
  },
  'enrollment.rejected': {
    htmlEn: clearNotice({
      heading: 'Enrollment update',
      greeting: DEAR_EN,
      lead: 'The enrollment application was not accepted.',
      details: [['Student', '{{studentName}}']],
      follow: '{{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'تحديث طلب التسجيل',
      greeting: DEAR_AR,
      lead: 'لم يُقبل طلب التسجيل.',
      details: [['الطالب', '{{studentName}}']],
      follow: '{{notes}}',
    }),
    smsEn: '{{schoolName}}: enrollment of {{studentName}} was not accepted.',
    smsAr: '{{schoolName}}: لم يُقبل تسجيل {{studentName}}.',
  },
  'meeting.scheduled': {
    htmlEn: clearNotice({
      heading: 'Meeting invitation',
      greeting: DEAR_EN,
      lead: 'You are invited to a meeting. Please be available at the time below.',
      details: [
        ['Meeting', '{{title}}'],
        ['When', '{{date}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'دعوة اجتماع',
      greeting: DEAR_AR,
      lead: 'أنت مدعو إلى اجتماع. يرجى التواجد في الموعد أدناه.',
      details: [
        ['الاجتماع', '{{title}}'],
        ['الموعد', '{{date}}'],
      ],
    }),
    smsEn: '{{schoolName}}: meeting "{{title}}" on {{date}}.',
    smsAr: '{{schoolName}}: اجتماع "{{title}}" بتاريخ {{date}}.',
  },
  'meeting.started': {
    htmlEn: clearNotice({
      heading: 'Meeting is live',
      greeting: DEAR_EN,
      lead: 'The meeting has started and is ready to join.',
      details: [['Meeting', '{{title}}']],
      actionHtml: joinLink('Join the meeting', 'انضم إلى الاجتماع').en,
    }),
    htmlAr: clearNotice({
      heading: 'الاجتماع بدأ',
      greeting: DEAR_AR,
      lead: 'بدأ الاجتماع ويمكنك الانضمام الآن.',
      details: [['الاجتماع', '{{title}}']],
      actionHtml: joinLink('Join the meeting', 'انضم إلى الاجتماع').ar,
    }),
    smsEn: '{{schoolName}}: "{{title}}" is live. {{joinUrl}}',
    smsAr: '{{schoolName}}: "{{title}}" بدأ. {{joinUrl}}',
  },
  'activity.scheduled': {
    htmlEn: clearNotice({
      heading: 'New activity',
      greeting: DEAR_EN,
      lead: 'A new activity has been added to the calendar.',
      details: [
        ['Activity', '{{title}}'],
        ['When', '{{date}}{{location}}'],
      ],
      follow: 'Please note the date and place above.',
    }),
    htmlAr: clearNotice({
      heading: 'نشاط جديد',
      greeting: DEAR_AR,
      lead: 'أُضيف نشاط جديد إلى التقويم.',
      details: [
        ['النشاط', '{{title}}'],
        ['الموعد', '{{date}}{{location}}'],
      ],
      follow: 'يرجى ملاحظة التاريخ والمكان أعلاه.',
    }),
    smsEn: '{{schoolName}}: activity "{{title}}" on {{date}}.',
    smsAr: '{{schoolName}}: نشاط "{{title}}" بتاريخ {{date}}.',
  },
  'activity.updated': {
    htmlEn: clearNotice({
      heading: 'Activity updated',
      greeting: DEAR_EN,
      lead: 'An activity was changed. Use the new details below and ignore the earlier time or place.',
      details: [
        ['Activity', '{{title}}'],
        ['New time', '{{date}}{{location}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'تحديث نشاط',
      greeting: DEAR_AR,
      lead: 'تم تغيير نشاط. اعتمد التفاصيل الجديدة أدناه وتجاهل الموعد أو المكان السابق.',
      details: [
        ['النشاط', '{{title}}'],
        ['الموعد الجديد', '{{date}}{{location}}'],
      ],
    }),
    smsEn: '{{schoolName}}: activity "{{title}}" updated ({{date}}).',
    smsAr: '{{schoolName}}: تم تحديث النشاط "{{title}}" ({{date}}).',
  },
  'activity.withdrawn': {
    htmlEn: clearNotice({
      heading: 'Activity cancelled',
      greeting: DEAR_EN,
      lead: 'This activity will not take place. Please ignore the earlier invitation.',
      details: [
        ['Activity', '{{title}}'],
        ['Was scheduled', '{{date}}{{location}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'إلغاء نشاط',
      greeting: DEAR_AR,
      lead: 'لن يُقام هذا النشاط. يرجى تجاهل الدعوة السابقة.',
      details: [
        ['النشاط', '{{title}}'],
        ['كان مقرراً', '{{date}}{{location}}'],
      ],
    }),
    smsEn: '{{schoolName}}: activity "{{title}}" on {{date}} has been withdrawn.',
    smsAr: '{{schoolName}}: تم إلغاء النشاط "{{title}}" بتاريخ {{date}}.',
  },
  'payment.offline_submitted': {
    htmlEn: clearNotice({
      heading: 'Receipt to review',
      lead: 'A parent submitted a payment receipt. It is waiting in Pending receipts.',
      details: [
        ['Student', '{{studentName}}'],
        ['Amount', '{{amount}} {{currency}}'],
      ],
      follow: 'Open Pending receipts to accept or reject it.',
    }),
    htmlAr: clearNotice({
      heading: 'إيصال بانتظار المراجعة',
      lead: 'رفع ولي أمر إيصال دفع. الإيصال في قائمة الإيصالات المعلقة.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
      ],
      follow: 'افتح الإيصالات المعلقة لقبوله أو رفضه.',
    }),
    smsEn: '{{schoolName}}: new receipt for {{studentName}}: {{amount}} {{currency}}. Review pending receipts.',
    smsAr: '{{schoolName}}: إيصال جديد لـ {{studentName}}: {{amount}} {{currency}}. راجع الإيصالات المعلقة.',
  },
  'payment.rejected': {
    htmlEn: clearNotice({
      heading: 'Receipt not accepted',
      greeting: DEAR_EN,
      lead: 'The payment receipt was not accepted. The amount is still due until a new receipt is approved.',
      details: [
        ['Student', '{{studentName}}'],
        ['Amount', '{{amount}} {{currency}}'],
      ],
      follow: '{{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'لم يُقبل الإيصال',
      greeting: DEAR_AR,
      lead: 'لم يُقبل إيصال الدفع. يبقى المبلغ مستحقاً إلى أن يُعتمد إيصال جديد.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
      ],
      follow: '{{notes}}',
    }),
    smsEn: '{{schoolName}}: receipt for {{studentName}} ({{amount}} {{currency}}) was not accepted.',
    smsAr: '{{schoolName}}: لم يُقبل إيصال {{studentName}} ({{amount}} {{currency}}).',
  },
  'payment.approved_pending': {
    htmlEn: clearNotice({
      heading: 'Receipt approved',
      lead: 'A payment receipt was approved and is waiting to be transferred to the school.',
      details: [
        ['Student', '{{studentName}}'],
        ['Amount', '{{amount}} {{currency}}'],
      ],
      follow: 'No further action is needed until the transfer is sent.',
    }),
    htmlAr: clearNotice({
      heading: 'تم اعتماد الإيصال',
      lead: 'تم اعتماد إيصال دفع وهو بانتظار التحويل إلى المدرسة.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
      ],
      follow: 'لا يلزم إجراء آخر إلى أن يُرسل التحويل.',
    }),
    smsEn: '{{schoolName}}: receipt approved for {{studentName}} ({{amount}} {{currency}}), waiting for transfer.',
    smsAr: '{{schoolName}}: تم اعتماد إيصال {{studentName}} ({{amount}} {{currency}}) وبانتظار التحويل.',
  },
  'payment.installment_due': {
    htmlEn: clearNotice({
      heading: 'Installment due',
      greeting: DEAR_EN,
      lead: 'An installment is due. Please pay it by the date below.',
      details: [
        ['Student', '{{studentName}}'],
        ['Due date', '{{date}}'],
        ['Amount due', '{{amount}} {{currency}}'],
        ['Installment', '{{notes}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'قسط مستحق',
      greeting: DEAR_AR,
      lead: 'يوجد قسط مستحق. يرجى سداده في التاريخ أدناه.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['تاريخ الاستحقاق', '{{date}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
        ['القسط', '{{notes}}'],
      ],
    }),
    smsEn: '{{schoolName}}: installment for {{studentName}} is due on {{date}} ({{amount}} {{currency}}).',
    smsAr: '{{schoolName}}: قسط {{studentName}} مستحق بتاريخ {{date}} ({{amount}} {{currency}}).',
  },
  'payment.installment_late': {
    htmlEn: clearNotice({
      heading: 'Installment overdue',
      greeting: DEAR_EN,
      lead: 'An installment is past its due date and is still unpaid.',
      details: [
        ['Student', '{{studentName}}'],
        ['Was due', '{{date}}'],
        ['Amount still due', '{{amount}} {{currency}}'],
        ['Installment', '{{notes}}'],
      ],
      follow: 'Please arrange payment with the school office.',
    }),
    htmlAr: clearNotice({
      heading: 'قسط متأخر',
      greeting: DEAR_AR,
      lead: 'تجاوز قسط تاريخ استحقاقه وما زال غير مسدّد.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['كان مستحقاً', '{{date}}'],
        ['المبلغ المتبقي', '{{amount}} {{currency}}'],
        ['القسط', '{{notes}}'],
      ],
      follow: 'يرجى ترتيب السداد مع إدارة المدرسة.',
    }),
    smsEn: '{{schoolName}}: overdue installment for {{studentName}} ({{amount}} {{currency}}), due {{date}}.',
    smsAr: '{{schoolName}}: قسط متأخر لـ {{studentName}} ({{amount}} {{currency}}) كان مستحقاً {{date}}.',
  },
  'payment.receipt': {
    htmlEn: clearNotice({
      heading: 'Payment received',
      greeting: DEAR_EN,
      lead: 'We recorded a payment. This message is your record of it.',
      details: [
        ['Student', '{{studentName}}'],
        ['Amount', '{{amount}} {{currency}}'],
        ['Date', '{{date}}'],
        ['Remarks', '{{remarks}}'],
      ],
      follow: 'Contact the school office if any of these details look wrong.',
    }),
    htmlAr: clearNotice({
      heading: 'تم استلام الدفعة',
      greeting: DEAR_AR,
      lead: 'تم تسجيل دفعة. هذه الرسالة سجل لها.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
        ['التاريخ', '{{date}}'],
        ['ملاحظات', '{{remarks}}'],
      ],
      follow: 'تواصل مع إدارة المدرسة إذا بدا أي تفصيل غير صحيح.',
    }),
  },
  'transfer.rejected': {
    htmlEn: clearNotice({
      heading: 'Transfer rejected',
      lead: 'The school rejected this fee transfer. The amount was not accepted.',
      details: [
        ['Reference', '{{reference}}'],
        ['Amount', '{{amount}} {{currency}}'],
      ],
      follow: '{{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'رُفض التحويل',
      lead: 'رفضت المدرسة تحويل الرسوم هذا. لم يُقبل المبلغ.',
      details: [
        ['المرجع', '{{reference}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
      ],
      follow: '{{notes}}',
    }),
    smsEn: '{{schoolName}}: transfer {{reference}} ({{amount}} {{currency}}) was rejected.',
    smsAr: '{{schoolName}}: رُفض التحويل {{reference}} ({{amount}} {{currency}}).',
  },
  'transfer.pending_school': {
    htmlEn: clearNotice({
      heading: 'Transfer to confirm',
      lead: 'A fee transfer is waiting for the school to confirm it.',
      details: [
        ['Reference', '{{reference}}'],
        ['Amount', '{{amount}} {{currency}}'],
      ],
      follow: 'Open transfers in the school office to confirm or reject it.',
    }),
    htmlAr: clearNotice({
      heading: 'تحويل بانتظار التأكيد',
      lead: 'يوجد تحويل رسوم بانتظار تأكيد المدرسة.',
      details: [
        ['المرجع', '{{reference}}'],
        ['المبلغ', '{{amount}} {{currency}}'],
      ],
      follow: 'افتح التحويلات في إدارة المدرسة لتأكيده أو رفضه.',
    }),
    smsEn: '{{schoolName}}: transfer to confirm {{reference}} ({{amount}} {{currency}}).',
    smsAr: '{{schoolName}}: تحويل للتأكيد {{reference}} ({{amount}} {{currency}}).',
  },
  'auth.account_created': {
    htmlEn: clearNotice({
      heading: 'Your account is ready',
      greeting: DEAR_EN,
      lead: 'An account was created for you. Sign in with the email and temporary password below, then change the password.',
      details: [
        ['School', '{{schoolName}}'],
        ['Email', '{{email}}'],
        ['Temporary password', '{{tempPassword}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'حسابك جاهز',
      greeting: DEAR_AR,
      lead: 'تم إنشاء حساب لك. سجّل الدخول بالبريد وكلمة المرور المؤقتة أدناه، ثم غيّر كلمة المرور.',
      details: [
        ['المدرسة', '{{schoolName}}'],
        ['البريد', '{{email}}'],
        ['كلمة المرور المؤقتة', '{{tempPassword}}'],
      ],
    }),
    smsEn: '{{schoolName}}: account ready. Sign in with {{email}} / {{tempPassword}} and change the password.',
    smsAr: '{{schoolName}}: حسابك جاهز. ادخل بـ {{email}} / {{tempPassword}} ثم غيّر كلمة المرور.',
  },
  'auth.password_reset': {
    htmlEn: clearNotice({
      heading: 'Reset your password',
      greeting: DEAR_EN,
      lead: 'Use the button below to choose a new password. This link expires in one hour.',
      follow: 'Your current password stays the same until you use the link.',
      actionHtml: resetLink().en,
    }),
    htmlAr: clearNotice({
      heading: 'إعادة تعيين كلمة المرور',
      greeting: DEAR_AR,
      lead: 'استخدم الزر أدناه لاختيار كلمة مرور جديدة. ينتهي الرابط خلال ساعة.',
      follow: 'تبقى كلمة المرور الحالية كما هي إلى أن تستخدم الرابط.',
      actionHtml: resetLink().ar,
    }),
    smsEn: '{{schoolName}}: reset your password (link expires in one hour) {{resetUrl}}',
    smsAr: '{{schoolName}}: إعادة تعيين كلمة المرور (الرابط ينتهي خلال ساعة) {{resetUrl}}',
  },
  'grade.marks_updated': {
    htmlEn: clearNotice({
      heading: 'Grades updated',
      greeting: DEAR_EN,
      lead: 'Marks were saved. Sign in to see the updated grades.',
      details: [
        ['Student', '{{studentName}}'],
        ['Course', '{{courseName}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'تحديث الدرجات',
      greeting: DEAR_AR,
      lead: 'تم حفظ الدرجات. سجّل الدخول لرؤية الدرجات المحدّثة.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المقرر', '{{courseName}}'],
      ],
    }),
    smsEn: '{{schoolName}}: grades updated for {{studentName}} ({{courseName}}).',
    smsAr: '{{schoolName}}: تم تحديث درجات {{studentName}} ({{courseName}}).',
  },
  'progress.updated': {
    htmlEn: clearNotice({
      heading: 'Progress update',
      greeting: DEAR_EN,
      lead: 'Student progress was saved for the course below.',
      details: [
        ['Student', '{{studentName}}'],
        ['Course', '{{courseName}}'],
        ['Status', '{{status}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'تحديث التقدم',
      greeting: DEAR_AR,
      lead: 'تم حفظ تقدم الطالب في المقرر أدناه.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المقرر', '{{courseName}}'],
        ['الحالة', '{{status}}'],
      ],
    }),
    smsEn: '{{schoolName}}: progress updated for {{studentName}} ({{courseName}}).',
    smsAr: '{{schoolName}}: تم تحديث تقدم {{studentName}} ({{courseName}}).',
  },
  'course.material_uploaded': {
    htmlEn: clearNotice({
      heading: 'New course material',
      greeting: DEAR_EN,
      lead: 'A teacher added material you can open from the course.',
      details: [
        ['Material', '{{title}}'],
        ['Course', '{{courseName}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'مادة جديدة',
      greeting: DEAR_AR,
      lead: 'أضاف المعلم مادة يمكن فتحها من المقرر.',
      details: [
        ['المادة', '{{title}}'],
        ['المقرر', '{{courseName}}'],
      ],
    }),
    smsEn: '{{schoolName}}: new material "{{title}}" in {{courseName}}.',
    smsAr: '{{schoolName}}: مادة جديدة "{{title}}" في {{courseName}}.',
  },
  'session.completed': {
    htmlEn: clearNotice({
      heading: 'Session completed',
      greeting: DEAR_EN,
      lead: 'A class session was marked complete.',
      details: [
        ['Session', '{{title}}'],
        ['Course', '{{courseName}}'],
      ],
      follow: '{{notes}}',
    }),
    htmlAr: clearNotice({
      heading: 'اكتملت الحصة',
      greeting: DEAR_AR,
      lead: 'تم تعليم حصة كمكتملة.',
      details: [
        ['الحصة', '{{title}}'],
        ['المقرر', '{{courseName}}'],
      ],
      follow: '{{notes}}',
    }),
    smsEn: '{{schoolName}}: session "{{title}}" in {{courseName}} was completed.',
    smsAr: '{{schoolName}}: اكتملت الحصة "{{title}}" في {{courseName}}.',
  },
  'session.media_uploaded': {
    htmlEn: clearNotice({
      heading: 'New session media',
      greeting: DEAR_EN,
      lead: 'Photos or files were added to a class session.',
      details: [
        ['File', '{{title}}'],
        ['Course', '{{courseName}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'وسائط حصة جديدة',
      greeting: DEAR_AR,
      lead: 'أُضيفت صور أو ملفات إلى حصة.',
      details: [
        ['الملف', '{{title}}'],
        ['المقرر', '{{courseName}}'],
      ],
    }),
    smsEn: '{{schoolName}}: new session media in {{courseName}} ({{title}}).',
    smsAr: '{{schoolName}}: وسائط جديدة في {{courseName}} ({{title}}).',
  },
  'bus.boarded': {
    htmlEn: clearNotice({
      heading: 'Boarded the bus',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> got on the bus.',
      details: [
        ['Student', '{{studentName}}'],
        ['Date', '{{date}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'صعود الحافلة',
      greeting: DEAR_AR,
      lead: 'صعد <strong>{{studentName}}</strong> إلى الحافلة.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['التاريخ', '{{date}}'],
      ],
    }),
    smsEn: '{{schoolName}}: {{studentName}} boarded the bus on {{date}}.',
    smsAr: '{{schoolName}}: صعد {{studentName}} إلى الحافلة بتاريخ {{date}}.',
  },
  'bus.dropped_off': {
    htmlEn: clearNotice({
      heading: 'Dropped off',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> was dropped off from the bus.',
      details: [
        ['Student', '{{studentName}}'],
        ['Date', '{{date}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'نزول من الحافلة',
      greeting: DEAR_AR,
      lead: 'نزل <strong>{{studentName}}</strong> من الحافلة.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['التاريخ', '{{date}}'],
      ],
    }),
    smsEn: '{{schoolName}}: {{studentName}} was dropped off on {{date}}.',
    smsAr: '{{schoolName}}: نزل {{studentName}} من الحافلة بتاريخ {{date}}.',
  },
  'bus.approaching': {
    htmlEn: clearNotice({
      heading: 'Bus is nearby',
      greeting: DEAR_EN,
      lead: 'The bus is about to arrive. Please be ready at the stop.',
      details: [
        ['Student', '{{studentName}}'],
        ['Arriving in', '{{etaMinutes}} minutes'],
        ['Bus', '{{busTitle}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'الحافلة قريبة',
      greeting: DEAR_AR,
      lead: 'الحافلة على وشك الوصول. يرجى الاستعداد عند الموقف.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['الوصول خلال', '{{etaMinutes}} دقائق'],
        ['الحافلة', '{{busTitle}}'],
      ],
    }),
    smsEn: '{{schoolName}}: {{studentName}} — bus {{busTitle}} is about {{etaMinutes}} min away.',
    smsAr: '{{schoolName}}: {{studentName}} — حافلة {{busTitle}} خلال {{etaMinutes}} دقائق.',
  },
  'online.class_invited': {
    htmlEn: clearNotice({
      heading: 'Online class',
      greeting: DEAR_EN,
      lead: 'This class will be held online at the usual session time. Use the button to join when it starts.',
      details: [
        ['Course', '{{courseName}}'],
        ['Class', '{{groupName}}'],
        ['Date', '{{dateEn}}'],
        ['Time', '{{startTime}} – {{endTime}}'],
      ],
      actionHtml: joinLink('Join the class', 'انضم إلى الحصة').en,
    }),
    htmlAr: clearNotice({
      heading: 'حصة عن بُعد',
      greeting: DEAR_AR,
      lead: 'ستُقام هذه الحصة عن بُعد في موعدها المعتاد. استخدم الزر للانضمام عند البداية.',
      details: [
        ['المقرر', '{{courseName}}'],
        ['الصف', '{{groupName}}'],
        ['التاريخ', '{{dateAr}}'],
        ['الوقت', '{{startTime}} – {{endTime}}'],
      ],
      actionHtml: joinLink('Join the class', 'انضم إلى الحصة').ar,
    }),
  },
  'online.class_started': {
    htmlEn: clearNotice({
      heading: 'Class is live',
      greeting: DEAR_EN,
      lead: 'The online class has started. Join now with the button below.',
      details: [
        ['Course', '{{courseName}}'],
        ['Class', '{{groupName}}'],
        ['Date', '{{date}}'],
      ],
      actionHtml: joinLink('Join the class', 'انضم إلى الحصة').en,
    }),
    htmlAr: clearNotice({
      heading: 'الحصة بدأت',
      greeting: DEAR_AR,
      lead: 'بدأت الحصة الإلكترونية. انضم الآن من الزر أدناه.',
      details: [
        ['المقرر', '{{courseName}}'],
        ['الصف', '{{groupName}}'],
        ['التاريخ', '{{date}}'],
      ],
      actionHtml: joinLink('Join the class', 'انضم إلى الحصة').ar,
    }),
    smsEn: '{{schoolName}}: {{courseName}} ({{groupName}}) is live. {{joinUrl}}',
    smsAr: '{{schoolName}}: بدأت حصة {{courseName}} ({{groupName}}). {{joinUrl}}',
  },
  'online.session_missed': {
    htmlEn: clearNotice({
      heading: 'Missed online class',
      greeting: DEAR_EN,
      lead: '<strong>{{studentName}}</strong> did not attend an online class.',
      details: [
        ['Student', '{{studentName}}'],
        ['Course', '{{courseName}}'],
        ['Date', '{{date}}'],
      ],
      follow: 'Contact the school if the student should have been marked present.',
    }),
    htmlAr: clearNotice({
      heading: 'غياب عن حصة إلكترونية',
      greeting: DEAR_AR,
      lead: 'لم يحضر <strong>{{studentName}}</strong> حصة إلكترونية.',
      details: [
        ['الطالب', '{{studentName}}'],
        ['المقرر', '{{courseName}}'],
        ['التاريخ', '{{date}}'],
      ],
      follow: 'تواصل مع المدرسة إذا كان يجب تسجيل الطالب حاضراً.',
    }),
    smsEn: '{{schoolName}}: {{studentName}} missed {{courseName}} on {{date}}.',
    smsAr: '{{schoolName}}: غياب {{studentName}} عن {{courseName}} بتاريخ {{date}}.',
  },
  'schedule.cancelled': {
    htmlEn: clearNotice({
      heading: 'Class cancelled',
      greeting: DEAR_EN,
      lead: 'A scheduled class will not be held. Please do not attend at the usual time.',
      details: [
        ['Course', '{{courseName}}'],
        ['Day', '{{title}}'],
        ['Time', '{{date}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'إلغاء حصة',
      greeting: DEAR_AR,
      lead: 'لن تُقام حصة مجدولة. يرجى عدم الحضور في الموعد المعتاد.',
      details: [
        ['المقرر', '{{courseName}}'],
        ['اليوم', '{{title}}'],
        ['الوقت', '{{date}}'],
      ],
    }),
    smsEn: '{{schoolName}}: {{courseName}} on {{title}} ({{date}}) was cancelled.',
    smsAr: '{{schoolName}}: أُلغيت حصة {{courseName}} يوم {{title}} ({{date}}).',
  },
  'letter.approval_reminder': {
    htmlEn: clearNotice({
      heading: 'Please answer this letter',
      greeting: DEAR_EN,
      lead: 'A letter is still waiting for your answer. Approve or reject it with the buttons below.',
      details: [['Letter', '{{title}}']],
      actionHtml: approvalLinks().en,
    }),
    htmlAr: clearNotice({
      heading: 'يرجى الرد على الرسالة',
      greeting: DEAR_AR,
      lead: 'ما زالت رسالة بانتظار ردك. وافق أو ارفض من الزرين أدناه.',
      details: [['الرسالة', '{{title}}']],
      actionHtml: approvalLinks().ar,
    }),
    smsEn: '{{schoolName}}: please answer "{{title}}". {{actionUrl}}',
    smsAr: '{{schoolName}}: يرجى الرد على "{{title}}". {{actionUrl}}',
  },
  'letter.approval_resolved': {
    htmlEn: clearNotice({
      heading: 'Letter answered',
      lead: 'A parent answered an approval letter. The decision is recorded on the letter.',
      details: [
        ['Parent', '{{recipientName}}'],
        ['Letter', '{{title}}'],
        ['Decision', '{{decision}}'],
      ],
    }),
    htmlAr: clearNotice({
      heading: 'تم الرد على الرسالة',
      lead: 'رد ولي أمر على رسالة موافقة. القرار مسجّل على الرسالة.',
      details: [
        ['ولي الأمر', '{{recipientName}}'],
        ['الرسالة', '{{title}}'],
        ['القرار', '{{decision}}'],
      ],
    }),
    smsEn: '{{schoolName}}: {{recipientName}} {{decision}} "{{title}}".',
    smsAr: '{{schoolName}}: {{recipientName}} {{decision}} "{{title}}".',
  },
  'chat.direct_message': {
    htmlEn: clearNotice({
      heading: 'New message',
      lead: '<strong>{{senderName}}</strong> sent you a message.',
      follow: '{{preview}}',
    }),
    htmlAr: clearNotice({
      heading: 'رسالة جديدة',
      lead: 'أرسل <strong>{{senderName}}</strong> رسالة.',
      follow: '{{preview}}',
    }),
    smsEn: '{{senderName}}: {{preview}}',
    smsAr: '{{senderName}}: {{preview}}',
  },
  'chat.group_message': {
    htmlEn: clearNotice({
      heading: 'New group message',
      lead: '<strong>{{senderName}}</strong> posted in <strong>{{title}}</strong>.',
      follow: '{{preview}}',
    }),
    htmlAr: clearNotice({
      heading: 'رسالة في المجموعة',
      lead: 'كتب <strong>{{senderName}}</strong> في <strong>{{title}}</strong>.',
      follow: '{{preview}}',
    }),
    smsEn: '{{title}} — {{senderName}}: {{preview}}',
    smsAr: '{{title}} — {{senderName}}: {{preview}}',
  },
};
