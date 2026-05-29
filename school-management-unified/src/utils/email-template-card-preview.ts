/**
 * In-app preview (chat, approvals view): show only the branded `.nt-email-card`
 * (pink/purple header). Full document shell and SMS are for outbound email only.
 */
export function buildEmailCardPreviewSrcdoc(
  fullHtml: string,
  locale: 'en' | 'ar' = 'en',
): string {
  const trimmed = (fullHtml || '').trim()
  if (!trimmed) return ''

  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const lang = locale

  let cardHtml = ''
  try {
    const doc = new DOMParser().parseFromString(trimmed, 'text/html')
    const card = doc.querySelector('.nt-email-card')
    if (card) {
      cardHtml = card.outerHTML
    } else if (!trimmed.includes('<html')) {
      cardHtml = trimmed
    } else {
      const body = doc.body
      cardHtml = body?.innerHTML?.trim() || trimmed
    }
  } catch {
    cardHtml = trimmed
  }

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>body{margin:0;padding:0;background:transparent;}</style>
</head>
<body>${cardHtml}</body>
</html>`
}
