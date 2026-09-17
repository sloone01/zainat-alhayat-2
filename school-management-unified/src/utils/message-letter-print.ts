/** A4 print CSS injected into the letter/email template document. */
const PRINT_CSS = `@page{size:A4;margin:12mm;}
html,body{margin:0!important;background:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;}
img{max-width:100%;height:auto;}`

/** Keep the school notification layout / letter card, and make the document A4. */
export function wrapMessageLetterPrintSrcdoc(html: string, locale: 'en' | 'ar'): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const lang = locale === 'ar' ? 'ar' : 'en'
  const trimmed = (html || '').trim()
  const styleTag = `<style>${PRINT_CSS}</style>`
  if (!trimmed) {
    return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"/>${styleTag}</head><body dir="${dir}"></body></html>`
  }
  if (/<html[\s>]/i.test(trimmed)) {
    if (/<head[\s>]/i.test(trimmed)) {
      return trimmed.replace(/<head([^>]*)>/i, `<head$1>${styleTag}`)
    }
    return trimmed.replace(/<html([^>]*)>/i, `<html$1><head><meta charset="utf-8"/>${styleTag}</head>`)
  }
  return `<!DOCTYPE html><html lang="${lang}" dir="${dir}"><head><meta charset="utf-8"/>${styleTag}</head><body dir="${dir}">${trimmed}</body></html>`
}
