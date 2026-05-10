/**
 * API base URL for production Docker / Railway.
 * - Runtime: window.__APP_CONFIG__.API_BASE_URL (written by docker-entrypoint.sh from Railway env)
 * - Build-time: import.meta.env.VITE_API_BASE_URL
 * - Dev: Vite proxy + localhost fallback
 */
declare global {
  interface Window {
    __APP_CONFIG__?: { API_BASE_URL?: string }
  }
}

export function getApiBaseUrl(): string {
  const runtime = typeof window !== 'undefined' ? window.__APP_CONFIG__?.API_BASE_URL?.trim() : ''
  if (runtime) return runtime
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'
}

/** Socket.IO origin: same host as API without trailing /api */
export function getSocketBaseUrl(): string {
  if (import.meta.env.DEV && typeof window !== 'undefined') {
    return window.location.origin
  }
  const base = getApiBaseUrl()
  return base.replace(/\/api\/?$/, '')
}
