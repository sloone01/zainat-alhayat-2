/**
 * Insert text at the caret for controlled inputs (works with v-model refs).
 */
export function insertIntoStringAtCursor(
  value: string,
  selectionStart: number | null,
  selectionEnd: number | null,
  insert: string,
): { next: string; caret: number } {
  const start = selectionStart ?? value.length
  const end = selectionEnd ?? start
  const next = value.slice(0, start) + insert + value.slice(end)
  return { next, caret: start + insert.length }
}
