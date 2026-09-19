export type PaginationItem = number | 'gap-l' | 'gap-r'

const range = (from: number, to: number) =>
  Array.from({ length: Math.max(0, to - from + 1) }, (_, i) => from + i)

/** Windowed page list with ellipsis, matching the shadcn/motion pagination snippet. */
export function paginate(
  page: number,
  count: number,
  siblings = 1,
  boundaries = 1,
): PaginationItem[] {
  const totalSlots = 2 * boundaries + 2 * siblings + 3
  if (count <= totalSlots) return range(1, count)

  const nearStart = page < boundaries + siblings + 2
  const nearEnd = page > count - boundaries - siblings - 1

  if (nearStart) {
    return [
      ...range(1, 2 * siblings + boundaries + 2),
      'gap-r',
      ...range(count - boundaries + 1, count),
    ]
  }
  if (nearEnd) {
    return [
      ...range(1, boundaries),
      'gap-l',
      ...range(count - 2 * siblings - boundaries - 1, count),
    ]
  }
  return [
    ...range(1, boundaries),
    'gap-l',
    ...range(page - siblings, page + siblings),
    'gap-r',
    ...range(count - boundaries + 1, count),
  ]
}

export function slotFor(digits: number) {
  return Math.max(28, 16 + digits * 8)
}
