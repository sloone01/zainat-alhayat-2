export type SchoolNotificationBranding = {
  schoolName: string;
  schoolLogo: string;
  schoolLogoHtml: string;
  footerText: string;
};

const CARD_STYLE =
  'max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);';
/** Light header — soft violet→rose wash with dark text (not solid purple). */
const HEADER_STYLE =
  'padding:12px 16px;background:linear-gradient(135deg,#f5f3ff,#fdf2f8);color:#5b21b6;';
const BODY_STYLE = 'padding:12px 16px;';
const FOOTER_STYLE =
  'padding:10px 16px;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;';
const SHELL_EN =
  'margin:0;padding:8px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;';
const SHELL_AR =
  'margin:0;padding:8px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;';

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

export function buildSchoolLogoHtml(logoUrl: string, schoolName: string): string {
  const src = logoUrl.trim();
  if (!src) return '';
  const alt = escapeHtmlAttr(schoolName || 'School');
  return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" width="48" height="48" style="display:block;max-height:48px;max-width:140px;width:auto;height:auto;margin:0 0 6px;border-radius:8px;background:#ffffff;padding:3px;" />`;
}

export function brandingVariables(branding: SchoolNotificationBranding): Record<string, string> {
  return {
    schoolName: branding.schoolName,
    schoolLogo: branding.schoolLogo,
    schoolLogoHtml: branding.schoolLogoHtml,
    footerText: branding.footerText,
  };
}

/** Inject `{{schoolLogoHtml}}` above the school-name header if the card is missing it. */
export function injectSchoolLogoPlaceholder(html: string): string {
  if (!html || html.includes('{{schoolLogoHtml}}')) return html;
  return html.replace(
    /(<div style="font-size:18px;font-weight:700;">\{\{\s*schoolName\s*\}\}<\/div>)/,
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
      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
      <div style="font-size:13px;opacity:.95;margin-top:4px;">${escapeHtmlText(subtitle)}</div>
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

/** Default editable layout shell (EN). Schools can clone/customize this. */
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
      <div style="font-size:18px;font-weight:700;">{{schoolName}}</div>
      <div style="font-size:13px;opacity:.95;margin-top:4px;">${escapeHtmlText(subtitle)}</div>
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
