export type SchoolNotificationBranding = {
  schoolName: string;
  schoolLogo: string;
  schoolLogoHtml: string;
  footerText: string;
};

/** FIKR logo palette (matches unified Tailwind primary/navy). */
export const FIKR_BRAND = {
  navy: '#0A2147',
  teal: '#00A19B',
  tealDark: '#00847f',
  tealSoft: '#e6f7f6',
  tealMid: '#8adfd9',
  shell: '#eef2f8',
  card: '#ffffff',
  ink: '#1d1d1f',
  muted: '#727784',
  hairline: '#e0e0e0',
} as const;

const CARD_STYLE = `max-width:560px;margin:0 auto;background:${FIKR_BRAND.card};border-radius:16px;overflow:hidden;box-shadow:0 8px 28px rgba(10,33,71,.10);border:1px solid ${FIKR_BRAND.hairline};`;

/** Light mint header — logo navy/teal reads clearly (not solid navy). */
const HEADER_STYLE = `padding:18px 20px 16px;background:linear-gradient(180deg,#ffffff 0%,${FIKR_BRAND.tealSoft} 100%);border-bottom:3px solid ${FIKR_BRAND.teal};color:${FIKR_BRAND.navy};`;

const BODY_STYLE = `padding:20px 20px 8px;color:${FIKR_BRAND.ink};font-size:15px;line-height:1.55;`;

const FOOTER_STYLE = `padding:14px 20px 18px;border-top:1px solid ${FIKR_BRAND.hairline};font-size:12px;color:${FIKR_BRAND.muted};background:#fafcfc;`;

const SHELL_EN = `margin:0;padding:16px 10px;background:${FIKR_BRAND.shell};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${FIKR_BRAND.ink};`;
const SHELL_AR = `margin:0;padding:16px 10px;background:${FIKR_BRAND.shell};font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:${FIKR_BRAND.ink};`;

export function absolutizePublicUrl(url: string, publicBase: string): string {
  const raw = url.trim();
  if (!raw) return '';
  if (/^(https?:|data:|cid:)/i.test(raw)) return raw;
  const base = publicBase.trim();
  if (!base) return raw;
  try {
    return new URL(raw, base.endsWith('/') ? base : `${base}/`).href;
  } catch {
    return raw;
  }
}

/** Wide wordmark-friendly logo (FIKR mark is not square). */
export function buildSchoolLogoHtml(logoUrl: string, schoolName: string): string {
  const src = logoUrl.trim();
  if (!src) return '';
  const alt = escapeHtmlAttr(schoolName || 'Logo');
  return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" width="200" height="56" style="display:block;max-height:56px;max-width:220px;width:auto;height:auto;margin:0 0 10px;border:0;outline:none;" />`;
}

export function brandingVariables(branding: SchoolNotificationBranding): Record<string, string> {
  return {
    schoolName: branding.schoolName,
    schoolLogo: branding.schoolLogo,
    schoolLogoHtml: branding.schoolLogoHtml,
    footerText: branding.footerText,
  };
}

export function platformBrandDisplayName(locale: 'en' | 'ar'): string {
  return locale === 'ar' ? 'فكر' : 'FIKR';
}

export function platformBrandSubtitle(locale: 'en' | 'ar'): string {
  return locale === 'ar' ? 'منصة المدارس الذكية' : 'Smart School Platform';
}

export function platformNotificationSubtitle(locale: 'en' | 'ar'): string {
  return locale === 'ar' ? 'إشعار من فكر' : 'FIKR notification';
}

export function platformFooterText(locale: 'en' | 'ar'): string {
  return locale === 'ar'
    ? 'فكر — منصة المدارس الذكية. للتواصل: hello@fikr.om'
    : 'FIKR — Smart School Platform. Contact: hello@fikr.om';
}

/** Relative path on the public web app (absolutized with PUBLIC_APP_URL). */
export const FIKR_LOGO_PUBLIC_PATH = '/fikr-logo.png?v=6';

/** Inject `{{schoolLogoHtml}}` above the school-name header if the card is missing it. */
export function injectSchoolLogoPlaceholder(html: string): string {
  if (!html || html.includes('{{schoolLogoHtml}}')) return html;
  return html.replace(
    /(<div[^>]*style="[^"]*font-size:18px;font-weight:700;[^"]*"[^>]*>\{\{\s*schoolName\s*\}\}<\/div>)/,
    '{{schoolLogoHtml}}\n      $1',
  );
}

export function emailHasSchoolCard(html: string): boolean {
  return /nt-email-card/i.test(html);
}

