/** Matches backend `MESSAGE_LETTER_SYSTEM_SENDER` — never show this token in the UI. */
export const MESSAGE_LETTER_SYSTEM_SENDER = '__system_admin__'

export function isMessageLetterSystemSender(name: string | null | undefined): boolean {
  return Boolean(name && name.includes(MESSAGE_LETTER_SYSTEM_SENDER))
}

export function scrubMessageLetterSystemSender(text: string | null | undefined): string {
  if (!text) return ''
  return text.split(MESSAGE_LETTER_SYSTEM_SENDER).join('').replace(/\s{2,}/g, ' ').trim()
}

export function translateMessageLetterSender(
  name: string,
  t: (key: string) => string,
): string {
  if (!name) return ''
  if (name.trim() === MESSAGE_LETTER_SYSTEM_SENDER) return ''
  return scrubMessageLetterSystemSender(name)
}
