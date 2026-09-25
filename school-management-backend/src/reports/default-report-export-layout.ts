export type ReportPageOrientation = 'portrait' | 'landscape';

/** Email-card shells saved before the print page layout. */
export function isLegacyEmailReportShell(html: string | null | undefined): boolean {
  const source = html || '';
  if (!source.trim() || /\brpt-page\b/.test(source)) return false;
  return /nt-email-card|fikr-nl-v1/i.test(source);
}

export function reportOrientationFromHtml(
  html: string | null | undefined,
): ReportPageOrientation {
  const source = html || '';
  const marked = source.match(
    /<(?:body|div)\b[^>]*\bdata-rpt-orient\s*=\s*["'](portrait|landscape)["']/i,
  );
  if (marked?.[1] === 'landscape' || marked?.[1] === 'portrait') return marked[1];
  if (/@page\s*\{[^}]*\bA4\s+landscape\b/i.test(source)) return 'landscape';
  return 'portrait';
}

/** Earlier print shells used a gray desk and a cream page. */
export function isOutdatedReportShell(html: string | null | undefined): boolean {
  const source = html || '';
  if (!/\brpt-page\b/.test(source)) return false;
  return source.includes('#FBF8F3') || source.includes('#d4d4d4');
}

export function defaultReportExportLayoutHtml(
  locale: 'en' | 'ar',
  orientation: ReportPageOrientation = 'portrait',
): string {
  const isAr = locale === 'ar';
  const lang = isAr ? 'ar' : 'en';
  const dir = isAr ? 'rtl' : 'ltr';
  const font = isAr
    ? 'Tahoma, "Segoe UI", Arial, sans-serif'
    : '"Segoe UI", Tahoma, Arial, sans-serif';
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>{{schoolName}}</title>
</head>
<body class="rpt-page" data-rpt-orient="${orientation}" dir="${dir}">
<style>
  @page { size: A4 ${orientation}; margin: 0; }
  * { box-sizing: border-box; }
  html, body.rpt-page {
    margin: 0;
    background: #ffffff;
    color: #1c1c1c;
    font-family: ${font};
  }
  .rpt-page[data-rpt-orient="portrait"] .rpt-sheet,
  .rpt-sheet[data-rpt-orient="portrait"] { --rpt-w: 794px; --rpt-h: 1123px; }
  .rpt-page[data-rpt-orient="landscape"] .rpt-sheet,
  .rpt-sheet[data-rpt-orient="landscape"] { --rpt-w: 1123px; --rpt-h: 794px; }
  .rpt-sheet {
    width: var(--rpt-w);
    min-height: var(--rpt-h);
    margin: 0;
    background: #ffffff;
    color: #1c1c1c;
    font-family: ${font};
    display: flex;
    flex-direction: column;
  }
  .rpt-pad {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 36px 32px 18px;
  }
  .rpt-letterhead {
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }
  .rpt-brand {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .rpt-logo:empty { display: none; }
  .rpt-logo img {
    display: block;
    width: auto !important;
    height: 48px !important;
    max-width: 168px;
  }
  .rpt-school {
    font-size: 20px;
    line-height: 1.25;
    font-weight: 800;
    color: #1a1a1a;
  }
  .rpt-body { flex: 1; padding-top: 16px; }
  .rpt-body h1 {
    font-size: 18px;
    line-height: 1.3;
    font-weight: 700;
    margin: 0 0 4px;
    text-align: start;
    color: #1a1a1a;
  }
  .rpt-body h2 {
    font-size: 13px;
    line-height: 1.4;
    font-weight: 500;
    margin: 0 0 10px;
    text-align: start;
    color: #5e584f;
  }
  .rpt-body .meta {
    font-size: 12px;
    line-height: 1.5;
    color: #5e584f;
    margin: 0 0 14px;
    text-align: start;
  }
  .rpt-body table {
    width: 100%;
    border-collapse: collapse;
    border-top: 4px solid #F15A24;
    font-size: 12px;
    line-height: 1.35;
  }
  .rpt-body th,
  .rpt-body td {
    padding: 9px 12px;
    text-align: start;
    vertical-align: middle;
    border: 0;
  }
  .rpt-body th {
    background: #1a1a1a;
    color: #ffffff;
    font-size: 12px;
    font-weight: 600;
    border-inline-end: 3px solid #ffffff;
  }
  .rpt-body th:last-child { border-inline-end: 0; }
  .rpt-body td { color: #2a2a2a; }
  .rpt-body tbody tr:nth-child(odd) td { background: #ffffff; }
  .rpt-body tbody tr:nth-child(even) td { background: #f3f4f6; }
  .rpt-body tr { break-inside: avoid; }
  .rpt-footer { margin-top: 18px; }
  .rpt-footer-text {
    font-size: 11px;
    line-height: 1.45;
    color: #7a756e;
    text-align: start;
  }
  .rpt-footer-bar {
    height: 14px;
    background: #1a1a1a;
    position: relative;
    flex: none;
  }
  .rpt-footer-bar::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 92px;
    background: #F15A24;
    inset-inline-end: 0;
    clip-path: polygon(14px 0, 100% 0, 100% 100%, 0 100%);
  }
  [dir="rtl"] .rpt-footer-bar::after {
    clip-path: polygon(0 0, 100% 0, calc(100% - 14px) 100%, 0 100%);
  }
</style>
<div class="rpt-sheet" data-rpt-orient="${orientation}">
  <div class="rpt-pad">
    <header class="rpt-letterhead">
      <div class="rpt-brand">
        <div class="rpt-logo">{{schoolLogoHtml}}</div>
        <div class="rpt-school">{{schoolName}}</div>
      </div>
    </header>
    <div class="rpt-body">{{content}}</div>
    <footer class="rpt-footer">
      <div class="rpt-footer-text">{{footerText}}</div>
    </footer>
  </div>
  <div class="rpt-footer-bar"></div>
</div>
</body>
</html>`;
}

const DUE_INSTALLMENTS_BODY: Record<'en' | 'ar', string> = {
  en: `<h1>Due and late payments</h1>
<h2>Unpaid installments</h2>
<div class="meta"><strong>Generated</strong>: {{date}}</div>
<table data-rpt-vars="student installment dueDate balance status"><thead><tr><th>Student</th><th>Installment</th><th>Due date</th><th>Balance</th><th>Status</th></tr></thead><tbody>{{content}}</tbody></table>`,
  ar: `<h1>المستحق والمتأخر</h1>
<h2>الأقساط غير المسددة</h2>
<div class="meta"><strong>تاريخ الإنشاء</strong>: {{date}}</div>
<table data-rpt-vars="student installment dueDate balance status"><thead><tr><th>الطالب</th><th>القسط</th><th>تاريخ الاستحقاق</th><th>الرصيد</th><th>الحالة</th></tr></thead><tbody>{{content}}</tbody></table>`,
};

/** Print page for the due-and-late report. Rows are injected at `{{content}}`. */
export function dueInstallmentsReportLayoutHtml(
  locale: 'en' | 'ar',
  orientation: ReportPageOrientation = 'portrait',
): string {
  return defaultReportExportLayoutHtml(locale, orientation).replace(
    '<div class="rpt-body">{{content}}</div>',
    `<div class="rpt-body">${DUE_INSTALLMENTS_BODY[locale]}</div>`,
  );
}
