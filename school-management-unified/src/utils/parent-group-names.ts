/** API used to hardcode English when a student had no group. */
const NO_GROUP_SENTINEL = 'No group assigned'

export function formatParentGroupNames(
  names: string | null | undefined,
  fallback: string,
): string {
  const raw = (names || '').trim()
  if (!raw || raw === NO_GROUP_SENTINEL) return fallback
  return raw
}
