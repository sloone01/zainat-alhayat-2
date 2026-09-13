export type NotificationLocale = 'en' | 'ar';

export type NotificationChannel = 'email' | 'sms' | 'push';

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
  attachments?: NotifyRequest['attachments'];
};

export type NotifyResult = {
  emailSent: number;
  smsSent: number;
  pushQueued: number;
  skipped: number;
  errors: string[];
};
