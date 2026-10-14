/** Locale-aware school title: English UI prefers name_en, Arabic prefers name_ar. */
export function schoolDisplayName(
  school: {
    name?: string | null
    name_ar?: string | null
    name_en?: string | null
  } | null | undefined,
  locale: string,
): string {
  if (!school) return ''
  const ar = (school.name_ar || '').trim()
  const en = (school.name_en || '').trim()
  const fallback = (school.name || '').trim()
  if (locale === 'ar') return ar || fallback || en
  return en || fallback || ar
}
