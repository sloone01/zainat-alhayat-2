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

const BODY_STYLE = `padding:22px 22px 10px;color:${FIKR_BRAND.ink};font-size:16px;line-height:1.65;`;

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
  opts?: { compact?: boolean; header?: boolean },
): string {
  const src = logoUrl.trim();
  if (!src) return '';
  const alt = escapeHtmlAttr(schoolName || 'Logo');
  const width = opts?.compact ? 64 : opts?.header ? 120 : 160;
  const height = opts?.compact ? 36 : opts?.header ? 0 : 48;
  const heightAttr = height > 0 ? ` height="${height}"` : '';
  const heightCss = height > 0 ? `height:${height}px;` : 'height:auto;';
  return `<img src="${escapeHtmlAttr(src)}" alt="${alt}" width="${width}"${heightAttr} style="display:block;width:${width}px;max-width:${width}px;${heightCss}margin:0;border:0;outline:none;text-decoration:none;background:transparent;" />`;
}

/**
 * Name at the reading start, logo at the far end.
 * English: name left, logo right. Arabic: name right, logo left.
 * The table stays `dir=ltr` so a right-to-left document does not pull both onto one side.
 */
export function oppositeEndsBrandHeader(locale: 'en' | 'ar', titleHtml: string, logoHtml: string): string {
  const isAr = locale === 'ar';
  const titleAlign = isAr ? 'right' : 'left';
  const logoAlign = isAr ? 'left' : 'right';
  const titlePad = isAr ? '0 0 0 12px' : '0 12px 0 0';
  const titleCell = `<td valign="middle" align="${titleAlign}" style="padding:${titlePad};">${titleHtml}</td>`;
  const logoCell = `<td valign="middle" align="${logoAlign}" width="128" style="width:128px;padding:0;">${logoHtml}</td>`;
  const cells = isAr ? `${logoCell}${titleCell}` : `${titleCell}${logoCell}`;
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" dir="ltr" style="width:100%;border-collapse:collapse;"><tr>${cells}</tr></table>`;
}

function schoolTitleBlock(titleHtml: string, subtitle: string): string {
  const sub = subtitle.trim()
    ? `<div style="margin-top:4px;font-size:13px;line-height:1.4;font-weight:600;color:${FIKR_BRAND.tealDark};">${escapeHtmlText(subtitle.trim())}</div>`
    : '';
  return `<div style="font-size:18px;line-height:1.25;font-weight:800;color:${FIKR_BRAND.navy};">${titleHtml}</div>${sub}`;
}

export function schoolEmailHeader(locale: 'en' | 'ar', subtitle: string): string {
  return oppositeEndsBrandHeader(
    locale,
    schoolTitleBlock('{{schoolName}}', subtitle),
    '{{schoolLogoHtml}}',
  );
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
    ? 'فكر — منصة المدارس الذكية. للتواصل: admin@fikr.om'
    : 'FIKR — Smart School Platform. Contact: admin@fikr.om';
}

/** Relative path on the public web app (absolutized with PUBLIC_APP_URL). */
export const FIKR_LOGO_PUBLIC_PATH = '/fikr-logo.png?v=6';

/** API-hosted logo for preview and as a remote fallback. */
export const FIKR_LOGO_API_PATH = '/api/public/branding/fikr-logo.png';

/** Inline CID used when sending system emails (Gmail cannot load localhost images). */
export const FIKR_LOGO_CID = 'fikr-logo@fikr';
export const FIKR_LOGO_CID_SRC = `cid:${FIKR_LOGO_CID}`;

/** Inline CID for school logos on outbound school emails. */
export const SCHOOL_LOGO_CID = 'school-logo@fikr';
export const SCHOOL_LOGO_CID_SRC = `cid:${SCHOOL_LOGO_CID}`;

/** Put the logo on the opposite end from the school name when a card is missing it. */
export function injectSchoolLogoPlaceholder(html: string, locale: 'en' | 'ar' = 'en'): string {
  if (!html || html.includes('{{schoolLogoHtml}}')) return html;
  return html.replace(
    /(<div[^>]*style="[^"]*font-size:18px;font-weight:700;[^"]*"[^>]*>\{\{\s*schoolName\s*\}\}<\/div>)(\s*<div\b[^>]*>[\s\S]*?<\/div>)?/i,
    (_m, nameDiv: string, subtitle: string) =>
      oppositeEndsBrandHeader(locale, `${nameDiv}${subtitle || ''}`, '{{schoolLogoHtml}}'),
  );
}

