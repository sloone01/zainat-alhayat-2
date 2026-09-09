import { Capacitor } from '@capacitor/core'

/**
 * True only inside a Capacitor Android/iOS shell.
 * Browser web builds always return false — no bottom bar / native chrome on web.
 *
 * Optional local override for device-layout QA in a browser:
 *   localStorage.setItem('fikr_native_shell', '1')
 * Clear with removeItem. Never set by the app itself.
 */
export function isNativeApp(): boolean {
  try {
    if (typeof window !== 'undefined') {
      const override = window.localStorage?.getItem('fikr_native_shell')
      if (override === '1' || override === 'true') return true
    }
  } catch {
    /* ignore storage errors */
  }
  return Capacitor.isNativePlatform()
}

/** Fullscreen flows where the tab bar would collide with composers / video. */
export function shouldHideMobileBottomNav(path: string): boolean {
  if (/^\/chat\/[^/]+/.test(path)) return true
  if (/^\/messages\/[^/]+/.test(path)) return true
  if (path.startsWith('/meeting-room/')) return true
  return false
}
