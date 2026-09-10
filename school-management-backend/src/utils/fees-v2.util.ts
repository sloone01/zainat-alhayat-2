function roundMoney(n: number): number {
  return Math.round((n + Number.EPSILON) * 1000) / 1000;
}

export function moneyStr(n: number): string {
  return roundMoney(n).toFixed(2);
}

export function num(v: string | number | null | undefined): number {
  if (v == null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/** Split total across weighted entries (last entry absorbs rounding). */
export function splitByWeights(
  total: number,
  weights: number[],
): number[] {
  if (!weights.length || total <= 0) return weights.map(() => 0);
  const sumW = weights.reduce((s, w) => s + (w > 0 ? w : 0), 0) || weights.length;
  const amounts: number[] = [];
  let allocated = 0;
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i] > 0 ? weights[i] : 1;
    if (i === weights.length - 1) {
      amounts.push(roundMoney(total - allocated));
    } else {
      const part = roundMoney((total * w) / sumW);
      amounts.push(part);
      allocated = roundMoney(allocated + part);
    }
  }
  return amounts;
}

/** Next multiple of 5 that is >= n. */
export function ceilToFive(n: number): number {
  if (n <= 0) return 0;
  return Math.ceil(n / 5) * 5;
}

/**
 * Split remaining across plan weights, rounding earlier rows up to 5.
 * The last installment absorbs the leftover and is the smallest when rounding up succeeds.
 */
export function splitRoundedUpToFive(total: number, weights: number[]): number[] {
  if (!weights.length) return [];
  if (total <= 0) return weights.map(() => 0);
  if (weights.length === 1) return [roundMoney(total)];

  const raw = splitByWeights(total, weights);
  let allocated = 0;
  const amounts: number[] = [];
  for (let i = 0; i < raw.length - 1; i++) {
    const stepped = ceilToFive(raw[i]);
    amounts.push(roundMoney(stepped));
    allocated = roundMoney(allocated + stepped);
  }
  const last = roundMoney(total - allocated);
  if (last < 0) return raw;
  amounts.push(last);
  return amounts;
}
