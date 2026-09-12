export type MobileNavTabId = 'activities' | 'home' | 'chats' | 'schedule' | 'account'

export type MobileNavPersona = 'parent' | 'teacher' | 'admin' | 'student' | 'platform'

export interface MobileBottomNavTab {
  id: MobileNavTabId
  /** i18n key under mobileNav.* */
  labelKey: string
  route: string
  /** Path prefixes that keep this tab active */
  matchPrefixes: string[]
}

export interface MobileAccountLink {
  labelKey: string
  route: string
}

type StoredUserLike = {
  role?: string
  isSuperAdmin?: boolean
  isSystemUser?: boolean
} | null

export function resolveMobilePersona(user: StoredUserLike): MobileNavPersona {
  if (user?.isSuperAdmin || user?.isSystemUser) return 'platform'
  const role = user?.role || 'student'
  if (role === 'parent') return 'parent'
  if (role === 'teacher') return 'teacher'
  if (role === 'admin') return 'admin'
  if (role === 'student') return 'student'
  return 'student'
}

const ACCOUNT: MobileBottomNavTab = {
  id: 'account',
  labelKey: 'account',
  route: '/mobile/account',
  matchPrefixes: ['/mobile/account'],
}

/**
 * Shared 5-tab chrome; destinations differ by persona.
 * Order: Activities · Home · Chats · Schedule · Account
 */
export function getMobileBottomNavTabs(persona: MobileNavPersona): MobileBottomNavTab[] {
  switch (persona) {
    case 'parent':
      return [
        {
          id: 'activities',
          labelKey: 'activities',
          route: '/parent/assigned-activities',
          matchPrefixes: ['/parent/assigned-activities', '/parent/weekly-activities', '/parent/weekly-plans', '/parent/course-materials', '/parent/course-enrollments'],
        },
        {
          id: 'home',
          labelKey: 'home',
          route: '/parent/dashboard',
          matchPrefixes: ['/parent/dashboard'],
        },
        {
          id: 'chats',
          labelKey: 'chats',
          route: '/chat',
          matchPrefixes: ['/chat', '/messages', '/approvals', '/my-meeting-rooms'],
        },
        {
          id: 'schedule',
          labelKey: 'schedule',
          route: '/parent/schedule',
          matchPrefixes: ['/parent/schedule'],
        },
        ACCOUNT,
      ]
    case 'teacher':
      return [
        {
          id: 'activities',
          labelKey: 'activities',
          route: '/activities',
          matchPrefixes: ['/activities', '/teacher-weekly-sessions'],
        },
        {
          id: 'home',
          labelKey: 'home',
          route: '/dashboard',
          matchPrefixes: ['/dashboard'],
        },
        {
          id: 'chats',
          labelKey: 'chats',
          route: '/chat',
          matchPrefixes: ['/chat', '/messages', '/approvals', '/my-meeting-rooms'],
        },
        {
          id: 'schedule',
          labelKey: 'schedule',
          route: '/teacher/schedule',
          matchPrefixes: ['/teacher/schedule'],
        },
        ACCOUNT,
      ]
    case 'admin':
      return [
        {
          id: 'activities',
          labelKey: 'activities',
          route: '/activities',
          matchPrefixes: ['/activities'],
        },
        {
          id: 'home',
          labelKey: 'home',
          route: '/dashboard',
          matchPrefixes: ['/dashboard'],
        },
        {
          id: 'chats',
          labelKey: 'chats',
          route: '/chat',
          matchPrefixes: ['/chat', '/messages', '/approvals', '/admin/meeting-rooms', '/my-meeting-rooms'],
        },
        {
          id: 'schedule',
          labelKey: 'schedule',
          route: '/schedules',
          matchPrefixes: ['/schedules', '/flexible'],
        },
        ACCOUNT,
      ]
    case 'student':
      return [
        {
          id: 'activities',
          labelKey: 'activities',
          route: '/progress',
          matchPrefixes: ['/progress'],
        },
        {
          id: 'home',
          labelKey: 'home',
          route: '/dashboard',
          matchPrefixes: ['/dashboard'],
        },
        {
          id: 'chats',
          labelKey: 'chats',
          route: '/messages',
          matchPrefixes: ['/messages'],
        },
        {
          id: 'schedule',
          labelKey: 'schedule',
          route: '/my-meeting-rooms',
          matchPrefixes: ['/my-meeting-rooms'],
        },
        ACCOUNT,
      ]
    case 'platform':
      return [
        {
          id: 'activities',
          labelKey: 'activities',
          route: '/platform/notification-templates',
          matchPrefixes: [
            '/platform/notification-templates',
            '/platform/system-templates',
            '/platform/notification-layouts',
          ],
        },
        {
          id: 'home',
          labelKey: 'home',
          route: '/platform/schools',
          matchPrefixes: ['/platform/schools'],
        },
        {
          id: 'chats',
          labelKey: 'chats',
          route: '/roles',
          matchPrefixes: ['/roles'],
        },
        {
          id: 'schedule',
          labelKey: 'schedule',
          route: '/platform/plans',
          matchPrefixes: ['/platform/plans'],
        },
        ACCOUNT,
      ]
  }
}

