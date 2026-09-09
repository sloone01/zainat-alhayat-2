/** Keys stored in `notification_template_definitions` / `school_notification_templates`. */
export const NOTIFICATION_TEMPLATE_KEYS = {
  PAYMENT_RECEIPT: 'payment.receipt',
  PAYMENT_OFFLINE_SUBMITTED: 'payment.offline_submitted',
  PAYMENT_REJECTED: 'payment.rejected',
  PAYMENT_APPROVED_PENDING: 'payment.approved_pending',
  PAYMENT_INSTALLMENT_DUE: 'payment.installment_due',
  PAYMENT_INSTALLMENT_LATE: 'payment.installment_late',
  TRANSFER_PENDING_SCHOOL: 'transfer.pending_school',
  TRANSFER_REJECTED: 'transfer.rejected',
  ENROLLMENT_SUBMITTED: 'enrollment.submitted',
  ENROLLMENT_ACCEPTED: 'enrollment.accepted',
  ENROLLMENT_REJECTED: 'enrollment.rejected',
  AUTH_PASSWORD_RESET: 'auth.password_reset',
  AUTH_ACCOUNT_CREATED: 'auth.account_created',
  ATTENDANCE_ABSENT: 'attendance.absent',
  ATTENDANCE_LATE: 'attendance.late',
  ATTENDANCE_PRESENT: 'attendance.present',
  MEETING_SCHEDULED: 'meeting.scheduled',
  ACTIVITY_SCHEDULED: 'activity.scheduled',
  ACTIVITY_UPDATED: 'activity.updated',
  LETTER_APPROVAL_RESOLVED: 'letter.approval_resolved',
  LETTER_APPROVAL_REMINDER: 'letter.approval_reminder',
  CHAT_DIRECT_MESSAGE: 'chat.direct_message',
  CHAT_GROUP_MESSAGE: 'chat.group_message',
  GRADE_MARKS_UPDATED: 'grade.marks_updated',
  PROGRESS_UPDATED: 'progress.updated',
  COURSE_MATERIAL_UPLOADED: 'course.material_uploaded',
  SESSION_COMPLETED: 'session.completed',
  SESSION_MEDIA_UPLOADED: 'session.media_uploaded',
  BUS_BOARDED: 'bus.boarded',
  BUS_DROPPED_OFF: 'bus.dropped_off',
  ONLINE_CLASS_STARTED: 'online.class_started',
  ONLINE_SESSION_MISSED: 'online.session_missed',
  SCHEDULE_CANCELLED: 'schedule.cancelled',
  PLATFORM_SCHOOL_APPROVED: 'platform.school_approved',
  PLATFORM_SCHOOL_REJECTED: 'platform.school_rejected',
  PLATFORM_SCHOOL_SUSPENDED: 'platform.school_suspended',
  PLATFORM_SCHOOL_REGISTERED: 'platform.school_registered',
  /** Confirmation to the school owner after /subscribe signup (pending review). */
  PLATFORM_SCHOOL_REGISTRATION_RECEIVED: 'platform.school_registration_received',
  PLATFORM_SIGNUP_EMAIL_OTP: 'platform.signup_email_otp',
  PLATFORM_INVOICE_ISSUED: 'platform.invoice_issued',
  PLATFORM_INVOICE_PAID: 'platform.invoice_paid',
} as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATE_KEYS)[keyof typeof NOTIFICATION_TEMPLATE_KEYS];

export function isSystemNotificationTemplateKey(key: string): boolean {
  return key.startsWith('platform.');
}
