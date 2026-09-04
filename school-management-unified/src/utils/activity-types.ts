/** Canonical values stored in the database (`activities.activity_type`). */
export const ACTIVITY_TYPE_VALUES = [
  'Homework',
  'Class Activity',
  'Project',
  'Assessment',
  'Parent Task',
  'Field Trip',
] as const

export type ActivityTypeValue = (typeof ACTIVITY_TYPE_VALUES)[number]

const TYPE_I18N_SLUG: Record<string, string> = {
  Homework: 'homework',
  'Class Activity': 'classActivity',
  Project: 'project',
  Assessment: 'assessment',
  'Parent Task': 'parentTask',
  'Field Trip': 'fieldTrip',
}

export function translateActivityType(
  t: (key: string) => string,
  type: string | null | undefined,
): string {
  if (!type?.trim()) return '—'
  const slug = TYPE_I18N_SLUG[type]
  if (!slug) return type
  const key = `activities.types.${slug}`
  const label = t(key)
  return label === key ? type : label
}
