export const DUE_INSTALLMENT_EXPORT_COLUMN_KEYS = [
  'student',
  'installment',
  'dueDate',
  'balance',
  'status',
  'amountDue',
  'amountPaid',
  'daysOverdue',
] as const;

export type DueInstallmentExportColumnKey = (typeof DUE_INSTALLMENT_EXPORT_COLUMN_KEYS)[number];

export const DEFAULT_DUE_INSTALLMENT_EXPORT_COLUMNS: DueInstallmentExportColumnKey[] = [
  'student',
  'installment',
  'dueDate',
  'balance',
  'status',
];

export function normalizeDueInstallmentExportColumns(raw: unknown): DueInstallmentExportColumnKey[] {
  const allowed = new Set<string>(DUE_INSTALLMENT_EXPORT_COLUMN_KEYS);
  const list = Array.isArray(raw)
    ? raw.map((v) => String(v).trim()).filter((k) => allowed.has(k))
    : [];
  const unique = [...new Set(list)] as DueInstallmentExportColumnKey[];
  return unique.length ? unique : [...DEFAULT_DUE_INSTALLMENT_EXPORT_COLUMNS];
}
