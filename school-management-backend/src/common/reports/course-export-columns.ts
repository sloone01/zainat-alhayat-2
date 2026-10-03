export const COURSE_EXPORT_COLUMN_KEYS = [
  'title',
  'category',
  'status',
  'phases',
  'milestones',
] as const;

export type CourseExportColumnKey = (typeof COURSE_EXPORT_COLUMN_KEYS)[number];

export const DEFAULT_COURSE_EXPORT_COLUMNS: CourseExportColumnKey[] = [
  'title',
  'category',
  'status',
  'phases',
  'milestones',
];

export function normalizeCourseExportColumns(raw: unknown): CourseExportColumnKey[] {
  const allowed = new Set<string>(COURSE_EXPORT_COLUMN_KEYS);
  const list = Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter((k) => allowed.has(k))
    : [];
  const unique = [...new Set(list)] as CourseExportColumnKey[];
  return unique.length ? unique : [...DEFAULT_COURSE_EXPORT_COLUMNS];
}
