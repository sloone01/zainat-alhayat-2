import type { NotificationLocale } from './notification.types';

/** Normalize any locale-like value to en|ar (default Arabic). */
export function normalizeNotificationLocale(
  value?: string | null,
  fallback: NotificationLocale = 'ar',
): NotificationLocale {
  const v = String(value ?? '')
    .trim()
    .toLowerCase();
  if (v === 'en' || v.startsWith('en-')) return 'en';
  if (v === 'ar' || v.startsWith('ar-')) return 'ar';
  return fallback;
}

/**
 * Resolve send locale for one recipient.
 * Order: explicit recipient.locale → user preferred_language → request fallback → ar.
 */
export function resolveRecipientLocale(input: {
  recipientLocale?: string | null;
  preferredLanguage?: string | null;
  requestLocale?: string | null;
}): NotificationLocale {
  if (input.recipientLocale === 'en' || input.recipientLocale === 'ar') {
    return input.recipientLocale;
  }
  if (input.preferredLanguage === 'en' || input.preferredLanguage === 'ar') {
    return input.preferredLanguage;
  }
  return normalizeNotificationLocale(input.requestLocale, 'ar');
}
