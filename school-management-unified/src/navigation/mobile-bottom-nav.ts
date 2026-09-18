import { getSessionPersona } from '@/utils/auth-token'

/**
 * Four native app flavors (separate Capacitor builds later).
 * Override for QA: localStorage `fikr_mobile_app` = parent|teacher|admin|transport
 * or build-time `VITE_MOBILE_APP`.
 */
export type MobileAppFlavor = 'parent' | 'teacher' | 'admin' | 'transport'

export type MobileNavTabId =
  | 'home'
  | 'students'
  | 'fees'
  | 'attendance'
  | 'schedule'
  | 'chats'
  | 'dailyLog'
  | 'fleet'
  | 'more'

export type MobileMoreIcon =
  | 'bus'
  | 'employees'
  | 'reports'
  | 'activities'
  | 'groups'
  | 'letters'
  | 'settings'
  | 'account'
  | 'progress'
  | 'materials'
  | 'enrollments'
  | 'meetings'
  | 'approvals'
  | 'chats'
  | 'schedule'
  | 'gradedTasks'
  | 'gradedMarks'
  | 'weeklySessions'
  | 'users'
  | 'courses'

export interface MobileBottomNavTab {
  id: MobileNavTabId
  /** i18n key under mobileNav.* */
  labelKey: string
  /** Empty for the More tab (opens sheet). */
  route: string
  matchPrefixes: string[]
}

export interface MobileMoreTile {
  id: string
  labelKey: string
  route: string
  icon: MobileMoreIcon
}

type StoredUserLike = {
  role?: string
  user_type?: string
  isSuperAdmin?: boolean
  isSystemUser?: boolean
} | null

const FLAVORS: MobileAppFlavor[] = ['parent', 'teacher', 'admin', 'transport']

function readFlavorOverride(): MobileAppFlavor | null {
  const fromEnv = String(import.meta.env.VITE_MOBILE_APP || '')
    .trim()
    .toLowerCase()
  if (FLAVORS.includes(fromEnv as MobileAppFlavor)) return fromEnv as MobileAppFlavor
  try {
    if (typeof window !== 'undefined') {
      const raw = window.localStorage?.getItem('fikr_mobile_app')?.trim().toLowerCase()
      if (raw && FLAVORS.includes(raw as MobileAppFlavor)) return raw as MobileAppFlavor
    }
  } catch {
    /* ignore */
  }
  return null
}

/** Resolve which of the four apps the shell should present. */
export function resolveMobileAppFlavor(user: StoredUserLike): MobileAppFlavor {
  const override = readFlavorOverride()
  if (override) return override

  const jwtPersona = getSessionPersona()
  if (jwtPersona === 'parent') return 'parent'
  if (user?.role === 'parent' || user?.user_type === 'parent') return 'parent'
  if (user?.role === 'teacher') return 'teacher'
  if (user?.role === 'admin' || user?.isSuperAdmin || user?.isSystemUser || jwtPersona === 'platform') {
    return 'admin'
  }
  if (jwtPersona === 'staff' && user?.role === 'teacher') return 'teacher'
  // Default staff shell = admin chrome (teachers without role still get teacher if role says so).
  if (jwtPersona === 'staff') return user?.role === 'teacher' ? 'teacher' : 'admin'
  return 'admin'
}

/** @deprecated Use resolveMobileAppFlavor — kept for MobileAccountView role label. */
export type MobileNavPersona = MobileAppFlavor | 'student' | 'platform'

export function resolveMobilePersona(user: StoredUserLike): MobileNavPersona {
  const jwtPersona = getSessionPersona()
  if (jwtPersona === 'platform') return 'platform'
  if (jwtPersona === 'student' || user?.role === 'student' || user?.user_type === 'student') {
    return 'student'
  }
  return resolveMobileAppFlavor(user)
}

const MORE_TAB: MobileBottomNavTab = {
  id: 'more',
  labelKey: 'more',
  route: '',
  matchPrefixes: [],
}

function adminTabs(): MobileBottomNavTab[] {
  return [
    {
      id: 'home',
      labelKey: 'home',
      route: '/dashboard',
      matchPrefixes: ['/dashboard'],
    },
    {
      id: 'students',
      labelKey: 'linkStudents',
      route: '/students',
      matchPrefixes: ['/students'],
    },
    {
      id: 'fees',
      labelKey: 'linkFees',
      route: '/students/payments',
      matchPrefixes: ['/students/payments'],
    },
    {
      id: 'attendance',
      labelKey: 'linkAttendance',
      route: '/attendance',
      matchPrefixes: ['/attendance'],
    },
    MORE_TAB,
  ]
}

