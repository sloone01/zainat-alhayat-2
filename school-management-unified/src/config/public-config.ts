/**
 * API base URL for production Docker / Railway.
 * - Runtime: window.__APP_CONFIG__.API_BASE_URL (written by docker-entrypoint.sh from Railway env)
 * - Build-time: import.meta.env.VITE_API_BASE_URL
 * - Dev: Vite proxy + localhost fallback
 * - Capacitor Android emulator: localhost → 10.0.2.2 (host machine loopback)
 */
import { Capacitor } from '@capacitor/core'

declare global {
  interface Window {
    __APP_CONFIG__?: { API_BASE_URL?: string }
  }
}

function rewriteLocalhostForAndroidEmulator(url: string): string {
  try {
    if (!Capacitor.isNativePlatform() || Capacitor.getPlatform() !== 'android') return url
  } catch {
    return url
  }
  // Physical devices need your LAN IP in VITE_API_BASE_URL — only rewrite loopback.
  return url.replace(/:\/\/(localhost|127\.0\.0\.1)(?=[:/]|$)/g, '://10.0.2.2')
}

export function getApiBaseUrl(): string {
  const runtime = typeof window !== 'undefined' ? window.__APP_CONFIG__?.API_BASE_URL?.trim() : ''
  const built = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:3002/api'
  let url = rewriteLocalhostForAndroidEmulator(runtime || built)
  // Dev browsers often resolve `localhost` → IPv6 (::1) first; Nest typically binds IPv4 only,
  // which surfaces as Axios "Network Error" on pages like /roles/:id.
  if (import.meta.env.DEV) {
    url = url.replace(/:\/\/localhost(?=[:/]|$)/gi, '://127.0.0.1')
  }
  return url
}

/** True when the API base is a same-origin path ("/api") rather than an absolute URL. */
function isRelativeApiBase(url: string): boolean {
  return !/^[a-z][a-z0-9+.-]*:\/\//i.test(url)
}

/** Socket.IO origin: same host as API without trailing /api */
export function getSocketBaseUrl(): string {
  try {
    if (Capacitor.isNativePlatform()) {
      return getApiBaseUrl().replace(/\/api\/?$/, '')
    }
  } catch {
    /* fall through */
  }
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin
  }
  const base = getApiBaseUrl()
  // Same-origin deploys advertise API_BASE_URL "/api" (the SPA container proxies /api
  // and /socket.io to the backend, so no CORS preflight is issued). Stripping the
  // suffix then leaves "", and socket.io-client resolves io("") to the host-less
  // "https://:443" instead of the page origin, so chat never connects.
  if (isRelativeApiBase(base)) {
    return typeof window !== 'undefined' ? window.location.origin : ''
  }
  return base.replace(/\/api\/?$/, '')
}
