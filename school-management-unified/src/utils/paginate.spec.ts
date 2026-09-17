import { describe, expect, it } from 'vitest'
import { paginate, slotFor } from './paginate'

describe('paginate', () => {
  it('returns every page when the list is short', () => {
    expect(paginate(1, 5, 1, 1)).toEqual([1, 2, 3, 4, 5])
  })

  it('shows a trailing gap near the start', () => {
    expect(paginate(2, 12, 1, 1)).toEqual([1, 2, 3, 4, 5, 'gap-r', 12])
  })

  it('shows a leading gap near the end', () => {
    expect(paginate(11, 12, 1, 1)).toEqual([1, 'gap-l', 8, 9, 10, 11, 12])
  })

  it('shows both gaps in the middle', () => {
    expect(paginate(6, 12, 1, 1)).toEqual([1, 'gap-l', 5, 6, 7, 'gap-r', 12])
  })

  it('widens the window when siblings increase', () => {
    expect(paginate(8, 20, 2, 1)).toEqual([1, 'gap-l', 6, 7, 8, 9, 10, 'gap-r', 20])
  })
})

describe('slotFor', () => {
  it('grows with digit count but stays at least 32px', () => {
    expect(slotFor(1)).toBe(28)
    expect(slotFor(2)).toBe(32)
    expect(slotFor(3)).toBe(40)
  })
})
