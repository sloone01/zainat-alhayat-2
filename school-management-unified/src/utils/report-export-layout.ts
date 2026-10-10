/**
 * Print-page shell for report downloads. The table is injected at {{content}}.
 * School letterhead uses {{schoolLogoHtml}}, {{schoolName}}, and {{footerText}}.
 */

export type ReportPageOrientation = 'portrait' | 'landscape'

const PAGE_RULE = /@page\s*\{[^}]*\}/g
/** Top and bottom inset on every printed page, including pages after the first. */
const PAGE_MARGIN = '14mm 0 14mm 0'
const TAG_ORIENT =
  /(<(?:body|div)\b[^>]*\bdata-rpt-orient\s*=\s*["'])(?:portrait|landscape)(["'])/gi

export function reportPageOrientation(html: string | null | undefined): ReportPageOrientation {
  const source = html || ''
  const marked = source.match(/<(?:body|div)\b[^>]*\bdata-rpt-orient\s*=\s*["'](portrait|landscape)["']/i)
  if (marked?.[1] === 'landscape' || marked?.[1] === 'portrait') return marked[1]
  if (/@page\s*\{[^}]*\bA4\s+landscape\b/i.test(source)) return 'landscape'
  return 'portrait'
}

/** CSS pixels at 96dpi — matches A4 for html2canvas capture. */
export function reportPagePixelSize(orientation: ReportPageOrientation): { width: number; height: number } {
  return orientation === 'landscape' ? { width: 1123, height: 794 } : { width: 794, height: 1123 }
}

/** Word opens HTML as a portrait page unless the section says otherwise. */
export function applyWordPageOrientation(
  html: string,
  orientation?: ReportPageOrientation,
): string {
  const landscape = (orientation ?? reportPageOrientation(html)) === 'landscape'
  const size = landscape ? '841.9pt 595.3pt' : '595.3pt 841.9pt'
  const mso = landscape ? 'landscape' : 'portrait'
  const head = `<!--[if gte mso 9]><xml><w:WordDocument xmlns:w="urn:schemas-microsoft-com:office:word"><w:View>Print</w:View></w:WordDocument></xml><![endif]--><style>@page WordSection1 { size: ${size}; mso-page-orientation: ${mso}; margin: ${PAGE_MARGIN}; } div.WordSection1 { page: WordSection1; } tr { page-break-inside: avoid; break-inside: avoid; }</style>`
  let out = html.replace(/@page\s*\{[^}]*\}/gi, `@page { size: ${size}; mso-page-orientation: ${mso}; margin: ${PAGE_MARGIN}; }`)
  if (/<html\b/i.test(out)) {
    out = out.replace(/<html\b([^>]*)>/i, (_match, attrs: string) => {
      let next = String(attrs)
      if (!/xmlns:w=/i.test(next)) next += ' xmlns:w="urn:schemas-microsoft-com:office:word"'
      if (!/xmlns:o=/i.test(next)) next += ' xmlns:o="urn:schemas-microsoft-com:office:office"'
      return `<html${next}>`
    })
  }
  if (/<head[\s>]/i.test(out)) out = out.replace(/<head([^>]*)>/i, `<head$1>${head}`)
  else out = `<head>${head}</head>${out}`
  if (/<body\b/i.test(out) && !/class="WordSection1"/.test(out)) {
    out = out.replace(/<body([^>]*)>/i, '<body$1><div class="WordSection1">').replace(/<\/body>/i, '</div></body>')
  }
  return out
}

export function isReportPageHtml(html: string | null | undefined): boolean {
  return /\brpt-page\b/.test(html || '')
}

/** Email-card shells saved before the print page layout. */
export function isLegacyEmailReportShell(html: string | null | undefined): boolean {
  const source = html || ''
  if (!source.trim() || isReportPageHtml(source)) return false
  return /nt-email-card|fikr-nl-v1/i.test(source)
}

const REPORT_ROW_VARS = ['name', 'group', 'age', 'status', 'bus'] as const

const HEADER_LABELS: Record<'en' | 'ar', string[]> = {
  en: ['Name', 'Group', 'Age', 'Status', 'Bus'],
  ar: ['الاسم', 'المجموعة', 'العمر', 'الحالة', 'الحافلة'],
}

type SamplePerson = Record<string, string>

const SAMPLE_PEOPLE: Record<'en' | 'ar', SamplePerson[]> = {
  en: [
    { name: 'Adam Nasser Al-Lawati', group: 'KG1-A', age: '5', status: 'Active', bus: 'Bus 2' },
    { name: 'Layan Salem Al-Hinai', group: 'KG1-A', age: '4', status: 'Active', bus: 'Bus 1' },
    { name: 'Yousuf Khalid Al-Busaidi', group: 'KG1-B', age: '5', status: 'Active', bus: 'Bus 3' },
    { name: 'Mariam Ahmed Al-Shehhi', group: 'KG1-B', age: '4', status: 'Inactive', bus: '—' },
    { name: 'Hamad Said Al-Rashdi', group: 'KG2-A', age: '6', status: 'Active', bus: 'Bus 2' },
    { name: 'Fatima Ali Al-Maqbali', group: 'KG2-A', age: '6', status: 'Active', bus: 'Bus 1' },
    { name: 'Salman Tariq Al-Kindi', group: 'KG2-B', age: '5', status: 'Active', bus: 'Bus 4' },
    { name: 'Noora Mohammed Al-Harthi', group: 'KG2-B', age: '6', status: 'Active', bus: 'Bus 3' },
  ],
  ar: [
    { name: 'آدم ناصر اللواتي', group: 'تمهيدي أ', age: '5', status: 'نشط', bus: 'حافلة 2' },
    { name: 'ليان سالم الهنائي', group: 'تمهيدي أ', age: '4', status: 'نشط', bus: 'حافلة 1' },
    { name: 'يوسف خالد البوسعيدي', group: 'تمهيدي ب', age: '5', status: 'نشط', bus: 'حافلة 3' },
    { name: 'مريم أحمد الشحي', group: 'تمهيدي ب', age: '4', status: 'غير نشط', bus: '—' },
    { name: 'حمد سعيد الراشدي', group: 'روضة أ', age: '6', status: 'نشط', bus: 'حافلة 2' },
    { name: 'فاطمة علي المقبالي', group: 'روضة أ', age: '6', status: 'نشط', bus: 'حافلة 1' },
    { name: 'سلمان طارق الكندي', group: 'روضة ب', age: '5', status: 'نشط', bus: 'حافلة 4' },
    { name: 'نورة محمد الحارثي', group: 'روضة ب', age: '6', status: 'نشط', bus: 'حافلة 3' },
  ],
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function parseRoot(html: string): HTMLElement | null {
  if (typeof DOMParser === 'undefined') return null
  const doc = new DOMParser().parseFromString(`<div id="rpt-root">${html}</div>`, 'text/html')
  return doc.getElementById('rpt-root')
}

function cellText(el: Element): string {
  return (el.textContent || '').replace(/\s+/g, ' ').trim()
}

function tokensFromRow(row: Element | null | undefined): string[] {
  if (!row) return []
  return [...row.querySelectorAll('th,td')]
    .map((cell) => cellText(cell).match(/^\{\{\s*([a-zA-Z0-9_]+)\s*\}\}$/)?.[1] || '')
    .filter(Boolean)
}

function variableRowHtml(vars: string[]): string {
  return `<tr>${vars.map((key) => `<td>{{${key}}}</td>`).join('')}</tr>`
}

function headerCellsHtml(labels: string[]): string {
  return labels.map((label) => `<th>${escapeHtml(label)}</th>`).join('')
}

function defaultEditorTable(locale: 'en' | 'ar'): string {
  return `<table><thead><tr>${headerCellsHtml(HEADER_LABELS[locale])}</tr></thead><tbody>${variableRowHtml([...REPORT_ROW_VARS])}</tbody></table>`
}

function defaultEditorDocument(locale: 'en' | 'ar'): string {
  if (locale === 'ar') {
    return `<h1>الطلاب</h1>
<h2>قائمة الطلاب</h2>
<div class="meta"><strong>تاريخ الإنشاء</strong>: {{date}}</div>
${defaultEditorTable(locale)}`
  }
  return `<h1>Students</h1>
<h2>Student list</h2>
<div class="meta"><strong>Generated</strong>: {{date}}</div>
${defaultEditorTable(locale)}`
}

function mergedColumnLabels(
  existingKeys: string[],
  existingLabels: string[],
  columns: { key: string; label: string }[],
): { key: string; label: string }[] {
  const byKey = new Map<string, string>()
  existingKeys.forEach((key, index) => {
    const label = existingLabels[index]?.replace(/<[^>]+>/g, '').trim()
    if (label && !/^\{\{/.test(label)) byKey.set(key, label)
  })
  return columns.map((col) => ({ key: col.key, label: byKey.get(col.key) || col.label }))
}

/** Editor table follows the export's selected fields: titles plus one {{variable}} row. */
export function syncEditorTableColumns(
  editorHtml: string,
  columns: { key: string; label: string }[],
): string {
  if (!columns.length) return editorHtml
  const root = parseRoot(editorHtml || '')
  if (!root) return editorHtml
  const table = root.querySelector('table')
  if (!table) return editorHtml
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr')
  const labels = headerRow
    ? [...headerRow.querySelectorAll('th,td')].map((cell) => cellText(cell)).filter((text) => !/^\{\{/.test(text))
    : []
  const merged = mergedColumnLabels(varsForTable(table, labels.length), labels, columns)
  const next = parseRoot(
    `<table><thead><tr>${headerCellsHtml(merged.map((col) => col.label))}</tr></thead><tbody>${variableRowHtml(merged.map((col) => col.key))}</tbody></table>`,
  )?.querySelector('table')
  if (next) table.replaceWith(next)
  return root.innerHTML.trim()
}

/** Print table uses the export's fields. Header words already on the template stay with their field. */
export function alignReportTableColumns(
  html: string,
  columns: { key: string; label: string }[],
): string {
  if (!html?.trim() || !columns.length) return html
  const existingKeys = reportLayoutRowVariables(html) || []
  const theadMatch = html.match(/<thead\b[^>]*>[\s\S]*?<\/thead>/i)
  const existingLabels = theadMatch
    ? [...theadMatch[0].matchAll(/<th\b[^>]*>([\s\S]*?)<\/th>/gi)].map((match) => match[1])
    : []
  const merged = mergedColumnLabels(existingKeys, existingLabels, columns)
  const head = `<thead><tr>${headerCellsHtml(merged.map((col) => col.label))}</tr></thead>`
  const vars = merged.map((col) => col.key).join(' ')
  let out = html
  if (/\bdata-rpt-vars\s*=/.test(out)) {
    out = out.replace(/\bdata-rpt-vars\s*=\s*["'][^"']*["']/i, `data-rpt-vars="${vars}"`)
  } else {
    out = out.replace(/<table\b/i, `<table data-rpt-vars="${vars}"`)
  }
  if (/<thead\b/i.test(out)) out = out.replace(/<thead\b[^>]*>[\s\S]*?<\/thead>/i, head)
  return out
}

/** Column keys stored on the print table. The editor shows these as {{name}} in the single data row. */
export function reportLayoutRowVariables(html: string | null | undefined): string[] | null {
  const marked = (html || '').match(/\bdata-rpt-vars\s*=\s*["']([^"']+)["']/i)
  if (!marked) return null
  const keys = marked[1]
    .split(/[\s,]+/)
    .map((key) => key.trim())
    .filter(Boolean)
  return keys.length ? keys : null
}

/** True when {{content}} is the table body, so an export should inject rows rather than a second document. */
export function reportLayoutUsesRowSlot(html: string | null | undefined): boolean {
  return /<tbody>\s*\{\{\s*content\s*\}\}\s*<\/tbody>/i.test(html || '')
}

/** Inner HTML of the print body, including {{content}} when that is all that was saved. */
export function reportBodyInner(html: string | null | undefined): string {
  const match = (html || '').match(/<div class="rpt-body">([\s\S]*?)<\/div>\s*<footer/i)
  return (match?.[1] || '').trim()
}

function varsForTable(table: Element, fallbackCount: number): string[] {
  const marked = table.getAttribute('data-rpt-vars')
  if (marked?.trim()) {
    const keys = marked.split(/[\s,]+/).map((key) => key.trim()).filter(Boolean)
    if (keys.length) return keys
  }
  const rows = [...table.querySelectorAll('tr')]
  const tokenRow = rows.find((row) => tokensFromRow(row).length > 0)
  const tokens = tokensFromRow(tokenRow)
  if (tokens.length) return tokens
  const count = fallbackCount || REPORT_ROW_VARS.length
  return REPORT_ROW_VARS.slice(0, count)
}

/** Editor document: the report header, column titles, and one row of {{variables}}. */
export function editorDocumentHtml(locale: 'en' | 'ar', savedInner: string | null | undefined): string {
  const inner = (savedInner || '')
    .trim()
    .replace(/25 سبتمبر 2026/g, '{{date}}')
    .replace(/25 Sep 2026/g, '{{date}}')
  if (!inner || /^\{\{\s*content\s*\}\}$/i.test(inner)) return defaultEditorDocument(locale)
  const root = parseRoot(inner)
  if (!root) return defaultEditorDocument(locale)
  const table = root.querySelector('table')
  if (!table) {
    const notes = inner.replace(/\{\{\s*content\s*\}\}/gi, '').trim()
    return `${notes}${defaultEditorTable(locale)}`
  }
  const headerRow = table.querySelector('thead tr') || table.querySelector('tr')
  const labels = headerRow
    ? [...headerRow.querySelectorAll('th,td')].map((cell) => cellText(cell)).filter((text) => !/^\{\{/.test(text))
    : []
  const vars = varsForTable(table, labels.length || REPORT_ROW_VARS.length)
  const head = labels.length ? labels : HEADER_LABELS[locale].slice(0, vars.length)
  table.replaceWith(
    parseRoot(
      `<table><thead><tr>${headerCellsHtml(head)}</tr></thead><tbody>${variableRowHtml(vars)}</tbody></table>`,
    )?.querySelector('table') || table,
  )
  root.querySelectorAll('*').forEach((el) => {
    if (/^\{\{\s*content\s*\}\}$/i.test((el.textContent || '').trim()) && el.children.length === 0) el.remove()
  })
  const leftovers: ChildNode[] = []
  root.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && /^\{\{\s*content\s*\}\}$/i.test((node.textContent || '').trim())) {
      leftovers.push(node)
    }
  })
  leftovers.forEach((node) => node.remove())
  return root.innerHTML.trim()
}

/** Stored print body: the editor header and column titles, with {{content}} standing in for data rows. */
function editorHtmlToShellBody(editorHtml: string): string {
  const root = parseRoot(editorHtml || '')
  if (!root) return '{{content}}'
  const table = root.querySelector('table')
  if (!table) {
    const notes = root.innerHTML.replace(/\{\{\s*content\s*\}\}/gi, '').trim()
    return notes ? `${notes}{{content}}` : '{{content}}'
  }
  const rows = [...table.querySelectorAll('tr')]
  const tokenRow = rows.find((row) => tokensFromRow(row).length > 0)
  const headerRow =
    table.querySelector('thead tr') ||
    rows.find((row) => row !== tokenRow && [...row.querySelectorAll('th')].length > 0) ||
    (tokenRow ? null : rows[0])
  const labels = headerRow
    ? [...headerRow.querySelectorAll('th,td')].map((cell) => cellText(cell)).filter((text) => !/^\{\{/.test(text))
    : []
  const vars = varsForTable(table, labels.length || REPORT_ROW_VARS.length)
  const head = labels.length ? labels : HEADER_LABELS.en.slice(0, vars.length)
  const built = `<table data-rpt-vars="${vars.join(' ')}"><thead><tr>${headerCellsHtml(head)}</tr></thead><tbody></tbody></table>`
  const replacement = parseRoot(built)?.querySelector('table')
  if (replacement) table.replaceWith(replacement)
  // Text placed directly in tbody is moved out by the HTML parser, so write the slot after serialization.
  return root.innerHTML.replace(/<tbody>\s*<\/tbody>/i, '<tbody>{{content}}</tbody>').trim()
}

/** Print shell. The editor header is kept; data rows are injected at {{content}} inside the table. */
export function composeReportExportHtml(
  locale: 'en' | 'ar',
  orientation: ReportPageOrientation,
  bodyHtml: string,
): string {
  const inner = editorHtmlToShellBody(bodyHtml)
  return defaultReportExportLayoutHtml(locale, orientation).replace(
    '<div class="rpt-body">{{content}}</div>',
    `<div class="rpt-body">${inner}</div>`,
  )
}

/** Replace {{date}} with the time the report is shown or exported. */
export function fillReportDate(html: string, locale: 'en' | 'ar'): string {
  const date = new Date().toLocaleString(locale === 'ar' ? 'ar-SA' : 'en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
  return html.replace(/\{\{\s*date\s*\}\}/gi, date)
}

const DUE_SAMPLE: Record<'en' | 'ar', SamplePerson[]> = {
  en: [
    { installment: 'Term 1', dueDate: '1 Jan 2000', balance: 'OMR 120.000', status: 'Late', amountDue: 'OMR 200.000', amountPaid: 'OMR 80.000', daysOverdue: '9,734' },
    { installment: 'Term 2', dueDate: '31 Mar 2000', balance: 'OMR 90.000', status: 'Late', amountDue: 'OMR 90.000', amountPaid: 'OMR 0.000', daysOverdue: '9,644' },
    { installment: 'Term 1', dueDate: '1 Sep 2026', balance: 'OMR 150.000', status: 'Due today', amountDue: 'OMR 150.000', amountPaid: 'OMR 0.000', daysOverdue: '0' },
    { installment: 'Term 2', dueDate: '1 Dec 2026', balance: 'OMR 75.000', status: 'Upcoming', amountDue: 'OMR 150.000', amountPaid: 'OMR 75.000', daysOverdue: '—' },
  ],
  ar: [
    { installment: 'الفصل 1', dueDate: '1 يناير 2000', balance: '120.000 ر.ع', status: 'متأخر', amountDue: '200.000 ر.ع', amountPaid: '80.000 ر.ع', daysOverdue: '9,734' },
    { installment: 'الفصل 2', dueDate: '31 مارس 2000', balance: '90.000 ر.ع', status: 'متأخر', amountDue: '90.000 ر.ع', amountPaid: '0.000 ر.ع', daysOverdue: '9,644' },
    { installment: 'الفصل 1', dueDate: '1 سبتمبر 2026', balance: '150.000 ر.ع', status: 'مستحق اليوم', amountDue: '150.000 ر.ع', amountPaid: '0.000 ر.ع', daysOverdue: '0' },
    { installment: 'الفصل 2', dueDate: '1 ديسمبر 2026', balance: '75.000 ر.ع', status: 'قادم', amountDue: '150.000 ر.ع', amountPaid: '75.000 ر.ع', daysOverdue: '—' },
  ],
}

/** Sample data rows for the preview. One `<tr>` per student, in the editor's variable order. */
export function sampleReportRowsHtml(locale: 'en' | 'ar', vars?: string[] | null): string {
  const keys = vars?.length ? vars : [...REPORT_ROW_VARS]
  const paymentLayout = keys.some((key) =>
    key === 'installment' || key === 'dueDate' || key === 'balance' || key === 'amountDue' || key === 'daysOverdue',
  )
  const dueRows = DUE_SAMPLE[locale]
  return SAMPLE_PEOPLE[locale]
    .map((person, index) => {
      const due = dueRows[index % dueRows.length]
      return `<tr>${keys
        .map((key) => {
          const value =
            key === 'student'
              ? person.name
              : key === 'status' && paymentLayout
                ? due.status
                : due[key] || person[key] || '—'
          return `<td>${escapeHtml(value)}</td>`
        })
        .join('')}</tr>`
    })
    .join('')
}

/** Body inner HTML so PDF capture keeps the sheet styles after the document wrapper is dropped. */
export function reportPageFragment(html: string): string {
  const source = (html || '').trim()
  if (!source || typeof DOMParser === 'undefined' || !/<html[\s>]/i.test(source)) return source
  const doc = new DOMParser().parseFromString(source, 'text/html')
  return doc.body?.innerHTML?.trim() || source
}

export function setReportPageOrientation(
  html: string,
  orientation: ReportPageOrientation,
  locale: 'en' | 'ar',
): string {
  const source = (html || '').trim()
  if (!isReportPageHtml(source)) return defaultReportExportLayoutHtml(locale, orientation)
  TAG_ORIENT.lastIndex = 0
  PAGE_RULE.lastIndex = 0
  return source
    .replace(TAG_ORIENT, `$1${orientation}$2`)
    .replace(PAGE_RULE, `@page { size: A4 ${orientation}; margin: ${PAGE_MARGIN}; }`)
}

/** Full sample document (title, date, and every preview row). */
export function sampleReportContent(locale: 'en' | 'ar'): string {
  const headings =
    locale === 'ar'
      ? `<h1>الطلاب</h1>
<h2>قائمة الطلاب</h2>
<div class="meta"><strong>تاريخ الإنشاء</strong>: {{date}}</div>`
      : `<h1>Students</h1>
<h2>Student list</h2>
<div class="meta"><strong>Generated</strong>: {{date}}</div>`
  return `${headings}
<table>
  <thead><tr>${headerCellsHtml(HEADER_LABELS[locale])}</tr></thead>
  <tbody>${sampleReportRowsHtml(locale)}</tbody>
</table>`
}

export function defaultReportExportLayoutHtml(
  locale: 'en' | 'ar',
  orientation: ReportPageOrientation = 'portrait',
): string {
  const isAr = locale === 'ar'
  const lang = isAr ? 'ar' : 'en'
  const dir = isAr ? 'rtl' : 'ltr'
  const font = isAr
    ? 'Tahoma, "Segoe UI", Arial, sans-serif'
    : '"Segoe UI", Tahoma, Arial, sans-serif'
  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <title>{{schoolName}}</title>
</head>
<body class="rpt-page" data-rpt-orient="${orientation}" dir="${dir}">
<style>
  @page { size: A4 ${orientation}; margin: ${PAGE_MARGIN}; }
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
  .rpt-body tr { break-inside: avoid; page-break-inside: avoid; }
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
</html>`
}
