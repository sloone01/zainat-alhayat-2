/** Overall lifecycle — draft until submit. Never encode Active / Not active here. */
export type CourseLifecycleStatus = 'draft' | 'active' | 'published' | 'archived'

export type CourseActivity = 'active' | 'inactive'

export function courseLifecycleStatus(course: {
  status?: string | null
}): CourseLifecycleStatus {
  const raw = String(course.status || '').toLowerCase()
  if (raw === 'draft') return 'draft'
  if (raw === 'published') return 'published'
  if (raw === 'archived') return 'archived'
  // Legacy rows used status=inactive for the activity toggle.
  if (raw === 'inactive' || raw === 'active') return 'active'
  return raw ? 'active' : 'draft'
}

export function courseActivity(course: { is_active?: boolean | null }): CourseActivity {
  return course.is_active === false ? 'inactive' : 'active'
}

/** Draft save → draft. Submit/update → keep published/archived, otherwise submitted (`active`). */
export function nextCourseLifecycleStatus(opts: {
  asDraft: boolean
  current?: string | null
}): CourseLifecycleStatus {
  if (opts.asDraft) return 'draft'
  const current = courseLifecycleStatus({ status: opts.current })
  if (current === 'published' || current === 'archived') return current
  return 'active'
}

/**
 * Single list/detail badge:
 * - draft → draft
 * - otherwise → Active / Not active from `is_active`
 */
export type CourseDisplayStatus = 'draft' | 'active' | 'inactive'

export function courseDisplayStatus(course: {
  status?: string | null
  is_active?: boolean | null
}): CourseDisplayStatus {
  if (courseLifecycleStatus(course) === 'draft') return 'draft'
  return courseActivity(course) === 'inactive' ? 'inactive' : 'active'
}

/** Courses that may appear on schedule “add class” subject dropdowns: any kind, submitted + Active (callers also filter by group level). */
export function isCourseSchedulable(course: {
  status?: string | null
  is_active?: boolean | null
}): boolean {
  if (courseActivity(course) !== 'active') return false
  const life = courseLifecycleStatus(course)
  return life === 'active' || life === 'published'
}
