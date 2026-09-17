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

/** Marks <html> so CSS can lock the shell and pad the notch (web layout unchanged). */
export function applyNativeShellClass() {
  if (typeof document === 'undefined' || !isNativeApp()) return
  document.documentElement.classList.add('fk-native')
  try {
    if (Capacitor.getPlatform() === 'android') {
      document.documentElement.classList.add('fk-native--android')
    }
  } catch {
    /* ignore */
  }
}

async function hideNativeStatusBar() {
  try {
    const { StatusBar } = await import('@capacitor/status-bar')
    try {
      await StatusBar.setOverlaysWebView({ overlay: true })
    } catch {
      /* iOS has no overlay API */
    }
    await StatusBar.hide()
  } catch {
    /* plugin missing until `npx cap sync` */
  }
}

/** Hide the system status bar and draw edge-to-edge inside the Capacitor shell. */
export async function applyNativeChrome() {
  applyNativeShellClass()
  if (!Capacitor.isNativePlatform()) return
  await hideNativeStatusBar()
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void hideNativeStatusBar()
  })
}

/** Marketing / school CMS landings — native shell opens login instead. */
export function isNativePublicLandingPath(path: string): boolean {
  if (path === '/' || path === '/for-schools' || path === '/brochure') return true
  return /^\/s\/[^/]+$/.test(path)
}

/** Fullscreen flows where the tab bar would collide with composers / video. */
export function shouldHideMobileBottomNav(path: string): boolean {
  if (/^\/chat\/[^/]+/.test(path)) return true
  if (/^\/messages\/[^/]+/.test(path)) return true
  if (path.startsWith('/meeting-room/')) return true
  return false
}
