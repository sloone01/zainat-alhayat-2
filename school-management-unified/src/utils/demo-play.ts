import { authService } from '@/services'
import { getStoredToken, isTokenExpired } from '@/utils/auth-token'
import type { DemoAudience } from '@/demo/types'

export function isDemoPlay(search = typeof window === 'undefined' ? '' : window.location.search): boolean {
  try {
    return new URLSearchParams(search).get('demo') === 'play'
  } catch {
    return false
  }
}

export function demoPersonaFromQuery(
  query: Record<string, unknown> | URLSearchParams | undefined,
): DemoAudience {
  const raw =
    query instanceof URLSearchParams
      ? query.get('persona')
      : query && typeof query === 'object'
        ? String((query as { persona?: unknown }).persona || '')
        : ''
  return raw === 'parents' ? 'parents' : 'staff'
}

export function withDemoQuery(path: string, audience: DemoAudience): string {
  const url = new URL(path, 'http://local.invalid')
  url.searchParams.set('demo', 'play')
  url.searchParams.set('persona', audience)
  return `${url.pathname}${url.search}`
}

export function demoAddressBar(path: string): string {
  const url = new URL(path, 'http://local.invalid')
  return `fikr.om${url.pathname}`
}

let inflight: Promise<boolean> | null = null

export async function ensureDemoSession(audience: DemoAudience): Promise<boolean> {
  if (!isDemoPlay()) return false
  const token = getStoredToken()
  if (token && !isTokenExpired(token)) return true
  if (!inflight) {
    inflight = authService
      .startDemoSession(audience)
      .then(() => true)
      .catch(() => false)
      .finally(() => {
        inflight = null
      })
  }
  return inflight
}
