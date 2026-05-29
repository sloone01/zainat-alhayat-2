export type LevelBillingPeriod = 'monthly' | 'semester' | 'yearly'

export const LEVEL_BILLING_PERIODS: LevelBillingPeriod[] = ['monthly', 'semester', 'yearly']

export type DerivedInstallmentRow = {
  sequence: number
  month_number: number | null
  label: string | null
  amount: number
}

export function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000
}

function roundInstallmentUp(per: number): number {
  if (per >= 50) return Math.ceil(per / 10) * 10
  return Math.ceil(per * 100) / 100
}

export function splitInstallmentAmounts(total: number, downpayment: number, count: number): number[] {
  const remaining = roundMoney(Math.max(0, total - downpayment))
  if (count <= 0) return []
  if (count === 1) return [remaining]
  const per = remaining / count
  const roundedUp = roundInstallmentUp(per)
  const amounts: number[] = []
  let paid = 0
  for (let i = 0; i < count - 1; i++) {
    amounts.push(roundedUp)
    paid = roundMoney(paid + roundedUp)
  }
  amounts.push(roundMoney(remaining - paid))
  return amounts
}

function clampCalendarMonth(n: number): number {
  if (!Number.isFinite(n)) return 1
  const r = Math.round(n)
  if (r < 1) return 1
  if (r > 12) return 12
  return r
}

function nextCalendarMonth(m: number): number {
  return m >= 12 ? 1 : m + 1
}

export function buildDefaultScheduleMonths(count: number, startMonth = 1): number[] {
  const months: number[] = []
  let mo = clampCalendarMonth(startMonth)
  for (let i = 0; i < count; i++) {
    months.push(mo)
    mo = nextCalendarMonth(mo)
  }
  return months
}

export function defaultScheduleMonthsForPeriod(period: LevelBillingPeriod): number[] {
  if (period === 'monthly') return [1]
  if (period === 'semester') return buildDefaultScheduleMonths(4)
  return buildDefaultScheduleMonths(10)
}

export function emptyPeriodMaps(): {
  downpayment: Record<LevelBillingPeriod, string>
  installmentMonths: Record<LevelBillingPeriod, number>
  scheduleMonths: Record<LevelBillingPeriod, number[]>
} {
  return {
    downpayment: { monthly: '', semester: '', yearly: '' },
    installmentMonths: { monthly: 1, semester: 4, yearly: 10 },
    scheduleMonths: {
      monthly: [1],
      semester: buildDefaultScheduleMonths(4),
      yearly: buildDefaultScheduleMonths(10),
    },
  }
}

export type PackageLevelPeriodSettingRow = {
  level_id: string
  billing_period?: LevelBillingPeriod | string | null
  downpayment_amount: number
  installment_schedule_months?: number[] | null
}

/** Same hydration as fee-package level picker — package rows + defaults per period total. */
export function hydratePeriodMapsFromPackageLevel(
  levelId: string,
  settings: PackageLevelPeriodSettingRow[],
  totalsByPeriod?: Partial<Record<LevelBillingPeriod, number>>,
): ReturnType<typeof emptyPeriodMaps> {
  const maps = emptyPeriodMaps()
  const normId = String(levelId ?? '').trim()
  if (!normId) return maps

  const byPeriod = new Map<LevelBillingPeriod, PackageLevelPeriodSettingRow>()
  for (const s of settings) {
    if (String(s.level_id ?? '').trim() !== normId) continue
    const period = (s.billing_period ?? 'yearly') as LevelBillingPeriod
    if (!LEVEL_BILLING_PERIODS.includes(period)) continue
    byPeriod.set(period, s)
  }

  for (const period of LEVEL_BILLING_PERIODS) {
    const stored = byPeriod.get(period)
    if (stored) {
      maps.downpayment[period] =
        Number(stored.downpayment_amount) > 0 ? String(stored.downpayment_amount) : ''
      const months =
        stored.installment_schedule_months?.length
          ? stored.installment_schedule_months.map((m) => Math.round(Number(m)))
          : defaultScheduleMonthsForPeriod(period)
      maps.scheduleMonths[period] = months.filter((m) => m >= 1 && m <= 12)
      maps.installmentMonths[period] =
        maps.scheduleMonths[period].length || (period === 'monthly' ? 1 : period === 'semester' ? 4 : 10)
      continue
    }
    const total = totalsByPeriod?.[period] ?? 0
    if (total > 0) {
      const months = defaultScheduleMonthsForPeriod(period)
      maps.scheduleMonths[period] = months
      maps.installmentMonths[period] = months.length
    }
  }

  return maps
}

