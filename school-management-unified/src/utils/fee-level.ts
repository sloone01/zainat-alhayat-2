/** Payment / grade level id from a group or course row (API shape varies). */
export function resolveFeeLevelId(
  row:
    | {
        level_id?: string | null
        levelId?: string | null
        level?: { id?: string | null } | null
      }
    | null
    | undefined,
): string {
  if (!row) return ''
  return String(row.level_id || row.levelId || row.level?.id || '').trim()
}
