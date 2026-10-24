import { fitFixedAmounts, isFixedAmountPlan, planEntryAmounts } from './fees-v2.util';

describe('fitFixedAmounts', () => {
  it('keeps amounts when they match the total', () => {
    expect(fitFixedAmounts(325, [65, 65, 65, 65, 65])).toEqual([65, 65, 65, 65, 65]);
  });

  it('adds a surplus to the last row', () => {
    expect(fitFixedAmounts(340, [65, 65, 65, 65, 65])).toEqual([65, 65, 65, 65, 80]);
  });

  it('trims trailing rows when the total is smaller', () => {
    expect(fitFixedAmounts(150, [65, 65, 65, 65])).toEqual([65, 65, 20, 0]);
  });

  it('returns zeros for a non-positive total', () => {
    expect(fitFixedAmounts(0, [65, 65])).toEqual([0, 0]);
  });
});

describe('planEntryAmounts', () => {
  it('uses fixed amounts when every entry has one', () => {
    const entries = [
      { weight: '1', amount: '100.00' },
      { weight: '1', amount: '50.00' },
    ];
    expect(isFixedAmountPlan(entries)).toBe(true);
    expect(planEntryAmounts(150, entries)).toEqual([100, 50]);
  });

  it('falls back to the weighted split without amounts', () => {
    const entries = [
      { weight: '1', amount: null },
      { weight: '1', amount: null },
    ];
    expect(isFixedAmountPlan(entries)).toBe(false);
    expect(planEntryAmounts(100, entries)).toEqual([50, 50]);
  });
});
