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
  if (runtime) return rewriteLocalhostForAndroidEmulator(runtime)
  const built = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'
  return rewriteLocalhostForAndroidEmulator(built)
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
  return base.replace(/\/api\/?$/, '')
}
