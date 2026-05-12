/**
 * Teams-like relative labels with explicit local time (Today, Yesterday, weekday, or date + time).
 */
export function pad2(n: number): string {
  return String(n).padStart(2, '0')
}

/** Value for `<input type="datetime-local" step="60">` from a `Date` in local timezone. */
export function toDatetimeLocalValue(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(d.getHours())}:${pad2(d.getMinutes())}`
}

/** Default “next hour on the clock” for new meeting forms. */
export function defaultScheduledDatetimeLocal(): string {
  const d = new Date()
  d.setSeconds(0, 0)
  d.setMinutes(0)
  d.setHours(d.getHours() + 1)
  return toDatetimeLocalValue(d)
}

export function formatTeamsLikeDateTime(
  iso: string | undefined,
  localeApp: string,
  t: (key: string) => string,
): string {
  if (!iso) return ''
  let d: Date
  try {
    d = new Date(iso)
    if (Number.isNaN(d.getTime())) return iso
  } catch {
    return iso
  }

  const loc = localeApp === 'ar' ? 'ar-SA' : 'en-US'
  const now = new Date()
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate())
  const diffDays = Math.round((startOf(now).getTime() - startOf(d).getTime()) / 86400000)

  const timePart = new Intl.DateTimeFormat(loc, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)

  if (diffDays === 0) {
    return `${t('meetingRooms.dateToday')}, ${timePart}`
  }
  if (diffDays === 1) {
    return `${t('meetingRooms.dateYesterday')}, ${timePart}`
  }
  if (diffDays >= 2 && diffDays <= 6) {
    const weekday = new Intl.DateTimeFormat(loc, { weekday: 'long' }).format(d)
    return `${weekday}, ${timePart}`
  }

  const dateOpts: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric',
  }
  if (d.getFullYear() !== now.getFullYear()) {
    dateOpts.year = 'numeric'
  }
  const datePart = new Intl.DateTimeFormat(loc, dateOpts).format(d)
  return `${datePart}, ${timePart}`
}

/** Full weekday + calendar date + time for “create room” context (Teams-style). */
export function formatFullLocalDateTime(d: Date, localeApp: string): string {
  const loc = localeApp === 'ar' ? 'ar-SA' : 'en-US'
  return new Intl.DateTimeFormat(loc, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d)
}