function parentTabs(): MobileBottomNavTab[] {
  return [
    {
      id: 'home',
      labelKey: 'home',
      route: '/parent/dashboard',
      matchPrefixes: ['/parent/dashboard'],
    },
    {
      id: 'attendance',
      labelKey: 'linkAttendance',
      route: '/parent/attendance',
      matchPrefixes: ['/parent/attendance'],
    },
    {
      id: 'fees',
      labelKey: 'linkFees',
      route: '/parent/fees',
      matchPrefixes: ['/parent/fees'],
    },
    {
      id: 'schedule',
      labelKey: 'schedule',
      route: '/parent/schedule',
      matchPrefixes: ['/parent/schedule'],
    },
    MORE_TAB,
  ]
}

function teacherTabs(): MobileBottomNavTab[] {
  return [
    {
      id: 'home',
      labelKey: 'home',
      route: '/dashboard',
      matchPrefixes: ['/dashboard'],
    },
    {
      id: 'attendance',
      labelKey: 'linkAttendance',
      route: '/attendance',
      matchPrefixes: ['/attendance'],
    },
    {
      id: 'schedule',
      labelKey: 'schedule',
      route: '/teacher/schedule',
      matchPrefixes: ['/teacher/schedule'],
    },
    {
      id: 'chats',
      labelKey: 'chats',
      route: '/chat',
      matchPrefixes: ['/chat', '/messages', '/approvals', '/my-meeting-rooms'],
    },
    MORE_TAB,
  ]
}

function transportTabs(): MobileBottomNavTab[] {
  return [
    {
      id: 'home',
      labelKey: 'home',
      route: '/transportation/dashboard',
      matchPrefixes: ['/transportation/dashboard'],
    },
    {
      id: 'dailyLog',
      labelKey: 'linkBusLog',
      route: '/transportation/daily-log',
      matchPrefixes: ['/transportation/daily-log'],
    },
    {
      id: 'fleet',
      labelKey: 'linkTransport',
      route: '/transportation',
      matchPrefixes: ['/transportation'],
    },
    {
      id: 'chats',
      labelKey: 'chats',
      route: '/chat',
      matchPrefixes: ['/chat', '/messages'],
    },
    MORE_TAB,
  ]
}

export function getMobileBottomNavTabs(flavor: MobileAppFlavor): MobileBottomNavTab[] {
  switch (flavor) {
    case 'parent':
      return parentTabs()
    case 'teacher':
      return teacherTabs()
    case 'transport':
      return transportTabs()
    case 'admin':
    default:
      return adminTabs()
  }
}

function adminMore(): MobileMoreTile[] {
  return [
    { id: 'transport', labelKey: 'linkTransport', route: '/transportation', icon: 'bus' },
    { id: 'employees', labelKey: 'linkEmployees', route: '/employees', icon: 'employees' },
    { id: 'reports', labelKey: 'linkReports', route: '/reports/academic', icon: 'reports' },
    { id: 'activities', labelKey: 'activities', route: '/activities', icon: 'activities' },
    { id: 'groups', labelKey: 'linkGroups', route: '/groups', icon: 'groups' },
    { id: 'letters', labelKey: 'linkLetters', route: '/settings/message-letters', icon: 'letters' },
    { id: 'settings', labelKey: 'linkSettings', route: '/settings', icon: 'settings' },
    { id: 'account', labelKey: 'account', route: '/mobile/account', icon: 'account' },
  ]
}

function parentMore(): MobileMoreTile[] {
  return [
    { id: 'progress', labelKey: 'linkProgress', route: '/parent/progress', icon: 'progress' },
    { id: 'activities', labelKey: 'activities', route: '/parent/assigned-activities', icon: 'activities' },
    { id: 'materials', labelKey: 'linkMaterials', route: '/parent/course-materials', icon: 'materials' },
    { id: 'enrollments', labelKey: 'linkEnrollments', route: '/parent/course-enrollments', icon: 'enrollments' },
    { id: 'chats', labelKey: 'chats', route: '/chat', icon: 'chats' },
    { id: 'meetings', labelKey: 'linkMeetings', route: '/my-meeting-rooms', icon: 'meetings' },
    { id: 'approvals', labelKey: 'linkApprovals', route: '/approvals', icon: 'approvals' },
    { id: 'account', labelKey: 'account', route: '/mobile/account', icon: 'account' },
  ]
}