function headerIsSplit(html: string): boolean {
  return /role\s*=\s*["']presentation["']/i.test(html) && /\{\{\s*schoolLogoHtml\s*\}\}/i.test(html);
}

/** Stock school shells (logo stacked above the name) become the current default. Custom shells only get a split header. */
export function refreshNotificationLayoutHtml(html: string, locale: 'en' | 'ar'): string {
  const raw = (html ?? '').trim();
  if (!raw || headerIsSplit(raw)) return raw;
  const stock =
    !raw.includes('fikr-nl-v1:') &&
    /nt-email-card/i.test(raw) &&
    /\{\{\s*content\s*\}\}/i.test(raw) &&
    /\{\{\s*schoolName\s*\}\}/i.test(raw);
  if (stock) return defaultNotificationLayoutHtml(locale);
  return raw.replace(
    /\{\{\s*schoolLogoHtml\s*\}\}\s*(<div\b[^>]*>\s*\{\{\s*schoolName\s*\}\}\s*<\/div>)(\s*<div\b[^>]*>[\s\S]*?<\/div>)?/i,
    (_m, nameDiv: string, subtitle: string) =>
      oppositeEndsBrandHeader(locale, `${nameDiv}${subtitle || ''}`, '{{schoolLogoHtml}}'),
  );
}

export function emailHasSchoolCard(html: string): boolean {
  return /nt-email-card/i.test(html);
}

const LOCALE_STYLE_MARKER = 'data-fikr-locale-dir';

function upsertHtmlAttr(attrs: string, name: string, value: string): string {
  const re = new RegExp(`\\b${name}\\s*=\\s*(["'])[\\s\\S]*?\\1`, 'i');
  if (re.test(attrs)) return attrs.replace(re, `${name}="${value}"`);
  return `${attrs} ${name}="${value}"`;
}

function upsertCssProp(style: string, prop: string, value: string): string {
  const re = new RegExp(`${prop}\\s*:\\s*[^;]+;?`, 'gi');
  if (re.test(style)) return style.replace(re, `${prop}:${value};`);
  const trimmed = style.trim();
  const needsSemi = trimmed.length > 0 && !trimmed.endsWith(';');
  return `${trimmed}${needsSemi ? ';' : ''}${prop}:${value};`;
}

function applyDirAlignToAttrs(
  attrs: string,
  dir: string,
  align: string,
  opts?: { includeAlignAttr?: boolean },
): string {
  let a = upsertHtmlAttr(attrs, 'dir', dir);
  if (opts?.includeAlignAttr) a = upsertHtmlAttr(a, 'align', align);
  if (/\bstyle\s*=/i.test(a)) {
    a = a.replace(/\bstyle\s*=\s*(["'])([\s\S]*?)\1/i, (_m, q: string, style: string) => {
      let s = upsertCssProp(String(style), 'text-align', align);
      s = upsertCssProp(s, 'direction', dir);
      return `style=${q}${s}${q}`;
    });
  } else {
    a += ` style="text-align:${align};direction:${dir};"`;
  }
  return a;
}

function localeHeadStyle(locale: 'en' | 'ar'): string {
  const dir = locale === 'ar' ? 'rtl' : 'ltr';
  const align = locale === 'ar' ? 'right' : 'left';
  return `<style ${LOCALE_STYLE_MARKER}>html,body,.nt-email-card,.nt-email-body{direction:${dir};text-align:${align};}</style>`;
}

function injectLocaleHeadStyle(html: string, locale: 'en' | 'ar'): string {
  const tag = localeHeadStyle(locale);
  if (html.includes(LOCALE_STYLE_MARKER)) {
    return html.replace(
      new RegExp(`<style[^>]*${LOCALE_STYLE_MARKER}[^>]*>[\\s\\S]*?<\\/style>`, 'i'),
      tag,
    );
  }
  if (/<head[\s>]/i.test(html)) {
    return html.replace(/<head([^>]*)>/i, `<head$1>${tag}`);
  }
  return html;
}

/** Flip leftover left/right CSS alignment to match locale. Leaves center/justify alone. */
function flipInlineTextAlign(html: string, locale: 'en' | 'ar'): string {
  const from = locale === 'ar' ? 'left' : 'right';
  const to = locale === 'ar' ? 'right' : 'left';
  return html.replace(/text-align\s*:\s*(left|right)\b/gi, (m, val: string) =>
    val.toLowerCase() === from ? `text-align:${to}` : m,
  );
}

/** Force lang/dir + body alignment for the chosen locale (fixes left-aligned Arabic). */
export function ensureDocumentLocale(html: string, locale: 'en' | 'ar'): string {
  let out = (html ?? '').trim();
  if (!out) return out;
  const isAr = locale === 'ar';
  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';

  if (/<html[\s>]/i.test(out)) {
    out = out.replace(/<html([^>]*)>/i, (_m, attrs: string) => {
      let a = String(attrs ?? '');
      a = upsertHtmlAttr(a, 'lang', lang);
      a = upsertHtmlAttr(a, 'dir', dir);
      return `<html${a}>`;
    });
  }

  out = out.replace(/<body([^>]*)>/i, (_m, attrs: string) => {
    return `<body${applyDirAlignToAttrs(String(attrs ?? ''), dir, align)}>`;
  });

  out = out.replace(
    /<(div|td|table)(\s[^>]*\bclass\s*=\s*(["'])[^"']*\bnt-email-(?:card|body)\b[^"']*\3[^>]*)>/gi,
    (_m, name: string, attrs: string) => {
      const isBody = /\bnt-email-body\b/i.test(attrs);
      return `<${name}${applyDirAlignToAttrs(attrs, dir, align, {
        includeAlignAttr: isBody && /^td$/i.test(name),
      })}>`;
    },
  );

  out = flipInlineTextAlign(out, locale);
  return injectLocaleHeadStyle(out, locale);
}

export function wrapEmailWithSchoolChrome(
  html: string,
  locale: 'en' | 'ar',
  subtitle: string,
): string {
  const raw = (html ?? '').trim();
  if (!raw) return raw;
  const withLogo = injectSchoolLogoPlaceholder(raw, locale);
  if (emailHasSchoolCard(withLogo)) return ensureDocumentLocale(withLogo, locale);

  const inner = extractBodyInner(withLogo);
  const isAr = locale === 'ar';
  const align = isAr ? 'right' : 'left';
  const dirAttr = isAr ? 'rtl' : 'ltr';
  const card = `<div class="nt-email-card" style="${CARD_STYLE}" dir="${dirAttr}">
    <div style="${HEADER_STYLE}">
      ${schoolEmailHeader(locale, subtitle)}
    </div>
    <div class="nt-email-body" style="${BODY_STYLE}text-align:${align};direction:${dirAttr};" dir="${dirAttr}">
      ${inner}
    </div>
  </div>`;

  if (/<html[\s>]/i.test(raw)) {
    const replaced = raw.replace(
      /<body[^>]*>[\s\S]*<\/body>/i,
      `<body style="${isAr ? SHELL_AR : SHELL_EN}text-align:${align};direction:${dirAttr};">\n  ${card}\n</body>`,
    );
    return ensureDocumentLocale(replaced, locale);
  }

  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? ' dir="rtl"' : ' dir="ltr"';
  return ensureDocumentLocale(
    `<!DOCTYPE html>
<html lang="${lang}"${dir}>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${isAr ? SHELL_AR : SHELL_EN}text-align:${align};direction:${dirAttr};">
  ${card}
</body>
</html>`,
    locale,
  );
}

/** Default editable layout shell for schools (logo + school name from branding vars). */
export function defaultNotificationLayoutHtml(locale: 'en' | 'ar'): string {
  const isAr = locale === 'ar';
  const subtitle = isAr ? 'إشعار من المدرسة' : 'School notification';
  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? 'rtl' : 'ltr';
  const align = isAr ? 'right' : 'left';
  const shell = isAr ? SHELL_AR : SHELL_EN;
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
  <style>
    .nt-email-body p { margin: 0 0 12px; font-size: 16px; line-height: 1.65; color: ${FIKR_BRAND.ink}; }
    .nt-email-body strong { color: ${FIKR_BRAND.navy}; }
    .nt-email-body a { color: ${FIKR_BRAND.tealDark}; font-weight: 700; }
  </style>
</head>
<body style="${shell}text-align:${align};direction:${dir};">
  <div class="nt-email-card" dir="${dir}" style="${CARD_STYLE}">
    <div style="${HEADER_STYLE}">
      ${schoolEmailHeader(locale, subtitle)}
    </div>
    <div class="nt-email-body" dir="${dir}" style="${BODY_STYLE}text-align:${align};direction:${dir};">
      {{content}}
    </div>
    <div style="${FOOTER_STYLE}text-align:${align};">
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
  const headerInner = oppositeEndsBrandHeader(locale, titleBlock, '{{schoolLogoHtml}}');
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtmlText(subtitle)}</title>
</head>
<body style="${shell}text-align:${align};direction:${dir};">
  <table class="nt-email-card" role="presentation" cellpadding="0" cellspacing="0" width="100%" dir="${dir}" style="width:100%;max-width:100%;margin:0;background:${FIKR_BRAND.card};border-collapse:collapse;">
    <tr>
      <td style="${PLATFORM_HEADER_STYLE}">
        ${headerInner}
      </td>
    </tr>
    <tr>
      <td class="nt-email-body" align="${align}" dir="${dir}" style="${BODY_STYLE}padding:24px 24px 16px;text-align:${align};direction:${dir};">
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
 * Full-document / legacy card bodies: extract `.nt-email-body` (or `<body>`) so the
 * school layout header + logo still wrap the message.
 */
export function applyEmailLayout(layoutHtml: string, bodyHtml: string): string {
  const layout = (layoutHtml ?? '').trim();
  const body = (bodyHtml ?? '').trim();
  if (!layout) return body;
  if (!body) return layout.replace(/\{\{\s*content\s*\}\}/gi, '');
  const hasContentSlot = /\{\{\s*content\s*\}\}/i.test(layout);
  if (emailHasSchoolCard(body) || /<html[\s>]/i.test(body)) {
    if (hasContentSlot) {
      const extracted = extractNtEmailBodyInner(body) || extractBodyInner(body);
      if (extracted) return layout.replace(/\{\{\s*content\s*\}\}/gi, extracted);
    }
    return body;
  }
  const inner = extractBodyInner(body);
  if (!hasContentSlot) {
    return `${layout}\n${inner}`;
  }
  return layout.replace(/\{\{\s*content\s*\}\}/gi, inner);
}

/** Prefer the message region inside a legacy school card / full HTML receipt. */
function extractNtEmailBodyInner(html: string): string {
  const m = html.match(
    /<div\b[^>]*\bclass\s*=\s*(["'])[^"']*\bnt-email-body\b[^"']*\1[^>]*>([\s\S]*?)<\/div>/i,
  );
  return (m?.[2] ?? '').trim();
}

/** Shared inner HTML helpers for system template factory bodies. */
export function brandedParagraph(text: string): string {
  return `<p style="margin:0 0 14px;color:${FIKR_BRAND.ink};font-size:16px;line-height:1.65;">${text}</p>`;
}

export function brandedOtpBlock(codePlaceholder: string): string {
  return `<div style="margin:18px 0;padding:18px 16px;text-align:center;background:#ffffff;">
  <div style="font-size:28px;font-weight:800;letter-spacing:0.28em;color:${FIKR_BRAND.navy};font-family:ui-monospace,SFMono-Regular,Menlo,monospace;">${codePlaceholder}</div>
</div>`;
}

export function brandedCallout(htmlInner: string): string {
  return `<p style="margin:0 0 14px;color:${FIKR_BRAND.ink};font-size:16px;line-height:1.65;">${htmlInner}</p>`;
}

export function brandedHeading(text: string): string {
  return `<p style="margin:0 0 16px;font-size:18px;line-height:1.35;font-weight:800;color:${FIKR_BRAND.navy};">${text}</p>`;
}

/** Solid action link. `href` is a template placeholder such as `{{joinUrl}}`. */
export function brandedActionLink(href: string, label: string, tone: 'primary' | 'quiet' = 'primary'): string {
  const style =
    tone === 'primary'
      ? `display:inline-block;background:${FIKR_BRAND.teal};color:#ffffff;text-decoration:none;font-weight:700;font-size:15px;line-height:1.2;padding:12px 18px;border-radius:8px;`
      : `display:inline-block;background:#ffffff;color:${FIKR_BRAND.navy};text-decoration:none;font-weight:700;font-size:15px;line-height:1.2;padding:11px 18px;border-radius:8px;border:1px solid ${FIKR_BRAND.hairline};`;
  return `<a href="${href}" style="${style}">${escapeHtmlText(label)}</a>`;
}

/** Greeting, what happened, labeled facts, then what to do. */
export function clearNotice(input: {
  heading?: string;
  greeting?: string;
  lead: string;
  details?: Array<[string, string]>;
  follow?: string;
  actionHtml?: string;
}): string {
  return [
    input.heading ? brandedHeading(input.heading) : '',
    input.greeting ? brandedParagraph(input.greeting) : '',
    brandedParagraph(input.lead),
    input.details?.length ? brandedDetails(input.details) : '',
    input.follow ? brandedParagraph(input.follow) : '',
    input.actionHtml ? `<p style="margin:18px 0 4px;">${input.actionHtml}</p>` : '',
  ].join('');
}

/** Label / value lines — no tinted boxes (body copy stays plain). */
export function brandedDetails(rows: Array<[label: string, value: string]>): string {
  return rows
    .map(
      ([label, value]) =>
        `<p style="margin:0 0 8px;color:${FIKR_BRAND.ink};font-size:16px;line-height:1.65;"><strong style="color:${FIKR_BRAND.navy};">${label}:</strong> ${value}</p>`,
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
