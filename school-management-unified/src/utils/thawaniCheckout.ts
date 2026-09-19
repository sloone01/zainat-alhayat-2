import { Capacitor } from '@capacitor/core'
import { getApiBaseUrl } from '@/config/public-config'

export type CheckoutOutcome = 'success' | 'cancel' | 'closed'

export function isNativeCheckout(): boolean {
  return Capacitor.isNativePlatform()
}

export function checkoutReturnUrls() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    success: `${origin}/pay-return.html?status=success`,
    cancel: `${origin}/pay-return.html?status=cancel`,
  }
}

export function checkoutOutcomeFromUrl(url: string): CheckoutOutcome | null {
  try {
    const parsed = new URL(url)
    const status = parsed.searchParams.get('status')
    if (parsed.pathname.includes('pay-return.html') || status) {
      if (status === 'success') return 'success'
      if (status === 'cancel' || status === 'cancelled') return 'cancel'
    }
  } catch {
    if (/[?&]status=success\b/.test(url)) return 'success'
    if (/[?&]status=cancel/.test(url)) return 'cancel'
  }
  return null
}

/** Open the popup synchronously (before any await) so browsers do not block it. */
export function openCheckoutPopup(): Window | null {
  if (typeof window === 'undefined' || isNativeCheckout()) return null
  const w = 480
  const h = 760
  const left = Math.max(0, (window.screen.width - w) / 2)
  const top = Math.max(0, (window.screen.height - h) / 2)
  const popup = window.open('', 'school-pay', `width=${w},height=${h},left=${left},top=${top}`)
  if (popup) {
    popup.document.write(
      '<body style="font-family:sans-serif;text-align:center;padding-top:40vh;color:#3f3f46">' +
        'جارٍ فتح صفحة الدفع… <br/> Opening secure checkout…</body>',
    )
  }
  return popup
}

export function watchCheckoutPopup(popup: Window, onDone: (outcome: CheckoutOutcome) => void) {
  let settled = false
  const finish = (outcome: CheckoutOutcome) => {
    if (settled) return
    settled = true
    window.removeEventListener('message', onMsg)
    clearInterval(iv)
    try {
      if (!popup.closed) popup.close()
    } catch {
      /* COOP may block */
    }
    onDone(outcome)
  }
  const onMsg = (e: MessageEvent) => {
    const d = e.data as { source?: string; status?: string } | undefined
    if (e.origin !== window.location.origin || d?.source !== 'school-pay') return
    finish(d.status === 'success' ? 'success' : 'cancel')
  }
  const iv = setInterval(() => {
    try {
      if (popup.closed) finish('closed')
    } catch {
      /* keep polling until message or timeout handled by caller */
    }
  }, 600)
  window.addEventListener('message', onMsg)
}

/** Native in-app WebView — same popup sheet as Homefix / DarCare. */
export async function openNativeCheckout(
  url: string,
  title: string,
  onDone: (outcome: CheckoutOutcome) => void,
): Promise<void> {
  const { BackgroundColor, InAppBrowser, ToolBarType } = await import('@capgo/inappbrowser')
  let settled = false
  const handles: Array<{ remove: () => Promise<void> }> = []
  const finish = async (outcome: CheckoutOutcome) => {
    if (settled) return
    settled = true
    await Promise.all(handles.map((h) => h.remove().catch(() => undefined)))
    try {
      await InAppBrowser.close()
    } catch {
      /* already closed */
    }
    onDone(outcome)
  }
  handles.push(
    await InAppBrowser.addListener('urlChangeEvent', (event) => {
      const outcome = checkoutOutcomeFromUrl(event.url)
      if (outcome) void finish(outcome)
    }),
  )
  handles.push(
    await InAppBrowser.addListener('closeEvent', () => {
      void finish('closed')
    }),
  )
  await InAppBrowser.openWebView({
    url,
    title,
    toolbarType: ToolBarType.COMPACT,
    backgroundColor: BackgroundColor.WHITE,
  })
}

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const api = getApiBaseUrl()
  const origin = api.replace(/\/api\/?$/, '')
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`
}
