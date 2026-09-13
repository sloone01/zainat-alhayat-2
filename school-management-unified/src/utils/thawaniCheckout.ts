import { getApiBaseUrl } from '@/config/public-config'

export type CheckoutOutcome = 'success' | 'cancel' | 'closed'

export function checkoutReturnUrls() {
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  return {
    success: `${origin}/pay-return.html?status=success`,
    cancel: `${origin}/pay-return.html?status=cancel`,
  }
}

/** Open the popup synchronously (before any await) so browsers do not block it. */
export function openCheckoutPopup(): Window | null {
  if (typeof window === 'undefined') return null
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

export function mediaUrl(path: string | null | undefined): string {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) return path
  const api = getApiBaseUrl()
  const origin = api.replace(/\/api\/?$/, '')
  return path.startsWith('/') ? `${origin}${path}` : `${origin}/${path}`
}
