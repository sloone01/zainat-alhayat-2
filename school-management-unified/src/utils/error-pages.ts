import { clearStoredAuth } from '@/utils/auth-token'

export const UNAUTHORIZED_PATH = '/unauthorized'
export const SYSTEM_ERROR_PATH = '/error'

const LAST_ERROR_KEY = 'fikr_last_error_ticket'

/** Routes that must never bounce to login / status pages. */
const PUBLIC_PATHS = ['/', '/login', '/subscribe', '/student-enrollment', '/for-schools', '/s/']

export function isPublicAppPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/s/') ||
    pathname === UNAUTHORIZED_PATH ||
    pathname === SYSTEM_ERROR_PATH
  )
}

export function isAuthCredentialUrl(url?: string): boolean {
  if (!url) return false
  return (
    url.includes('/auth/login') ||
    url.includes('/auth/refresh') ||
    url.includes('/auth/reset-password')
  )
}

export function rememberErrorTicket(ticket: string | null | undefined): void {
  if (!ticket) return
  try {
    sessionStorage.setItem(LAST_ERROR_KEY, ticket)
  } catch {
    /* ignore */
  }
}

export function readRememberedErrorTicket(): string | null {
  try {
    return sessionStorage.getItem(LAST_ERROR_KEY)
  } catch {
    return null
  }
}

export function goToUnauthorizedPage(): void {
  clearStoredAuth()
  if (typeof window === 'undefined') return
  if (window.location.pathname === UNAUTHORIZED_PATH) return
  window.location.assign(UNAUTHORIZED_PATH)
}

export function goToSystemErrorPage(ticket?: string | null): void {
  if (typeof window === 'undefined') return
  rememberErrorTicket(ticket)
  const q = ticket ? `?ticket=${encodeURIComponent(ticket)}` : ''
  const target = `${SYSTEM_ERROR_PATH}${q}`
  if (window.location.pathname === SYSTEM_ERROR_PATH) {
    // Already on the error page (e.g. router sent us here without a ticket).
    // Update the URL so the ticket shows without a full reload.
    if (ticket && window.location.search !== q) {
      window.history.replaceState(window.history.state, '', target)
      window.dispatchEvent(new CustomEvent('fikr-error-ticket', { detail: { ticket } }))
    }
    return
  }
  window.location.assign(target)
}
