/**
 * Formats age span for a group when both bounds exist on the record (API / DB).
 */
export function formatGroupAgeRangeLabel(
  min: number | null | undefined,
  max: number | null | undefined,
  yearsWord: string
): string | null {
  if (min == null || max == null) return null
  const a = Number(min)
  const b = Number(max)
  if (Number.isNaN(a) || Number.isNaN(b)) return null
  return `${a}-${b} ${yearsWord}`
}