export function deriveInstallmentRowsFromPeriod(
  total: number,
  downpaymentAmount: number,
  scheduleMonths: number[] | null | undefined,
  options?: { downpaymentLabel?: string },
): DerivedInstallmentRow[] {
  const t = roundMoney(Math.max(0, total))
  const dp = roundMoney(Math.max(0, downpaymentAmount))
  const months = Array.isArray(scheduleMonths)
    ? scheduleMonths.map((m) => clampCalendarMonth(Number(m))).filter((m) => Number.isFinite(m))
    : []

  const rows: DerivedInstallmentRow[] = []
  let seq = 1

  if (dp > 0) {
    rows.push({
      sequence: seq++,
      month_number: months[0] ?? 1,
      label: options?.downpaymentLabel ?? 'Advance payment',
      amount: dp,
    })
  }

  const monthList = months.length > 0 ? months : t > dp ? buildDefaultScheduleMonths(10) : []

  if (monthList.length > 0 && t > dp) {
    const amounts = splitInstallmentAmounts(t, dp, monthList.length)
    monthList.forEach((month, idx) => {
      const amt = amounts[idx] ?? 0
      if (amt <= 0) return
      rows.push({
        sequence: seq++,
        month_number: month,
        label: null,
        amount: amt,
      })
    })
  }

  return rows
}

export function scheduleRowsForPeriod(
  period: LevelBillingPeriod,
  periodTotal: number,
  downpaymentRaw: string,
  installmentMonthCount: number,
  scheduleMonths: number[],
): Array<{ index: number; month: number; amount: number }> {
  const count =
    period === 'monthly' ? 1 : Math.max(1, Math.min(36, Math.round(installmentMonthCount) || 1))
  const dp = parseAmount(downpaymentRaw)
  const months =
    scheduleMonths.length === count
      ? scheduleMonths
      : buildDefaultScheduleMonths(count, scheduleMonths[0] ?? 1)
  const amounts = splitInstallmentAmounts(periodTotal, dp, count)
  return months.map((month, index) => ({
    index,
    month,
    amount: amounts[index] ?? 0,
  }))
}

export function scheduleTotalForPeriod(
  periodTotal: number,
  downpaymentRaw: string,
  installmentMonthCount: number,
  scheduleMonths: number[],
  period: LevelBillingPeriod,
): number {
  const rows = scheduleRowsForPeriod(
    period,
    periodTotal,
    downpaymentRaw,
    installmentMonthCount,
    scheduleMonths,
  )
  const dp = parseAmount(downpaymentRaw)
  const inst = rows.reduce((s, r) => roundMoney(s + r.amount), 0)
  return roundMoney(dp + inst)
}

export function parseAmount(raw: string): number {
  const v = String(raw ?? '')
    .trim()
    .replace(/,/g, '.')
  if (!v || v === '.') return 0
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function formatMoney(n: number): string {
  return roundMoney(n).toFixed(2)
}

/** Map flat profile installments into per-period editor state (yearly + semester). */
export function installmentsToPeriodMaps(
  installments: Array<{
    sequence: number
    month_number: number | null
    label: string | null
    amount: string | number
  }>,
  downpaymentLabel = 'advance',
): ReturnType<typeof emptyPeriodMaps> {
  const maps = emptyPeriodMaps()
  const sorted = [...installments].sort((a, b) => a.sequence - b.sequence)
  const advance = sorted.find((i) =>
    String(i.label ?? '')
      .toLowerCase()
      .includes(downpaymentLabel.toLowerCase()),
  )
  const regular = sorted.filter((i) => i !== advance && parseAmount(String(i.amount)) > 0)

  if (advance) {
    maps.downpayment.yearly = String(advance.amount)
  }
  if (regular.length) {
    maps.scheduleMonths.yearly = regular
      .map((i) => (i.month_number != null ? Math.round(Number(i.month_number)) : 0))
      .filter((m) => m >= 1 && m <= 12)
    maps.installmentMonths.yearly = maps.scheduleMonths.yearly.length || 10
  }

  return maps
}
