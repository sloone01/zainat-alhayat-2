/**
 * Visual email-layout builder: generates HTML shells with {{content}} /
 * branding placeholders, and round-trips config via an HTML comment marker.
 */

export type LayoutBuilderStyle = 'simple' | 'branded' | 'formal'

export interface LayoutBuilderConfig {
  v: 1
  style: LayoutBuilderStyle
  primaryColor: string
  showLogo: boolean
  showSchoolName: boolean
  subtitleEn: string
  subtitleAr: string
  useBrandingFooter: boolean
  footerEn: string
  footerAr: string
  bannerUrl: string
}

export const LAYOUT_BUILDER_STYLES: LayoutBuilderStyle[] = ['simple', 'branded', 'formal']

const MARKER_RE = /<!--\s*fikr-nl-v1:([A-Za-z0-9+/=_-]+)\s*-->/

export function defaultLayoutBuilderConfig(): LayoutBuilderConfig {
  return {
    v: 1,
    style: 'branded',
    primaryColor: '#00A19B',
    showLogo: true,
    showSchoolName: true,
    subtitleEn: 'School notification',
    subtitleAr: 'إشعار من المدرسة',
    useBrandingFooter: true,
    footerEn: '',
    footerAr: '',
    bannerUrl: '',
  }
}

export function encodeLayoutBuilderConfig(config: LayoutBuilderConfig): string {
  const json = JSON.stringify(config)
  return typeof btoa === 'function'
    ? btoa(unescape(encodeURIComponent(json)))
    : Buffer.from(json, 'utf8').toString('base64')
}

export function decodeLayoutBuilderConfig(encoded: string): LayoutBuilderConfig | null {
  try {
    const json =
      typeof atob === 'function'
        ? decodeURIComponent(escape(atob(encoded)))
        : Buffer.from(encoded, 'base64').toString('utf8')
    const raw = JSON.parse(json) as Partial<LayoutBuilderConfig>
    if (raw?.v !== 1) return null
    const base = defaultLayoutBuilderConfig()
    return {
      ...base,
      ...raw,
      v: 1,
      style: LAYOUT_BUILDER_STYLES.includes(raw.style as LayoutBuilderStyle)
        ? (raw.style as LayoutBuilderStyle)
        : base.style,
      primaryColor: typeof raw.primaryColor === 'string' && raw.primaryColor ? raw.primaryColor : base.primaryColor,
    }
  } catch {
    return null
  }
}

export function parseLayoutBuilderConfig(html: string): LayoutBuilderConfig | null {
  const m = (html || '').match(MARKER_RE)
  if (!m?.[1]) return null
  return decodeLayoutBuilderConfig(m[1])
}

export function stripLayoutBuilderMarker(html: string): string {
  return (html || '').replace(MARKER_RE, '').trim()
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function normalizeHex(color: string): string {
  const c = (color || '').trim()
  if (/^#[0-9a-fA-F]{6}$/.test(c)) return c
  if (/^#[0-9a-fA-F]{3}$/.test(c)) {
    return `#${c[1]}${c[1]}${c[2]}${c[2]}${c[3]}${c[3]}`
  }
  return '#00A19B'
}

function footerInner(config: LayoutBuilderConfig, locale: 'en' | 'ar'): string {
  if (config.useBrandingFooter) return '{{footerText}}'
  const custom = locale === 'ar' ? config.footerAr : config.footerEn
  return escapeHtml(custom.trim())
}

function headerBits(config: LayoutBuilderConfig, locale: 'en' | 'ar'): string {
  const parts: string[] = []
  if (config.showLogo) parts.push('{{schoolLogoHtml}}')
  if (config.showSchoolName) {
    parts.push('<div style="font-size:18px;font-weight:700;line-height:1.3;">{{schoolName}}</div>')
  }
  const subtitle = (locale === 'ar' ? config.subtitleAr : config.subtitleEn).trim()
  if (subtitle) {
    parts.push(
      `<div style="font-size:13px;opacity:.92;margin-top:4px;line-height:1.4;">${escapeHtml(subtitle)}</div>`,
    )
  }
  return parts.join('\n      ')
}

function bannerBlock(config: LayoutBuilderConfig): string {
  const url = config.bannerUrl.trim()
  if (!url) return ''
  return `<img src="${escapeHtml(url)}" alt="" width="560" style="display:block;width:100%;max-width:560px;height:auto;border:0;" />`
}

function buildCard(config: LayoutBuilderConfig, locale: 'en' | 'ar'): string {
  const color = normalizeHex(config.primaryColor)
  const header = headerBits(config, locale)
  const footer = footerInner(config, locale)
  const banner = bannerBlock(config)
  const dir = locale === 'ar' ? 'rtl' : 'ltr'
  const align = locale === 'ar' ? 'right' : 'left'
  const card = 'max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);'
  const body = `padding:16px 20px;font-size:15px;line-height:1.55;color:#111827;text-align:${align};direction:${dir};`
  const foot = `padding:12px 20px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;line-height:1.5;text-align:${align};`

  if (config.style === 'simple') {
    return `<div class="nt-email-card" dir="${dir}" style="${card}">
    <div style="height:4px;background:${color};"></div>
    ${banner}
    <div style="padding:16px 20px 8px;">
      ${header}
    </div>
    <div class="nt-email-body" dir="${dir}" style="${body}">
      {{content}}
    </div>
    <div style="${foot}">
      ${footer}
    </div>
  </div>`
  }

  if (config.style === 'formal') {
    return `<div class="nt-email-card" dir="${dir}" style="${card};border:1px solid #e5e7eb;border-radius:4px;box-shadow:none;">
    ${banner}
    <div style="padding:20px 24px 12px;border-bottom:2px solid ${color};text-align:center;">
      ${header}
    </div>
    <div class="nt-email-body" dir="${dir}" style="${body};padding:20px 24px;">
      {{content}}
    </div>
    <div style="${foot};text-align:center;background:#fafafa;">
      ${footer}
    </div>
  </div>`
  }

  // branded (default)
  return `<div class="nt-email-card" dir="${dir}" style="${card}">
    <div style="padding:16px 20px;background:${color};color:#ffffff;">
      ${header}
    </div>
    ${banner}
    <div class="nt-email-body" dir="${dir}" style="${body}">
      {{content}}
    </div>
    <div style="${foot}">
      ${footer}
    </div>
  </div>`
}

export function buildLayoutHtml(config: LayoutBuilderConfig, locale: 'en' | 'ar'): string {
  const isAr = locale === 'ar'
  const lang = isAr ? 'ar' : 'en'
  const dir = isAr ? 'rtl' : 'ltr'
  const align = isAr ? 'right' : 'left'
  const shell =
    `margin:0;padding:12px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,Tahoma,sans-serif;color:#111827;text-align:${align};direction:${dir};`
  const marker = `<!--fikr-nl-v1:${encodeLayoutBuilderConfig(config)}-->`
  const title = escapeHtml(
    (isAr ? config.subtitleAr : config.subtitleEn).trim() || (isAr ? 'إشعار' : 'Notification'),
  )
  return `${marker}
<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${title}</title>
</head>
<body style="${shell}">
  ${buildCard(config, locale)}
</body>
</html>`
}

export function applyBuilderToHtmlPair(config: LayoutBuilderConfig): { html_en: string; html_ar: string } {
  return {
    html_en: buildLayoutHtml(config, 'en'),
    html_ar: buildLayoutHtml(config, 'ar'),
  }
}
