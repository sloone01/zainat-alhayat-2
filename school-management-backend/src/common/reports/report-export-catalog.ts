import {
  DEFAULT_STUDENT_EXPORT_COLUMNS,
  STUDENT_EXPORT_COLUMN_KEYS,
  normalizeStudentExportColumns,
  type StudentExportColumnKey,
} from './student-export-columns';

export type ReportExportDefinition = {
  key: string;
  nameEn: string;
  nameAr: string;
  sourcePath: string;
  availableColumns: readonly string[];
  defaultColumns: readonly string[];
  normalizeColumns: (raw: unknown) => string[];
};

export const REPORT_EXPORT_DEFINITIONS: ReportExportDefinition[] = [
  {
    key: 'students',
    nameEn: 'Student list',
    nameAr: 'قائمة الطلاب',
    sourcePath: '/students',
    availableColumns: STUDENT_EXPORT_COLUMN_KEYS,
    defaultColumns: DEFAULT_STUDENT_EXPORT_COLUMNS,
    normalizeColumns: (raw) => normalizeStudentExportColumns(raw) as string[],
  },
];

export function getReportExportDefinition(key: string): ReportExportDefinition | undefined {
  return REPORT_EXPORT_DEFINITIONS.find((d) => d.key === key);
}

export type { StudentExportColumnKey };
