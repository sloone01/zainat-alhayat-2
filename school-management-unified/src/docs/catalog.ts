import type { DocsAudience, DocsNavNode } from './types'

export const DEFAULT_STAFF_SLUG = 'sign-in'
export const DEFAULT_PARENT_SLUG = 'parent-sign-in'

export const DOCS_NAV: DocsNavNode[] = [
  {
    id: 'staff-getting-started',
    audience: 'staff',
    groupKey: 'staffGettingStarted',
    children: [{ slug: 'sign-in' }, { slug: 'school-settings' }, { slug: 'users-and-roles' }],
  },
  {
    id: 'staff-students',
    audience: 'staff',
    groupKey: 'staffStudents',
    children: [
      { slug: 'register-student' },
      { slug: 'edit-student' },
      { slug: 'enrollment-inbox' },
      { slug: 'course-enrollments' },
    ],
  },
  {
    id: 'staff-operations',
    audience: 'staff',
    groupKey: 'staffOperations',
    children: [
      { slug: 'fixed-schedule' },
      { slug: 'flexible-schedule' },
      { slug: 'daily-attendance' },
      { slug: 'session-attendance' },
      { slug: 'activities' },
    ],
  },
  {
    id: 'staff-courses',
    audience: 'staff',
    groupKey: 'staffCourses',
    children: [
      { slug: 'milestone-courses' },
      { slug: 'graded-courses' },
      { slug: 'standalone-courses' },
      { slug: 'materials-weekly-plans' },
      { slug: 'progress-marks' },
    ],
  },
  {
    id: 'staff-fees',
    audience: 'staff',
    groupKey: 'staffFees',
    children: [
      { slug: 'catalogs-packages' },
      { slug: 'installment-plans' },
      { slug: 'charge-sheets' },
      { slug: 'receipts-transfers' },
    ],
  },
  {
    id: 'staff-comms',
    audience: 'staff',
    groupKey: 'staffComms',
    children: [
      { slug: 'group-chat' },
      { slug: 'direct-messages' },
      { slug: 'meetings-live-class' },
      { slug: 'letters-templates' },
    ],
  },
  {
    id: 'staff-transport',
    audience: 'staff',
    groupKey: 'staffTransport',
    children: [{ slug: 'fleet-assignment' }, { slug: 'daily-log' }],
  },
  {
    id: 'staff-reports',
    audience: 'staff',
    groupKey: 'staffReports',
    children: [{ slug: 'academic-reports' }, { slug: 'financial-reports' }],
  },
  {
    id: 'staff-website',
    audience: 'staff',
    groupKey: 'staffWebsite',
    children: [{ slug: 'landing-editor' }, { slug: 'public-enrollment' }],
  },
  {
    id: 'parent-getting-started',
    audience: 'parents',
    groupKey: 'parentGettingStarted',
    children: [{ slug: 'parent-sign-in' }, { slug: 'parent-dashboard' }, { slug: 'switching-children' }],
  },
  {
    id: 'parent-children',
    audience: 'parents',
    groupKey: 'parentChildren',
    children: [
      { slug: 'parent-schedule' },
      { slug: 'parent-attendance' },
      { slug: 'parent-progress' },
    ],
  },
  {
    id: 'parent-learning',
    audience: 'parents',
    groupKey: 'parentLearning',
    children: [
      { slug: 'parent-course-enrollments' },
      { slug: 'parent-materials' },
      { slug: 'parent-weekly-plans' },
      { slug: 'parent-activities' },
    ],
  },
  {
    id: 'parent-fees',
    audience: 'parents',
    groupKey: 'parentFees',
    children: [{ slug: 'parent-fees' }, { slug: 'parent-pay' }],
  },
  {
    id: 'parent-comms',
    audience: 'parents',
    groupKey: 'parentComms',
    children: [{ slug: 'parent-chats-meetings' }],
  },
  {
    id: 'parent-transport',
    audience: 'parents',
    groupKey: 'parentTransport',
    children: [{ slug: 'parent-bus' }],
  },
]

export function navForAudience(audience: DocsAudience): DocsNavNode[] {
  return DOCS_NAV.filter((n) => n.audience === audience)
}

export function firstSlug(audience: DocsAudience): string {
  return audience === 'parents' ? DEFAULT_PARENT_SLUG : DEFAULT_STAFF_SLUG
}

export function isKnownSlug(audience: DocsAudience, slug: string): boolean {
  return navForAudience(audience).some((g) => g.children.some((c) => c.slug === slug))
}

export function groupKeyForSlug(audience: DocsAudience, slug: string): string | null {
  const group = navForAudience(audience).find((g) => g.children.some((c) => c.slug === slug))
  return group?.groupKey ?? null
}

export function docsPath(audience: DocsAudience, slug: string): string {
  return `/docs/${audience}/${slug}`
}
