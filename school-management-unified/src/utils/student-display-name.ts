/**
 * Short student display name: first + second + family (no third).
 * Prefer locale when both AR/EN parts exist; skip empty segments.
 */
export type StudentNameParts = {
  firstName?: string | null
  secondName?: string | null
  lastName?: string | null
  first_name_ar?: string | null
  first_name_en?: string | null
  secondNameEn?: string | null
  last_name_ar?: string | null
  last_name_en?: string | null
}

function pick(
  preferAr: boolean,
  ar?: string | null,
  en?: string | null,
  legacy?: string | null,
): string {
  const a = (ar ?? '').trim()
  const e = (en ?? '').trim()
  const l = (legacy ?? '').trim()
  if (preferAr) return a || e || l
  return e || a || l
}

export function formatStudentDisplayName(
  student: StudentNameParts | null | undefined,
  locale: string = 'ar',
): string {
  if (!student) return ''
  const preferAr = !String(locale).toLowerCase().startsWith('en')
  const first = pick(preferAr, student.first_name_ar, student.first_name_en, student.firstName)
  const second = pick(preferAr, student.secondName, student.secondNameEn, null)
  const family = pick(preferAr, student.last_name_ar, student.last_name_en, student.lastName)
  return [first, second, family].filter(Boolean).join(' ')
}

export function studentDisplayInitials(
  student: StudentNameParts | null | undefined,
  locale: string = 'ar',
): string {
  const name = formatStudentDisplayName(student, locale)
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return `${parts[0].charAt(0)}${parts[parts.length - 1].charAt(0)}`.toUpperCase()
}
