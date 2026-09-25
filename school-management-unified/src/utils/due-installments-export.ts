import { authService } from '@/services'
import reportExportService from '@/services/report-export.service'
import type { DueInstallmentRow } from '@/services/fees-v2.service'
import { applyExportLayout } from '@/utils/student-export-columns'
import {
  alignReportTableColumns,
  fillReportDate,
  isReportPageHtml,
  reportLayoutUsesRowSlot,
  reportPageFragment,
  reportPageOrientation,
  reportPagePixelSize,
} from '@/utils/report-export-layout'

export const DUE_EXPORT_KEYS = [
  'student',
  'installment',
  'dueDate',
  'balance',
  'status',
  'amountDue',
  'amountPaid',
  'daysOverdue',
] as const

export type DueExportKey = (typeof DUE_EXPORT_KEYS)[number]

const DEFAULT_KEYS: DueExportKey[] = ['student', 'installment', 'dueDate', 'balance', 'status']

export type DueExportFormat = 'word' | 'pdf' | 'excel'

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function knownColumns(raw: string[] | undefined): DueExportKey[] {
  const allowed = new Set<string>(DUE_EXPORT_KEYS)
  const list = (raw || []).filter((key): key is DueExportKey => allowed.has(key))
  return list.length ? list : [...DEFAULT_KEYS]
}

async function loadPrintLayout(locale: 'en' | 'ar'): Promise<{ columns: DueExportKey[]; html: string | null }> {
  const config = await reportExportService.getExport('due-installments', locale).catch(() => null)
  const columns = knownColumns(config?.columns)
  let html = config?.template_html?.trim() ? fillReportDate(config.template_html, locale) : null
  if (!html) {
    const templates = await reportExportService.listTemplates().catch(() => [])
    const chosen = templates.find((item) => item.is_default) || templates[0]
    if (chosen) {
      const row = await reportExportService.getTemplate(chosen.id).catch(() => null)
      const raw = row ? (locale === 'ar' ? row.html_ar || row.html_en : row.html_en) : ''
      if (raw.trim()) html = fillReportDate(raw, locale)
    }
  }
  return { columns, html }
}

function tableBody(
  rows: DueInstallmentRow[],
  columns: DueExportKey[],
  title: string,
  subtitle: string,
  header: (key: DueExportKey) => string,
  cell: (row: DueInstallmentRow, key: DueExportKey) => string,
) {
  const head = columns.map((key) => `<th>${escapeHtml(header(key))}</th>`).join('')
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((key) => `<td>${escapeHtml(cell(row, key))}</td>`).join('')}</tr>`,
    )
    .join('')
  return `<h1>${escapeHtml(title)}</h1><div class="meta">${escapeHtml(subtitle)}</div><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`
}

function rowHtml(
  rows: DueInstallmentRow[],
  columns: DueExportKey[],
  cell: (row: DueInstallmentRow, key: DueExportKey) => string,
) {
  return rows
    .map(
      (row) =>
        `<tr>${columns.map((key) => `<td>${escapeHtml(cell(row, key))}</td>`).join('')}</tr>`,
    )
    .join('')
}

async function filledDocument(options: {
  rows: DueInstallmentRow[]
  columns: DueExportKey[]
  layoutHtml: string | null
  locale: 'en' | 'ar'
  title: string
  subtitle: string
  header: (key: DueExportKey) => string
  cell: (row: DueInstallmentRow, key: DueExportKey) => string
}) {
  const rowKeys = options.columns
  let layoutHtml = options.layoutHtml
  if (layoutHtml && reportLayoutUsesRowSlot(layoutHtml)) {
    layoutHtml = alignReportTableColumns(
      layoutHtml,
      rowKeys.map((key) => ({ key, label: options.header(key) })),
    )
  }
  const rowsMarkup = reportLayoutUsesRowSlot(layoutHtml)
    ? rowHtml(options.rows, rowKeys, options.cell)
    : tableBody(options.rows, rowKeys, options.title, options.subtitle, options.header, options.cell)
  let inner = applyExportLayout(layoutHtml, rowsMarkup)
  if (
    layoutHtml &&
    /\{\{\s*schoolName\s*\}\}/i.test(layoutHtml) &&
    reportLayoutUsesRowSlot(layoutHtml)
  ) {
    const schoolId = authService.getStoredUser()?.school_id
    try {
      const branded = await reportExportService.previewTemplate({
        locale: options.locale,
        html: layoutHtml,
        sample_content: rowHtml(options.rows, rowKeys, options.cell),
        ...(schoolId ? { school_id: String(schoolId) } : {}),
      })
      if (branded.html?.trim()) inner = branded.html
    } catch {
      /* letterhead may be blank; the table is still in the page */
    }
  }
  return inner
}

async function downloadPdf(inner: string, layoutHtml: string | null, rtl: boolean, filename: string) {
  const orient = reportPageOrientation(layoutHtml || inner)
  const pagePx = reportPagePixelSize(orient)
  const reportPage = isReportPageHtml(layoutHtml) || isReportPageHtml(inner)
  const host = document.createElement('div')
  host.setAttribute('dir', rtl ? 'rtl' : 'ltr')
  host.style.cssText = reportPage
    ? `position:fixed;left:-12000px;top:0;width:${pagePx.width}px;padding:0;background:#ffffff;z-index:-1;`
    : 'position:fixed;left:-12000px;top:0;width:794px;padding:20px;background:#ffffff;z-index:-1;'
  host.innerHTML = reportPage
    ? `<style>.rpt-sheet{zoom:1!important;margin:0!important;box-shadow:none!important;width:${pagePx.width}px!important;min-height:${pagePx.height}px!important;}</style>${reportPageFragment(inner)}`
    : inner
  document.body.appendChild(host)
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()))
  try {
    const { default: html2canvas } = await import('html2canvas')
    const { jsPDF } = await import('jspdf')
    const canvas = await html2canvas(host, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: reportPage ? orient : 'portrait',
      unit: 'mm',
      format: 'a4',
    })
    const pageW = pdf.internal.pageSize.getWidth()
    const pageH = pdf.internal.pageSize.getHeight()
    const imgW = pageW
    const imgH = (canvas.height * imgW) / canvas.width
    let heightLeft = imgH
    let y = 0
    pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
    heightLeft -= pageH
    while (heightLeft > 0) {
      y -= pageH
      pdf.addPage()
      pdf.addImage(imgData, 'PNG', 0, y, imgW, imgH)
      heightLeft -= pageH
    }
    pdf.save(`${filename}.pdf`)
  } finally {
    host.remove()
  }
}