function teacherMore(): MobileMoreTile[] {
  return [
    { id: 'activities', labelKey: 'activities', route: '/activities', icon: 'activities' },
    { id: 'progress', labelKey: 'linkProgress', route: '/progress', icon: 'progress' },
    { id: 'gradedMarks', labelKey: 'linkGradedMarks', route: '/teacher/graded-marks', icon: 'gradedMarks' },
    { id: 'gradedTasks', labelKey: 'linkGradedTasks', route: '/teacher/graded-criterion-tasks', icon: 'gradedTasks' },
    { id: 'materials', labelKey: 'linkMaterials', route: '/course-materials', icon: 'materials' },
    { id: 'weekly', labelKey: 'linkWeeklySessions', route: '/teacher-weekly-sessions', icon: 'weeklySessions' },
    { id: 'busLog', labelKey: 'linkBusLog', route: '/transportation/daily-log', icon: 'bus' },
    { id: 'account', labelKey: 'account', route: '/mobile/account', icon: 'account' },
  ]
}

function transportMore(): MobileMoreTile[] {
  return [
    { id: 'account', labelKey: 'account', route: '/mobile/account', icon: 'account' },
    { id: 'settings', labelKey: 'linkSettings', route: '/settings', icon: 'settings' },
  ]
}

export function getMobileMoreTiles(flavor: MobileAppFlavor): MobileMoreTile[] {
  switch (flavor) {
    case 'parent':
      return parentMore()
    case 'teacher':
      return teacherMore()
    case 'transport':
      return transportMore()
    case 'admin':
    default:
      return adminMore()
  }
}

/** Overflow links on the Account page (language / sign-out live there). */
export function getMobileAccountLinks(flavor: MobileAppFlavor | MobileNavPersona): MobileMoreTile[] {
  if (flavor === 'student') {
    return [
      { id: 'progress', labelKey: 'linkProgress', route: '/progress', icon: 'progress' },
      { id: 'meetings', labelKey: 'linkMeetings', route: '/my-meeting-rooms', icon: 'meetings' },
      { id: 'settings', labelKey: 'linkSettings', route: '/settings', icon: 'settings' },
    ]
  }
  if (flavor === 'platform') {
    return [
      { id: 'plans', labelKey: 'linkPlans', route: '/platform/plans', icon: 'reports' },
      { id: 'transfers', labelKey: 'linkTransfers', route: '/platform/transfers', icon: 'reports' },
      { id: 'roles', labelKey: 'linkRoles', route: '/roles', icon: 'employees' },
      { id: 'notifications', labelKey: 'linkNotifications', route: '/platform/notification-templates', icon: 'letters' },
    ]
  }
  return getMobileMoreTiles(flavor).filter((t) => t.route !== '/mobile/account')
}

export function isMobileTabActive(tab: MobileBottomNavTab, path: string): boolean {
  if (tab.id === 'more') return false
  if (tab.id === 'fleet') {
    // Fleet tab is exact /transportation — not dashboard or daily-log.
    return path === '/transportation' || path.startsWith('/transportation/buses')
  }
  if (tab.id === 'fees') {
    return path === '/students/payments' || path.startsWith('/students/payments/')
      || path === '/parent/fees' || path.startsWith('/parent/fees/')
  }
  if (tab.id === 'students') {
    // Don't steal /students/payments for Fees tab.
    if (path.startsWith('/students/payments')) return false
    return path === '/students' || path.startsWith('/students/')
  }
  return tab.matchPrefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))
}

/** True when the current path is only reachable from the More sheet (not a primary tab). */
export function isMobileMoreRouteActive(flavor: MobileAppFlavor, path: string): boolean {
  const tabs = getMobileBottomNavTabs(flavor).filter((t) => t.id !== 'more')
  if (tabs.some((t) => isMobileTabActive(t, path))) return false
  return getMobileMoreTiles(flavor).some(
    (tile) => path === tile.route || path.startsWith(`${tile.route}/`),
  )
}
