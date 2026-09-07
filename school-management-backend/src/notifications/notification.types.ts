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
  schoolId: number | null;
  templateKey: string;
  locale?: NotificationLocale;
  variables: Record<string, string>;
  recipients: NotifyRecipient[];
  /** Force channels; otherwise derived from the template `channel` plus push when a userId exists. */
  channels?: NotificationChannel[];
};

/** Pre-rendered send (message letters). Same channels as template notify. */
export type NotifyContentRequest = {
  schoolId: number | null;
  locale?: NotificationLocale;
  subject: string;
  bodyHtml: string;
  bodySms?: string | null;
  recipients: NotifyRecipient[];
  channels: NotificationChannel[];
};

export type NotifyResult = {
  emailSent: number;
  smsSent: number;
  pushQueued: number;
  skipped: number;
  errors: string[];
};