/** Overflow links on the Account tab (not on the bar). */
export function getMobileAccountLinks(persona: MobileNavPersona): MobileAccountLink[] {
  switch (persona) {
    case 'parent':
      return [
        { labelKey: 'linkAttendance', route: '/parent/attendance' },
        { labelKey: 'linkProgress', route: '/parent/progress' },
        { labelKey: 'linkFees', route: '/parent/fees' },
        { labelKey: 'linkMaterials', route: '/parent/course-materials' },
        { labelKey: 'linkEnrollments', route: '/parent/course-enrollments' },
        { labelKey: 'linkMeetings', route: '/my-meeting-rooms' },
        { labelKey: 'linkApprovals', route: '/approvals' },
        { labelKey: 'linkSettings', route: '/settings' },
      ]
    case 'teacher':
      return [
        { labelKey: 'linkAttendance', route: '/attendance' },
        { labelKey: 'linkProgress', route: '/progress' },
        { labelKey: 'linkGradedTasks', route: '/teacher/graded-criterion-tasks' },
        { labelKey: 'linkGradedMarks', route: '/teacher/graded-marks' },
        { labelKey: 'linkMaterials', route: '/course-materials' },
        { labelKey: 'linkWeeklySessions', route: '/teacher-weekly-sessions' },
        { labelKey: 'linkBusLog', route: '/transportation/daily-log' },
        { labelKey: 'linkMeetings', route: '/my-meeting-rooms' },
        { labelKey: 'linkSettings', route: '/settings' },
      ]
    case 'admin':
      return [
        { labelKey: 'linkStudents', route: '/students' },
        { labelKey: 'linkAttendance', route: '/attendance' },
        { labelKey: 'linkFees', route: '/students/payments' },
        { labelKey: 'linkPendingReceipts', route: '/students/payments/pending-receipts' },
        { labelKey: 'linkCourses', route: '/courses' },
        { labelKey: 'linkProgress', route: '/progress' },
        { labelKey: 'linkUsers', route: '/users' },
        { labelKey: 'linkReports', route: '/reports/academic' },
        { labelKey: 'linkTransport', route: '/transportation' },
        { labelKey: 'linkSettings', route: '/settings' },
      ]
    case 'student':
      return [
        { labelKey: 'linkProgress', route: '/progress' },
        { labelKey: 'linkMeetings', route: '/my-meeting-rooms' },
        { labelKey: 'linkSettings', route: '/settings' },
      ]
    case 'platform':
      return [
        { labelKey: 'linkBilling', route: '/platform/plans' },
        { labelKey: 'linkTransfers', route: '/platform/transfers' },
        { labelKey: 'linkPlans', route: '/platform/plans' },
        { labelKey: 'linkRoles', route: '/roles' },
        { labelKey: 'linkNotifications', route: '/platform/notification-templates' },
      ]
  }
}

export function isMobileTabActive(tab: MobileBottomNavTab, path: string): boolean {
  return tab.matchPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}
