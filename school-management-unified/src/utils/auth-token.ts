const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'

/** Refresh a still-valid token this many seconds before `exp`. */
export const TOKEN_REFRESH_WITHIN_SECONDS = 15 * 60

function isDemoPlayWindow(): boolean {
  if (typeof window === 'undefined') return false
  try {
    return new URLSearchParams(window.location.search).get('demo') === 'play'
  } catch {
    return false
  }
}

function authStore(): Storage {
  return isDemoPlayWindow() ? sessionStorage : localStorage
}

export function getStoredToken(): string | null {
  try {
    return authStore().getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUserJson(): string | null {
  try {
    return authStore().getItem(USER_KEY)
  } catch {
    return null
  }
}

const SCHOOL_ID_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isSchoolIdUuid(value: unknown): value is string {
  if (value == null) return false
  const id = String(value).trim()
  return SCHOOL_ID_UUID.test(id)
}

function schoolIdFromUnknown(value: unknown): string | undefined {
  if (value == null) return undefined
  const id = String(value).trim()
  return isSchoolIdUuid(id) ? id : undefined
}

/** JWT / stored user school id. Never coerce with Number() (UUIDs become NaN). */
export type SessionPersona = 'parent' | 'student' | 'platform' | 'staff'

/**
 * Active persona from the JWT first (source of truth), then `user_data`.
 * Stale localStorage role must not keep a school admin menu on a platform/parent token.
 */
export function getSessionPersona(): SessionPersona | null {
  if (!getStoredToken()) return null
  let payload: Record<string, unknown> | null = null
  let stored: {
    role?: string
    user_type?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
    school_id?: unknown
  } | null = null
  try {
    payload = decodeJwtPayload(getStoredToken() || '')
  } catch {
    payload = null
  }
  try {
    const raw = getStoredUserJson()
    stored = raw ? (JSON.parse(raw) as typeof stored) : null
  } catch {
    stored = null
  }
  const role = String(payload?.role ?? stored?.role ?? '')
  const userType = String(payload?.user_type ?? stored?.user_type ?? '')
  if (role === 'parent' || userType === 'parent') return 'parent'
  if (role === 'student' || userType === 'student') return 'student'
  const platform =
    payload?.is_super_admin === true ||
    payload?.is_system_user === true ||
    userType === 'platform' ||
    stored?.isSuperAdmin === true ||
    stored?.isSystemUser === true
  if (platform) return 'platform'
  return 'staff'
}

export function sessionHomePath(persona = getSessionPersona()): string {
  if (persona === 'parent') return '/parent/dashboard'
  if (persona === 'platform') return '/platform/schools'
  if (persona === 'student') return '/dashboard'
  return '/dashboard'
}

export function getStoredSchoolId(): string | undefined {
  try {
    const raw = authStore().getItem(USER_KEY)
    if (raw) {
      const u = JSON.parse(raw) as { school_id?: string | number | null }
      const fromUser = schoolIdFromUnknown(u?.school_id)
      if (fromUser) return fromUser
    }
  } catch {
    /* fall through to JWT */
  }
  const token = getStoredToken()
  if (!token) return undefined
  const payload = decodeJwtPayload(token)
  return schoolIdFromUnknown(payload?.school_id)
}

export function setStoredAuth(token: string, user?: unknown): void {
  const store = authStore()
  store.setItem(TOKEN_KEY, token)
  if (user != null) {
    store.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearStoredAuth(): void {
  const store = authStore()
  store.removeItem(TOKEN_KEY)
  store.removeItem(USER_KEY)
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const part = token.split('.')[1]
    if (!part) return null
    const padded = part.replace(/-/g, '+').replace(/_/g, '/')
    const json = atob(padded)
    return JSON.parse(json) as Record<string, unknown>
  } catch {
    return null
  }
}

/** Seconds until JWT `exp`. Negative if already expired. Null if unreadable. */
export function tokenSecondsRemaining(token: string | null | undefined): number | null {
  if (!token) return null
  const payload = decodeJwtPayload(token)
  if (typeof payload?.exp !== 'number') return null
  return payload.exp - Date.now() / 1000
}

export function isTokenExpired(
  token: string | null | undefined,
  skewSeconds = 30,
): boolean {
  const remaining = tokenSecondsRemaining(token)
  if (remaining == null) return true
  return remaining <= skewSeconds
}

export function isTokenExpiringSoon(
  token: string | null | undefined,
  withinSeconds = TOKEN_REFRESH_WITHIN_SECONDS,
): boolean {
  const remaining = tokenSecondsRemaining(token)
  if (remaining == null) return false
  return remaining > 0 && remaining <= withinSeconds
}
