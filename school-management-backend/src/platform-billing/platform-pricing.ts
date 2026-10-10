import type {
  PlatformBillingPeriod,
  PlatformDiscountKind,
  PlatformDiscountType,
} from './platform-billing.types';

export interface PlanRate {
  minimum: number;
  perStudent: number;
}

export interface DiscountRule {
  id: string;
  kind: PlatformDiscountKind;
  discount_type: PlatformDiscountType;
  value: number;
  plan_id: string | null;
  school_id: string | null;
  billing_periods: PlatformBillingPeriod[];
  starts_on: string | null;
  ends_on: string | null;
  is_active: boolean;
}

export interface DiscountContext {
  planId: string;
  period: PlatformBillingPeriod;
  schoolId: string;
  promoDiscountId: string | null;
  /** YYYY-MM-DD */
  today: string;
}

export function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}

/** Package price for a period: the minimum fee or rate × students, whichever is higher. */
export function packageAmount(rate: PlanRate, students: number): number {
  return round3(Math.max(rate.minimum, rate.perStudent * Math.max(0, students)));
}

function dayNumber(date: string): number {
  return Math.floor(Date.parse(`${date.slice(0, 10)}T00:00:00Z`) / 86_400_000);
}

/** Share of the period still ahead of `today` (0–1). */
export function remainingFraction(periodStart: string, periodEnd: string, today: string): number {
  const total = dayNumber(periodEnd) - dayNumber(periodStart);
  if (!(total > 0)) return 0;
  const left = dayNumber(periodEnd) - dayNumber(today);
  return Math.min(1, Math.max(0, left / total));
}

/** Prorated top-up when the active student count grows past what was already billed. */
export function prorationAmount(
  rate: PlanRate,
  billedStudents: number,
  students: number,
  fraction: number,
): number {
  if (students <= billedStudents) return 0;
  const delta = packageAmount(rate, students) - packageAmount(rate, billedStudents);
  return round3(Math.max(0, delta * fraction));
}

/** Validity window and scope only; promo redemption limits are checked when the code is redeemed. */
export function discountApplies(d: DiscountRule, ctx: DiscountContext): boolean {
  if (!d.is_active) return false;
  if (d.plan_id && d.plan_id !== ctx.planId) return false;
  if (d.billing_periods?.length && !d.billing_periods.includes(ctx.period)) return false;
  if (d.kind !== 'promo') {
    if (d.starts_on && ctx.today < d.starts_on) return false;
    if (d.ends_on && ctx.today > d.ends_on) return false;
  }
  if (d.kind === 'school') return d.school_id === ctx.schoolId;
  if (d.kind === 'promo') return d.id === ctx.promoDiscountId;
  return true;
}

export function discountAmount(
  d: Pick<DiscountRule, 'discount_type' | 'value'>,
  base: number,
): number {
  if (base <= 0) return 0;
  if (d.discount_type === 'percent') {
    const pct = Math.min(100, Math.max(0, d.value));
    return round3((base * pct) / 100);
  }
  return round3(Math.min(Math.max(0, d.value), base));
}

/**
 * Discounts do not stack: the one that saves the most wins.
 * Fixed discounts are per period, so prorated top-ups only take percent discounts.
 */
export function bestDiscount<T extends DiscountRule>(
  rules: T[],
  ctx: DiscountContext,
  base: number,
  opts: { percentOnly?: boolean } = {},
): { discount: T; amount: number } | null {
  let best: { discount: T; amount: number } | null = null;
  for (const rule of rules) {
    if (opts.percentOnly && rule.discount_type !== 'percent') continue;
    if (!discountApplies(rule, ctx)) continue;
    const amount = discountAmount(rule, base);
    if (amount > 0 && (!best || amount > best.amount)) best = { discount: rule, amount };
  }
  return best;
}
