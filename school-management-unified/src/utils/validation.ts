/** Shared form validators (return true when the value is acceptable). Empty values are the caller's job. */

const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/

export function isValidEmail(value: string | null | undefined): boolean {
  const v = String(value ?? '').trim()
  return v.length <= 255 && EMAIL_RE.test(v) && !v.includes('..')
}

/** Digits with an optional leading +; 7–15 digits (spaces and dashes are ignored). */
export function isValidPhone(value: string | null | undefined): boolean {
  const v = String(value ?? '').replace(/[\s-]/g, '')
  return /^\+?\d{7,15}$/.test(v)
}

/** Latin letters, spaces, apostrophes, dots and hyphens. */
export function isEnglishName(value: string | null | undefined): boolean {
  return /^[A-Za-z][A-Za-z\s'.-]*$/.test(String(value ?? '').trim())
}

/** Arabic letters and spaces only. */
export function isArabicName(value: string | null | undefined): boolean {
  return /^[؀-ۿ‌‍\s]+$/.test(String(value ?? '').trim())
}

/** Civil id / passport number: letters and digits only, no spaces or Arabic letters. */
export function isIdNumber(value: string | null | undefined): boolean {
  return /^[A-Za-z0-9-]{5,20}$/.test(String(value ?? '').trim())
}

export type ValidationKey =
  | 'validation.emailRequired'
  | 'validation.emailInvalid'
  | 'validation.phoneInvalid'
  | 'validation.englishOnly'
  | 'validation.arabicOnly'
  | 'validation.idInvalid'

export function emailError(value: string | null | undefined): ValidationKey | '' {
  const v = String(value ?? '').trim()
  if (!v) return 'validation.emailRequired'
  return isValidEmail(v) ? '' : 'validation.emailInvalid'
}
