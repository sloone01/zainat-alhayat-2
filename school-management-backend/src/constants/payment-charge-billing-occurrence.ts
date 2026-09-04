/** How often a charge type applies to a student (metadata only until billing rules use it). */
export const PAYMENT_CHARGE_BILLING_OCCURRENCES = ['per_year', 'once_ever', 'other'] as const;

export type PaymentChargeBillingOccurrence = (typeof PAYMENT_CHARGE_BILLING_OCCURRENCES)[number];

export const DEFAULT_PAYMENT_CHARGE_BILLING_OCCURRENCE: PaymentChargeBillingOccurrence = 'per_year';

export function isPaymentChargeBillingOccurrence(value: unknown): value is PaymentChargeBillingOccurrence {
  return (
    typeof value === 'string' &&
    (PAYMENT_CHARGE_BILLING_OCCURRENCES as readonly string[]).includes(value)
  );
}
