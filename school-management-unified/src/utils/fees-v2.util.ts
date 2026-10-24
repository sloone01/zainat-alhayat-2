/** Mirror of backend `fees-v2.util.ts` — keep in sync with Nest split rules. */

function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000
}

/** Split total across weighted entries (last entry absorbs rounding). */
export function splitByWeights(total: number, weights: number[]): number[] {
  if (!weights.length || total <= 0) return weights.map(() => 0)
  const sumW = weights.reduce((s, w) => s + (w > 0 ? w : 0), 0) || weights.length
  const amounts: number[] = []
  let allocated = 0
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] > 0 ? weights[i] : 1
    if (i === weights.length - 1) {
      amounts.push(roundMoney(total - allocated))
    } else {
      const part = roundMoney((total * w) / sumW)
      amounts.push(part)
      allocated = roundMoney(allocated + part)
    }
  }
  return amounts
}

/** Next multiple of 5 that is >= n. */
export function ceilToFive(n: number): number {
  if (n <= 0) return 0
  return Math.ceil(n / 5) * 5
}

/**
 * Split remaining across plan weights, rounding earlier rows up to 5.
 * The last installment absorbs the leftover and is the smallest when rounding up succeeds.
 */
export function splitRoundedUpToFive(total: number, weights: number[]): number[] {
  if (!weights.length) return []
  if (total <= 0) return weights.map(() => 0)
  if (weights.length === 1) return [roundMoney(total)]

  const raw = splitByWeights(total, weights)
  let allocated = 0
  const amounts: number[] = []
  for (let i = 0; i < raw.length - 1; i++) {
    const stepped = ceilToFive(raw[i])
    amounts.push(roundMoney(stepped))
    allocated = roundMoney(allocated + stepped)
  }
  const last = roundMoney(total - allocated)
  if (last < 0) return raw
  amounts.push(last)
  return amounts
}

/**
 * Fit fixed row amounts to `total` in order: rows are capped by what is left
 * (trailing rows can drop to 0) and the last row absorbs any surplus.
 */
export function fitFixedAmounts(total: number, amounts: number[]): number[] {
  if (!amounts.length) return []
  if (total <= 0) return amounts.map(() => 0)
  let left = roundMoney(total)
  const out = amounts.map((a) => {
    const take = roundMoney(Math.min(Math.max(0, a), left))
    left = roundMoney(left - take)
    return take
  })
  if (left > 0) out[out.length - 1] = roundMoney(out[out.length - 1] + left)
  return out
}

/** True when the plan stores fixed per-row amounts (a preset) instead of weights. */
export function isFixedAmountPlan(entries: Array<{ amount?: string | number | null }>): boolean {
  return entries.length > 0 && entries.every((e) => e.amount != null)
}

/** Row amounts for plan entries: fixed preset amounts, else weighted split rounded up to 5. */
export function planEntryAmounts(
  total: number,
  entries: Array<{ weight?: string | number | null; amount?: string | number | null }>,
): number[] {
  if (isFixedAmountPlan(entries)) {
    return fitFixedAmounts(total, entries.map((e) => Number(e.amount) || 0))
  }
  return splitRoundedUpToFive(total, entries.map((e) => Number(e.weight) || 1))
}
