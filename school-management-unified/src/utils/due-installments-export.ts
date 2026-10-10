import reportExportService from '@/services/report-export.service'
import type { DueInstallmentRow } from '@/services/fees-v2.service'

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

function knownColumns(raw: string[] | undefined): DueExportKey[] {
  const allowed = new Set<string>(DUE_EXPORT_KEYS)
  const list = (raw || []).filter((key): key is DueExportKey => allowed.has(key))
  return list.length ? list : [...DEFAULT_KEYS]
}

async function loadExcelColumns(locale: 'en' | 'ar'): Promise<DueExportKey[]> {
  const config = await reportExportService.getExport('due-installments', locale).catch(() => null)
  return knownColumns(config?.columns)
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

/** Excel uses the chosen columns. Word and PDF fill the super-admin Word template. */
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
  const columns = await loadExcelColumns(options.locale)
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
  const labels = Object.fromEntries(DUE_EXPORT_KEYS.map((key) => [key, options.header(key)]))
  const payloadRows = options.rows.map((row) =>
    Object.fromEntries(DUE_EXPORT_KEYS.map((key) => [key, options.cell(row, key)])),
  )
  const buffer = await reportExportService.downloadDueDocument({
    format: options.format === 'pdf' ? 'pdf' : 'docx',
    locale: options.locale,
    title: options.title,
    subtitle: options.subtitle,
    labels,
    rows: payloadRows,
  })
  const blob = new Blob([buffer], {
    type: options.format === 'pdf'
      ? 'application/pdf'
      : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${options.filename}.${options.format === 'pdf' ? 'pdf' : 'docx'}`
  link.click()
  URL.revokeObjectURL(url)
  return 'ok'
}
