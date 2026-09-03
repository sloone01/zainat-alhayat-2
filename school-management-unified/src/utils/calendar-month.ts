/** Calendar month name in the active UI locale (1 = January … 12 = December). */
export function localizedMonthName(monthNumber: number, locale: string): string {
  const n = Math.trunc(Number(monthNumber))
  if (n < 1 || n > 12) return ''
  const date = new Date(2000, n - 1, 1)
  const tag = locale === 'ar' ? 'ar-OM' : 'en-US'
  try {
    return new Intl.DateTimeFormat(tag, { month: 'long' }).format(date)
  } catch {
    return String(n)
  }
}

export function isMonthNumberValid(monthNumber: number | null | undefined): boolean {
  const n = Number(monthNumber)
  return Number.isFinite(n) && n >= 1 && n <= 12
}

/** True when label is empty or matches the localized month name for that month. */
export function isAutoMonthLabel(
  monthNumber: number | null | undefined,
  label: string | null | undefined,
  locale: string,
): boolean {
  if (!isMonthNumberValid(monthNumber)) return !label?.trim()
  const trimmed = (label ?? '').trim()
  if (!trimmed) return true
  return trimmed === localizedMonthName(Number(monthNumber), locale)
}
