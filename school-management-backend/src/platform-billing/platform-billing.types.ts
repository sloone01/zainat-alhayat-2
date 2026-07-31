export const PLATFORM_BILLING_PERIODS = [
  'monthly',
  'semester',
  'yearly',
  'summer',
] as const;

export type PlatformBillingPeriod = (typeof PLATFORM_BILLING_PERIODS)[number];

export const PLATFORM_SUBSCRIPTION_STATUSES = [
  'draft',
  'active',
  'past_due',
  'cancelled',
] as const;

export type PlatformSubscriptionStatus =
  (typeof PLATFORM_SUBSCRIPTION_STATUSES)[number];

export const PLATFORM_INVOICE_STATUSES = [
  'draft',
  'issued',
  'paid',
  'void',
] as const;

export type PlatformInvoiceStatus = (typeof PLATFORM_INVOICE_STATUSES)[number];

/** Months added to period_start for each billing period. */
export const PLATFORM_PERIOD_MONTHS: Record<PlatformBillingPeriod, number> = {
  monthly: 1,
  semester: 6,
  yearly: 12,
  summer: 3,
};

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export function computePeriodEnd(
  start: Date,
  period: PlatformBillingPeriod,
): Date {
  return addMonths(start, PLATFORM_PERIOD_MONTHS[period]);
}
