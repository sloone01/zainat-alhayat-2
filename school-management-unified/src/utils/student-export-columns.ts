export const STUDENT_EXPORT_COLUMN_KEYS = [
  'name',
  'age',
  'group',
  'bus',
  'parent',
  'enrollmentDate',
  'status',
  'civilId',
  'gender',
  'dateOfBirth',
  'nationality',
  'studentId',
  'emergencyContact',
  'email',
] as const

export type StudentExportColumnKey = (typeof STUDENT_EXPORT_COLUMN_KEYS)[number]

export const DEFAULT_STUDENT_EXPORT_COLUMNS: StudentExportColumnKey[] = [
  'name',
  'age',
  'group',
  'bus',
  'parent',
  'enrollmentDate',
  'status',
]

export function normalizeStudentExportColumns(raw: unknown): StudentExportColumnKey[] {
  const allowed = new Set<string>(STUDENT_EXPORT_COLUMN_KEYS)
  const list = Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter((k) => allowed.has(k))
    : []
  const unique = [...new Set(list)] as StudentExportColumnKey[]
  return unique.length ? unique : [...DEFAULT_STUDENT_EXPORT_COLUMNS]
}

/** Inject table HTML into a report shell at {{content}}. Print-page shells own the table look. */
export function applyExportLayout(layoutHtml: string | null | undefined, bodyHtml: string): string {
  const layout = (layoutHtml ?? '').trim()
  let body = (bodyHtml ?? '').trim()
  if (!layout) return body
  if (!/\{\{\s*content\s*\}\}/i.test(layout)) return `${layout}\n${body}`
  if (/\brpt-page\b/.test(layout)) {
    body = body.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
  }
  return layout.replace(/\{\{\s*content\s*\}\}/gi, body)
}
