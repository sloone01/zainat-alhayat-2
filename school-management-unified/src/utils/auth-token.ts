const TOKEN_KEY = 'auth_token'
const USER_KEY = 'user_data'

/** Refresh a still-valid token this many seconds before `exp`. */
export const TOKEN_REFRESH_WITHIN_SECONDS = 15 * 60

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function getStoredUserJson(): string | null {
  try {
    return localStorage.getItem(USER_KEY)
  } catch {
    return null
  }
}

export function setStoredAuth(token: string, user?: unknown): void {
  localStorage.setItem(TOKEN_KEY, token)
  if (user != null) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
  }
}

export function clearStoredAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
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