function downloadExcel(
  rows: DueInstallmentRow[],
  columns: DueExportKey[],
  title: string,
  subtitle: string,
  rtl: boolean,
  filename: string,
  header: (key: DueExportKey) => string,
  cell: (row: DueInstallmentRow, key: DueExportKey) => string,
) {
  const grid = [
    [title],
    [subtitle],
    [],
    columns.map((key) => header(key)),
    ...rows.map((row) => columns.map((key) => cell(row, key))),
  ]
  return import('xlsx').then((XLSX) => {
    const ws = XLSX.utils.aoa_to_sheet(grid)
    if (rtl) {
      ;(ws as { '!views'?: { RTL?: boolean }[] })['!views'] = [{ RTL: true }]
    }
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'Due')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  })
}

/** Print the due/late rows in the school's report template (same path as the student list). */
export async function exportDueInstallmentsPrint(options: {
  format: DueExportFormat
  rows: DueInstallmentRow[]
  locale: 'en' | 'ar'
  rtl: boolean
  title: string
  subtitle: string
  filename: string
  header: (key: DueExportKey) => string
  cell: (row: DueInstallmentRow, key: DueExportKey) => string
}): Promise<'empty' | 'ok'> {
  if (!options.rows.length) return 'empty'
  const { columns, html } = await loadPrintLayout(options.locale)
  if (options.format === 'excel') {
    await downloadExcel(
      options.rows,
      columns,
      options.title,
      options.subtitle,
      options.rtl,
      options.filename,
      options.header,
      options.cell,
    )
    return 'ok'
  }
  const inner = await filledDocument({
    rows: options.rows,
    columns,
    layoutHtml: html,
    locale: options.locale,
    title: options.title,
    subtitle: options.subtitle,
    header: options.header,
    cell: options.cell,
  })
  if (options.format === 'word') {
    const doc = /<html[\s>]/i.test(inner)
      ? inner
      : `<!DOCTYPE html><html lang="${options.locale}"><head><meta charset="utf-8"><title>${escapeHtml(options.title)}</title></head><body>${inner}</body></html>`
    const blob = new Blob(['\ufeff', doc], { type: 'application/msword;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${options.filename}.doc`
    link.click()
    URL.revokeObjectURL(url)
    return 'ok'
  }
  await downloadPdf(inner, html, options.rtl, options.filename)
  return 'ok'
}
