export type SchoolNotificationBranding = {
  schoolName: string;
  schoolLogo: string;
  schoolLogoHtml: string;
  footerText: string;
};

const CARD_STYLE =
  'max-width:560px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.06);';
const HEADER_STYLE = 'padding:24px 28px;background:linear-gradient(135deg,#7c3aed,#db2777);color:#fff;';
const BODY_STYLE = 'padding:24px 28px;';
const SHELL_EN =
  'margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,-apple-system,Segoe UI,Roboto,sans-serif;color:#111827;';
const SHELL_AR =
  'margin:0;padding:24px;background:#f3f4f6;font-family:system-ui,Tahoma,Segoe UI,sans-serif;color:#111827;';

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
  return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" width="56" height="56" style="display:block;max-height:56px;max-width:160px;width:auto;height:auto;margin:0 0 10px;border-radius:8px;background:#ffffff;padding:4px;" />`;
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
