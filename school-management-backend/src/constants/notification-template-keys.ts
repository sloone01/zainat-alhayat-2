/** Keys stored in `notification_template_definition` / `school_notification_template`. */
export const NOTIFICATION_TEMPLATE_KEYS = {
  /** Email + SMS after a student payment is recorded (hook wired later). */
  PAYMENT_RECEIPT: 'payment.receipt',
} as const;

export type NotificationTemplateKey =
  (typeof NOTIFICATION_TEMPLATE_KEYS)[keyof typeof NOTIFICATION_TEMPLATE_KEYS];
