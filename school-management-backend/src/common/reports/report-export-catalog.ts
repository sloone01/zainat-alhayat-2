import {
  DEFAULT_DUE_INSTALLMENT_EXPORT_COLUMNS,
  DUE_INSTALLMENT_EXPORT_COLUMN_KEYS,
  normalizeDueInstallmentExportColumns,
} from './due-installment-export-columns';
import {
  COURSE_EXPORT_COLUMN_KEYS,
  DEFAULT_COURSE_EXPORT_COLUMNS,
  normalizeCourseExportColumns,
} from './course-export-columns';
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
  {
    key: 'due-installments',
    nameEn: 'Due and late payments',
    nameAr: 'المستحق والمتأخر',
    sourcePath: '/reports/financial',
    availableColumns: DUE_INSTALLMENT_EXPORT_COLUMN_KEYS,
    defaultColumns: DEFAULT_DUE_INSTALLMENT_EXPORT_COLUMNS,
    normalizeColumns: (raw) => normalizeDueInstallmentExportColumns(raw) as string[],
  },
  {
    key: 'courses',
    nameEn: 'Course list',
    nameAr: 'قائمة المقررات',
    sourcePath: '/courses',
    availableColumns: COURSE_EXPORT_COLUMN_KEYS,
    defaultColumns: DEFAULT_COURSE_EXPORT_COLUMNS,
    normalizeColumns: (raw) => normalizeCourseExportColumns(raw) as string[],
  },
];

export function getReportExportDefinition(key: string): ReportExportDefinition | undefined {
  return REPORT_EXPORT_DEFINITIONS.find((d) => d.key === key);
}

export type { StudentExportColumnKey };
