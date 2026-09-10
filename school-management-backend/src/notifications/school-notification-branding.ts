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

/** Full-width mint bar (not a white plate around the mark) so the navy/teal logo stays readable. */
const PLATFORM_HEADER_STYLE = `padding:12px 24px;background:${FIKR_BRAND.tealSoft};border-bottom:3px solid ${FIKR_BRAND.teal};`;

const PLATFORM_FOOTER_STYLE = `padding:14px 24px 16px;background:${FIKR_BRAND.navy};font-size:12px;line-height:1.5;color:${FIKR_BRAND.tealMid};`;

const PLATFORM_SHELL_EN = `margin:0;padding:0;width:100%;background:${FIKR_BRAND.card};font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:${FIKR_BRAND.ink};`;
const PLATFORM_SHELL_AR = `margin:0;padding:0;width:100%;background:${FIKR_BRAND.card};font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:${FIKR_BRAND.ink};`;

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
export function buildSchoolLogoHtml(
  logoUrl: string,
  schoolName: string,
  opts?: { compact?: boolean },
): string {
  const src = logoUrl.trim();
  if (!src) return '';
  const alt = escapeHtmlAttr(schoolName || 'Logo');
  const width = opts?.compact ? 64 : 160;
  const height = opts?.compact ? 36 : 48;
  return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" width="${width}" height="${height}" style="display:block;width:${width}px;height:${height}px;margin:0;border:0;outline:none;text-decoration:none;background:transparent;" />`;
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

/** API-hosted logo for preview and as a remote fallback. */
export const FIKR_LOGO_API_PATH = '/api/public/branding/fikr-logo.png';

/** Inline CID used when sending system emails (Gmail cannot load localhost images). */
export const FIKR_LOGO_CID = 'fikr-logo@fikr';
export const FIKR_LOGO_CID_SRC = `cid:${FIKR_LOGO_CID}`;

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
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const shell = isAr ? PLATFORM_SHELL_AR : PLATFORM_SHELL_EN;
  const titleBlock = `<div style="font-size:18px;line-height:1.2;font-weight:800;letter-spacing:0.02em;color:${FIKR_BRAND.navy};">${escapeHtmlText(brand)}</div>
              <div style="margin-top:3px;font-size:12px;line-height:1.3;font-weight:600;color:${FIKR_BRAND.tealDark};">${escapeHtmlText(tagline)}</div>`;
  // Title at the reading start, logo at the far end (not packed next to the words).
  // English LTR: title left, logo right. Arabic: title right, logo left.
  const headerInner = isAr
    ? `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" dir="ltr">
          <tr>
            <td valign="middle" align="left" width="70" style="width:70px;padding:0;">{{schoolLogoHtml}}</td>
            <td valign="middle" align="right" style="padding:0 8px;">${titleBlock}</td>
          </tr>
        </table>`
    : `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" dir="ltr">
          <tr>
            <td valign="middle" align="left" style="padding:0 8px 0 0;">${titleBlock}</td>
            <td valign="middle" align="right" width="70" style="width:70px;padding:0;">{{schoolLogoHtml}}</td>
          </tr>
        </table>`;
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${shell}text-align:${align};">
  <table class="nt-email-card" role="presentation" cellpadding="0" cellspacing="0" width="100%" dir="${dir}" style="width:100%;max-width:100%;margin:0;background:${FIKR_BRAND.card};border-collapse:collapse;">
    <tr>
      <td style="${PLATFORM_HEADER_STYLE}">
        ${headerInner}
      </td>
    </tr>
    <tr>
      <td class="nt-email-body" align="${align}" dir="${dir}" style="${BODY_STYLE}padding:24px 24px 16px;text-align:${align};">
        {{content}}
      </td>
    </tr>
    <tr>
      <td align="${align}" dir="${dir}" style="${PLATFORM_FOOTER_STYLE}text-align:${align};">
        {{footerText}}
      </td>
    </tr>
  </table>
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
  return `<p style="margin:0 0 14px;color:${FIKR_BRAND.ink};font-size:15px;line-height:1.55;">${htmlInner}</p>`;
}

export function brandedHeading(text: string): string {
  return `<p style="margin:0 0 16px;font-size:17px;line-height:1.35;font-weight:700;color:${FIKR_BRAND.ink};">${text}</p>`;
}

/** Label / value lines — no tinted boxes (body copy stays plain). */
export function brandedDetails(rows: Array<[label: string, value: string]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 8px;color:${FIKR_BRAND.ink};font-size:15px;line-height:1.55;"><strong>${label}:</strong> ${value}</p>`,
    )
    .join('');
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
