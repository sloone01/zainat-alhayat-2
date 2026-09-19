export type NotificationLocale = 'en' | 'ar';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'push';

export type NotifyRecipient = {
  email?: string | null;
  phone?: string | null;
  userId?: string | null;
  name?: string | null;
  locale?: NotificationLocale;
};

export type NotifyRequest = {
  schoolId: string | null;
  templateKey: string;
  locale?: NotificationLocale;
  variables: Record<string, string>;
  recipients: NotifyRecipient[];
  /** Force channels; otherwise derived from the template `channel` plus push when a userId exists. */
  channels?: NotificationChannel[];
  /** Extra FCM data payload keys (all values must be strings). */
  pushData?: Record<string, string>;
  /** Optional email attachments (e.g. payment receipt file). */
  attachments?: Array<{
    filename: string;
    path?: string;
    content?: Buffer | string;
    contentType?: string;
    cid?: string;
    contentDisposition?: 'inline' | 'attachment';
  }>;
};

/** Pre-rendered send (message letters). Same channels as template notify. */
export type NotifyContentRequest = {
  schoolId: string | null;
  locale?: NotificationLocale;
  subject: string;
  bodyHtml: string;
  bodySms?: string | null;
  recipients: NotifyRecipient[];
  channels: NotificationChannel[];
  pushData?: Record<string, string>;
  attachments?: NotifyRequest['attachments'];
};

export type NotifyResult = {
  emailSent: number;
  smsSent: number;
  whatsappSent: number;
  pushQueued: number;
  skipped: number;
  errors: string[];
};
