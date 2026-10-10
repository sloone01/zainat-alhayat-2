import reportExportService from '@/services/report-export.service'
import type { Course } from '@/services/course.service'

export const COURSE_EXPORT_KEYS = ['title', 'category', 'status', 'phases', 'milestones'] as const

export type CourseExportKey = (typeof COURSE_EXPORT_KEYS)[number]

const DEFAULT_KEYS: CourseExportKey[] = [...COURSE_EXPORT_KEYS]

export type CourseExportFormat = 'word' | 'pdf' | 'excel'

function knownColumns(raw: string[] | undefined): CourseExportKey[] {
  const allowed = new Set<string>(COURSE_EXPORT_KEYS)
  const list = (raw || []).filter((key): key is CourseExportKey => allowed.has(key))
  return list.length ? list : [...DEFAULT_KEYS]
}

async function loadExcelColumns(locale: 'en' | 'ar'): Promise<CourseExportKey[]> {
  const config = await reportExportService.getExport('courses', locale).catch(() => null)
  return knownColumns(config?.columns)
}

function downloadExcel(
  rows: Course[],
  columns: CourseExportKey[],
  title: string,
  subtitle: string,
  rtl: boolean,
  filename: string,
  header: (key: CourseExportKey) => string,
  cell: (row: Course, key: CourseExportKey) => string,
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
    XLSX.utils.book_append_sheet(wb, ws, 'Courses')
    XLSX.writeFile(wb, `${filename}.xlsx`)
  })
}

/** Excel uses the chosen columns. Word and PDF fill the built-in Word template. */
export async function exportCourseList(options: {
  format: CourseExportFormat
  rows: Course[]
  locale: 'en' | 'ar'
  rtl: boolean
  title: string
  subtitle: string
  filename: string
  header: (key: CourseExportKey) => string
  cell: (row: Course, key: CourseExportKey) => string
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
  const labels = Object.fromEntries(COURSE_EXPORT_KEYS.map((key) => [key, options.header(key)]))
  const payloadRows = options.rows.map((row) =>
    Object.fromEntries(COURSE_EXPORT_KEYS.map((key) => [key, options.cell(row, key)])),
  )
  const buffer = await reportExportService.downloadCourseDocument({
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
