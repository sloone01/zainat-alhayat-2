import {
  bestDiscount,
  discountAmount,
  discountApplies,
  packageAmount,
  prorationAmount,
  remainingFraction,
  type DiscountContext,
  type DiscountRule,
} from './platform-pricing';

const rate = { minimum: 100, perStudent: 1.5 };

const ctx: DiscountContext = {
  planId: 'plan-a',
  period: 'yearly',
  schoolId: 'school-1',
  promoDiscountId: null,
  today: '2026-10-09',
};

function rule(over: Partial<DiscountRule>): DiscountRule {
  return {
    id: 'd1',
    kind: 'package',
    discount_type: 'percent',
    value: 10,
    plan_id: null,
    school_id: null,
    billing_periods: [],
    starts_on: null,
    ends_on: null,
    is_active: true,
    ...over,
  };
}

describe('packageAmount', () => {
  it('charges the minimum until rate × students passes it', () => {
    expect(packageAmount(rate, 0)).toBe(100);
    expect(packageAmount(rate, 60)).toBe(100);
    expect(packageAmount(rate, 200)).toBe(300);
  });
});

describe('remainingFraction', () => {
  it('is the share of days left in the period', () => {
    expect(remainingFraction('2026-01-01', '2026-01-11', '2026-01-06')).toBeCloseTo(0.5);
  });

  it('clamps outside the period', () => {
    expect(remainingFraction('2026-01-01', '2026-01-11', '2025-12-01')).toBe(1);
    expect(remainingFraction('2026-01-01', '2026-01-11', '2026-02-01')).toBe(0);
  });
});

describe('prorationAmount', () => {
  it('bills only the growth above what was already billed', () => {
    // 200 → 300 students: 300 → 450 OMR, half the period left.
    expect(prorationAmount(rate, 200, 300, 0.5)).toBe(75);
  });

  it('is zero while the minimum still covers the school', () => {
    expect(prorationAmount(rate, 10, 60, 1)).toBe(0);
  });

  it('is zero when the count did not grow', () => {
    expect(prorationAmount(rate, 300, 250, 1)).toBe(0);
  });
});

describe('discountAmount', () => {
  it('applies percent and caps fixed at the base', () => {
    expect(discountAmount({ discount_type: 'percent', value: 15 }, 200)).toBe(30);
    expect(discountAmount({ discount_type: 'fixed', value: 500 }, 200)).toBe(200);
  });
});

describe('discountApplies', () => {
  it('respects plan, period and date window', () => {
    expect(discountApplies(rule({ plan_id: 'plan-b' }), ctx)).toBe(false);
    expect(discountApplies(rule({ billing_periods: ['monthly'] }), ctx)).toBe(false);
    expect(discountApplies(rule({ ends_on: '2026-10-01' }), ctx)).toBe(false);
    expect(discountApplies(rule({ starts_on: '2026-10-01', ends_on: '2026-12-31' }), ctx)).toBe(true);
  });

  it('scopes school and promo discounts', () => {
    expect(discountApplies(rule({ kind: 'school', school_id: 'school-2' }), ctx)).toBe(false);
    expect(discountApplies(rule({ kind: 'school', school_id: 'school-1' }), ctx)).toBe(true);
    expect(discountApplies(rule({ kind: 'promo', id: 'p1' }), ctx)).toBe(false);
    expect(discountApplies(rule({ kind: 'promo', id: 'p1' }), { ...ctx, promoDiscountId: 'p1' })).toBe(true);
  });

  it('ignores the redemption window for an already-redeemed promo', () => {
    const promo = rule({ kind: 'promo', id: 'p1', ends_on: '2026-01-01' });
    expect(discountApplies(promo, { ...ctx, promoDiscountId: 'p1' })).toBe(true);
  });
});

describe('bestDiscount', () => {
  const rules = [
    rule({ id: 'pct', value: 10 }),
    rule({ id: 'fixed', discount_type: 'fixed', value: 50 }),
  ];

  it('picks the largest saving', () => {
    expect(bestDiscount(rules, ctx, 300)?.discount.id).toBe('fixed');
    expect(bestDiscount(rules, ctx, 1000)?.discount.id).toBe('pct');
  });

  it('can restrict to percent discounts', () => {
    expect(bestDiscount(rules, ctx, 300, { percentOnly: true })?.discount.id).toBe('pct');
  });

  it('returns null when nothing applies', () => {
    expect(bestDiscount([rule({ is_active: false })], ctx, 300)).toBeNull();
  });
});
