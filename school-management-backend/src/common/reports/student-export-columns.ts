/** Canonical student-list export column keys (short display name = first+second+family). */
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
] as const;

export type StudentExportColumnKey = (typeof STUDENT_EXPORT_COLUMN_KEYS)[number];

export const DEFAULT_STUDENT_EXPORT_COLUMNS: StudentExportColumnKey[] = [
  'name',
  'age',
  'group',
  'bus',
  'parent',
  'enrollmentDate',
  'status',
];

export function normalizeStudentExportColumns(raw: unknown): StudentExportColumnKey[] {
  const allowed = new Set<string>(STUDENT_EXPORT_COLUMN_KEYS);
  const list = Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter((k) => allowed.has(k))
    : [];
  const unique = [...new Set(list)] as StudentExportColumnKey[];
  return unique.length ? unique : [...DEFAULT_STUDENT_EXPORT_COLUMNS];
}