export function wrapEmailWithSchoolChrome(
  html: string,
  locale: 'en' | 'ar',
  subtitle: string,
): string {
  const raw = (html ?? '').trim();
  if (!raw) return raw;
  const withLogo = injectSchoolLogoPlaceholder(raw);
  if (emailHasSchoolCard(withLogo)) return withLogo;

  const inner = extractBodyInner(withLogo);
  const isAr = locale === 'ar';
  const card = `<div class="nt-email-card" style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      {{schoolLogoHtml}}
      <div style="font-size:18px;font-weight:700;color:${FIKR_BRAND.navy};">${'{{schoolName}}'}</div>
      <div style="font-size:13px;color:${FIKR_BRAND.teal};margin-top:4px;font-weight:600;">${escapeHtmlText(subtitle)}</div>
    </div>
    <div class="nt-email-body" style="${BODY_STYLE}">
      ${inner}
    </div>
  </div>`;

  if (/<html[\s>]/i.test(raw)) {
    return raw.replace(/<body[^>]*>[\s\S]*<\/body>/i, `<body style="${isAr ? SHELL_AR : SHELL_EN}">\n  ${card}\n</body>`);
  }

  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? ' dir="rtl"' : '';
  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${isAr ? SHELL_AR : SHELL_EN}">
  ${card}
</body>
</html>`;
}

/** Default editable layout shell for schools (logo + school name from branding vars). */
export function defaultNotificationLayoutHtml(locale: 'en' | 'ar'): string {
  const isAr = locale === 'ar';
  const subtitle = isAr ? 'إشعار من المدرسة' : 'School notification';
  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? ' dir="rtl"' : '';
  const shell = isAr ? SHELL_AR : SHELL_EN;
  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${shell}">
  <div class="nt-email-card" style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      {{schoolLogoHtml}}
      <div style="font-size:18px;font-weight:700;color:${FIKR_BRAND.navy};">{{schoolName}}</div>
      <div style="font-size:13px;color:${FIKR_BRAND.teal};margin-top:4px;font-weight:600;">${escapeHtmlText(subtitle)}</div>
    </div>
    <div class="nt-email-body" style="${BODY_STYLE}">
      {{content}}
    </div>
    <div style="${FOOTER_STYLE}">
      {{footerText}}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Platform / system email shell — FIKR wordmark + brand name (not {{schoolName}}),
 * so body copy can still use {{schoolName}} for the school being discussed.
 */
export function defaultPlatformNotificationLayoutHtml(locale: 'en' | 'ar'): string {
  const isAr = locale === 'ar';
  const brand = platformBrandDisplayName(locale);
  const tagline = platformBrandSubtitle(locale);
  const subtitle = platformNotificationSubtitle(locale);
  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? ' dir="rtl"' : '';
  const shell = isAr ? SHELL_AR : SHELL_EN;
  return `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${shell}">
  <div class="nt-email-card" style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      {{schoolLogoHtml}}
      <div style="font-size:20px;font-weight:800;letter-spacing:0.02em;color:${FIKR_BRAND.navy};">${escapeHtmlText(brand)}</div>
      <div style="font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;color:${FIKR_BRAND.teal};margin-top:2px;">${escapeHtmlText(tagline)}</div>
      <div style="height:2px;width:48px;background:${FIKR_BRAND.teal};margin-top:10px;border-radius:999px;"></div>
      <div style="font-size:13px;color:${FIKR_BRAND.muted};margin-top:8px;">${escapeHtmlText(subtitle)}</div>
    </div>
    <div class="nt-email-body" style="${BODY_STYLE}">
      {{content}}
    </div>
    <div style="${FOOTER_STYLE}">
      {{footerText}}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Inject template body into a layout shell at `{{content}}`.
 * If the body is already a full document / school card, returns body unchanged
 * (avoids double-wrapping legacy templates).
 */
export function applyEmailLayout(layoutHtml: string, bodyHtml: string): string {
  const layout = (layoutHtml ?? '').trim();
  const body = (bodyHtml ?? '').trim();
  if (!layout) return body;
  if (!body) return layout.replace(/\{\{\s*content\s*\}\}/gi, '');
  if (emailHasSchoolCard(body) || /<html[\s>]/i.test(body)) {
    return body;
  }
  const inner = extractBodyInner(body);
  if (!/\{\{\s*content\s*\}\}/i.test(layout)) {
    return `${layout}\n${inner}`;
  }
  return layout.replace(/\{\{\s*content\s*\}\}/gi, inner);
}

/** Shared inner HTML helpers for system template factory bodies. */
export function brandedParagraph(text: string): string {
  return `<p style="margin:0 0 14px;color:${FIKR_BRAND.ink};font-size:15px;line-height:1.55;">${text}</p>`;
}

export function brandedOtpBlock(codePlaceholder: string): string {
  return `<div style="margin:18px 0;padding:18px 16px;text-align:center;background:${FIKR_BRAND.tealSoft};border:1px solid ${FIKR_BRAND.tealMid};border-radius:12px;">
  <div style="font-size:28px;font-weight:800;letter-spacing:0.28em;color:${FIKR_BRAND.navy};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${codePlaceholder}</div>
</div>`;
}

export function brandedCallout(htmlInner: string): string {
  return `<div style="margin:16px 0;padding:14px 16px;background:${FIKR_BRAND.tealSoft};border-inline-start:4px solid ${FIKR_BRAND.teal};border-radius:8px;color:${FIKR_BRAND.navy};font-size:14px;line-height:1.5;">${htmlInner}</div>`;
}

function extractBodyInner(html: string): string {
  const m = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
  return (m ? m[1] : html).trim();
}

function escapeHtmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeHtmlText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
