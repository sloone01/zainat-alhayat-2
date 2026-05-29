/** Matches backend `MESSAGE_LETTER_SYSTEM_SENDER` — localized in the UI. */
export const MESSAGE_LETTER_SYSTEM_SENDER = '__system_admin__'

export function isMessageLetterSystemSender(name: string | null | undefined): boolean {
  return name === MESSAGE_LETTER_SYSTEM_SENDER
}

export function translateMessageLetterSender(
  name: string,
  t: (key: string) => string,
): string {
  return isMessageLetterSystemSender(name) ? t('messageLetters.systemAdminSender') : name
}
