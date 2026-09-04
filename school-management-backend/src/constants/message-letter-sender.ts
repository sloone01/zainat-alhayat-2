/** Sentinel returned as senderName / sender_name for official message letters (localized on the client). */
export const MESSAGE_LETTER_SYSTEM_SENDER = '__system_admin__';

export function isMessageLetterMetadata(
  metadata: Record<string, unknown> | null | undefined,
): boolean {
  return metadata?.['kind'] === 'message_letter';
}

export function messageLetterSenderName(
  metadata: Record<string, unknown> | null | undefined,
  fallback: string,
): string {
  return isMessageLetterMetadata(metadata) ? MESSAGE_LETTER_SYSTEM_SENDER : fallback;
}
