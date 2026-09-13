import { clearStoredAuth } from '@/utils/auth-token'
import { ref } from 'vue'

export const UNAUTHORIZED_PATH = '/unauthorized'
export const SYSTEM_ERROR_PATH = '/error'

const LAST_ERROR_KEY = 'fikr_last_error_ticket'

/** Routes that must never bounce to login / status pages. */
const PUBLIC_PATHS = [
  '/',
  '/login',
  '/subscribe',
  '/custom-plan',
  '/student-enrollment',
  '/for-schools',
  '/s/',
  '/letter-approval',
]

export function isPublicAppPath(pathname: string): boolean {
  return (
    PUBLIC_PATHS.includes(pathname) ||
    pathname.startsWith('/s/') ||
    pathname.startsWith('/letter-approval') ||
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

export const systemErrorTicket = ref<string | null>(null)

let errorNavAt = 0

/**
 * Open `/error` inside the app router (DashboardLayout nav/header stay).
 * Public marketing/signup pages stay on-page and must not bounce here.
 */
export function showSystemErrorOverlay(ticket?: string | null): void {
  if (typeof window === 'undefined') return
  const path = window.location.pathname
  if (isPublicAppPath(path) && path !== SYSTEM_ERROR_PATH) return

  if (ticket) {
    rememberErrorTicket(ticket)
    systemErrorTicket.value = ticket.trim()
  } else {
    systemErrorTicket.value = readRememberedErrorTicket()
  }

  if (path === SYSTEM_ERROR_PATH) return

  const now = Date.now()
  if (now - errorNavAt < 1500) return
  errorNavAt = now

  const query = systemErrorTicket.value ? { ticket: systemErrorTicket.value } : {}
  void import('@/router').then(({ default: router }) => {
    if (router.currentRoute.value.path === SYSTEM_ERROR_PATH) return
    void router.push({ path: SYSTEM_ERROR_PATH, query })
  })
}

export function dismissSystemErrorOverlay(): void {
  /* navigation away from `/error` is enough */
}

/** @deprecated Prefer showSystemErrorOverlay — kept name for call sites. */
export function goToSystemErrorPage(ticket?: string | null): void {
  showSystemErrorOverlay(ticket)
}
