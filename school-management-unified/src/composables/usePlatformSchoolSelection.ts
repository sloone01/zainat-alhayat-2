/** Session key for platform school registration details (ID never in the URL). */
const STORAGE_KEY = 'platform.selectedSchoolId'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function setSelectedPlatformSchoolId(id: string) {
  const value = String(id || '').trim()
  if (!UUID_RE.test(value)) return
  try {
    sessionStorage.setItem(STORAGE_KEY, value)
  } catch {
    /* ignore quota / private mode */
  }
}

export function getSelectedPlatformSchoolId(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw || !UUID_RE.test(raw)) return null
    return raw
  } catch {
    return null
  }
}

export function clearSelectedPlatformSchoolId() {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

/** Prefer history.state, then sessionStorage. */
export function resolveSelectedPlatformSchoolId(historyState?: unknown): string | null {
  const fromState = String((historyState as { schoolId?: unknown } | null)?.schoolId || '').trim()
  if (UUID_RE.test(fromState)) {
    setSelectedPlatformSchoolId(fromState)
    return fromState
  }
  return getSelectedPlatformSchoolId()
}
