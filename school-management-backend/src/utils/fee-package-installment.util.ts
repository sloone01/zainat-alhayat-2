export type DerivedInstallmentRow = {
  sequence: number;
  month_number: number | null;
  label: string | null;
  amount: number;
};

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

function roundInstallmentUp(per: number): number {
  if (per >= 50) return Math.ceil(per / 10) * 10;
  return Math.ceil(per * 100) / 100;
}

export function splitInstallmentAmounts(
  total: number,
  downpayment: number,
  count: number,
): number[] {
  const remaining = roundMoney(Math.max(0, total - downpayment));
  if (count <= 0) return [];
  if (count === 1) return [remaining];
  const per = remaining / count;
  const roundedUp = roundInstallmentUp(per);
  const amounts: number[] = [];
  let paid = 0;
  for (let i = 0; i < count - 1; i++) {
    amounts.push(roundedUp);
    paid = roundMoney(paid + roundedUp);
  }
  amounts.push(roundMoney(remaining - paid));
  return amounts;
}

function clampCalendarMonth(n: number): number {
  if (!Number.isFinite(n)) return 1;
  const r = Math.round(n);
  if (r < 1) return 1;
  if (r > 12) return 12;
  return r;
}

function nextCalendarMonth(m: number): number {
  return m >= 12 ? 1 : m + 1;
}

export function buildDefaultScheduleMonths(count: number, startMonth = 1): number[] {
  const months: number[] = [];
  let m = clampCalendarMonth(startMonth);
  for (let i = 0; i < count; i++) {
    months.push(m);
    m = nextCalendarMonth(m);
  }
  return months;
}

/** Build profile installments from yearly total + fee-package period settings. */
export function deriveInstallmentsFromPeriodSetting(
  yearTotal: number,
  downpaymentAmount: number,
  scheduleMonths: number[] | null | undefined,
  options?: { downpaymentLabel?: string },
): DerivedInstallmentRow[] {
  const total = roundMoney(Math.max(0, yearTotal));
  const dp = roundMoney(Math.max(0, downpaymentAmount));
  const months = Array.isArray(scheduleMonths)
    ? scheduleMonths
        .map((m) => clampCalendarMonth(Number(m)))
        .filter((m) => Number.isFinite(m))
    : [];

  const rows: DerivedInstallmentRow[] = [];
  let seq = 1;

  if (dp > 0) {
    rows.push({
      sequence: seq++,
      month_number: months[0] ?? 1,
      label: options?.downpaymentLabel ?? 'Advance payment',
      amount: dp,
    });
  }

  const monthList =
    months.length > 0 ? months : total > dp ? buildDefaultScheduleMonths(10) : [];

  if (monthList.length > 0 && total > dp) {
    const amounts = splitInstallmentAmounts(total, dp, monthList.length);
    monthList.forEach((month, idx) => {
      const amt = amounts[idx] ?? 0;
      if (amt <= 0) return;
      rows.push({
        sequence: seq++,
        month_number: month,
        label: null,
        amount: amt,
      });
    });
  }

  return rows;
}
