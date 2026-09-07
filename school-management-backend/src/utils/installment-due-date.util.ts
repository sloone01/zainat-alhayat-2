function asUtcDate(value: Date | string): Date {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()));
  }
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split('-').map((n) => Number(n));
  if (!y || !m || !d) return new Date(NaN);
  return new Date(Date.UTC(y, m - 1, d));
}

export function lastDayOfMonth(year: number, month1to12: number): number {
  return new Date(Date.UTC(year, month1to12, 0)).getUTCDate();
}

export function clampDueDay(dueDay: number | null | undefined, lastDay: number): number {
  if (dueDay == null || dueDay < 1) return lastDay;
  return Math.min(Math.floor(dueDay), lastDay);
}

export function resolveInstallmentCalendarYear(
  yearStart: Date | string,
  yearEnd: Date | string,
  monthNumber: number,
): number {
  const start = asUtcDate(yearStart);
  const end = asUtcDate(yearEnd);
  const startY = start.getUTCFullYear();
  const endY = end.getUTCFullYear();
  if (startY === endY) return startY;
  const startMonth = start.getUTCMonth() + 1;
  return monthNumber >= startMonth ? startY : endY;
}

export function computeInstallmentDueDate(
  yearStart: Date | string,
  yearEnd: Date | string,
  monthNumber: number | null | undefined,
  dueDay: number | null | undefined,
): Date | null {
  if (!monthNumber || monthNumber < 1 || monthNumber > 12) return null;
  const year = resolveInstallmentCalendarYear(yearStart, yearEnd, monthNumber);
  const last = lastDayOfMonth(year, monthNumber);
  const day = clampDueDay(dueDay, last);
  return new Date(Date.UTC(year, monthNumber - 1, day));
}

export function formatDueDateYmd(d: Date): string {
  return d.toISOString().slice(0, 10);
}
