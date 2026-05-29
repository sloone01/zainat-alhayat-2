<template>
  <div class="min-h-screen bg-gray-50" :dir="isRTL ? 'rtl' : 'ltr'">
    <!-- Mobile backdrop -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 bg-gray-900/80 z-40 lg:hidden"
      @click="sidebarOpen = false"
    ></div>

    <!-- Sidebar -->
    <div
      :class="[
        'fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out',
        isRTL ? 'right-0' : 'left-0',
        sidebarOpen
          ? 'translate-x-0 pointer-events-auto'
          : `${isRTL ? 'translate-x-full' : '-translate-x-full'} pointer-events-none` +
            (props.sidebarDesktop === 'pinned'
              ? ' lg:translate-x-0 lg:pointer-events-auto'
              : '')
      ]"
    >

      <!-- Sidebar content -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
        <!-- Logo -->
        <div class="flex h-16 shrink-0 items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg overflow-hidden">
              <img
                src="/zlogo.jpeg"
                alt="Zinat Al-Haya Kindergarten Logo"
                class="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">روضة زينة الحياة</h1>
              <p class="text-xs text-gray-500">{{ $t('dashboard.schoolManagement') }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1 text-start">
                <li v-for="item in navigation" :key="item.id || item.href">
                  <template v-if="item.children?.length">
                    <div class="nav-group">
                      <button
                        type="button"
                        class="nav-main-link nav-group-trigger touch-button group"
                        :class="{
                          'nav-main-link--active': navGroupActive(item),
                          'nav-group-trigger--open': isNavGroupOpen(item),
                        }"
                        :aria-expanded="isNavGroupOpen(item)"
                        @click="toggleNavGroup(item)"
                      >
                        <NavSidebarIcon
                          :name="resolveNavIcon(item)"
                          class="nav-main-icon"
                          :class="navGroupActive(item) ? 'nav-main-icon--active' : ''"
                        />
                        <span class="flex-1 text-start">{{ item.name }}</span>
                        <svg
                          class="nav-chevron"
                          :class="isNavGroupOpen(item) ? (isRTL ? '-rotate-90' : 'rotate-90') : ''"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          aria-hidden="true"
                        >
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                      <div
                        v-show="isNavGroupOpen(item)"
                        class="nav-sub-wrap"
                      >
                        <ul role="list" class="nav-sub-list">
                          <li
                            v-for="child in item.children"
                            :key="child.href"
                            class="nav-sub-item"
                            :class="{ 'nav-sub-item--active': navChildActive(child.href) }"
                          >
                            <router-link
                              :to="child.href"
                              class="nav-sub-link"
                              @click="handleNavClick"
                            >
                              {{ child.name }}
                            </router-link>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </template>
                  <router-link
                    v-else
                    :to="item.href!"
                    class="nav-main-link touch-button group"
                    :class="{ 'nav-main-link--active': navItemActive(item) }"
                    @click="handleNavClick"
                  >
                    <NavSidebarIcon
                      :name="resolveNavIcon(item)"
                      class="nav-main-icon"
                      :class="navItemActive(item) ? 'nav-main-icon--active' : ''"
                    />
                    <span class="flex-1 text-start">{{ item.name }}</span>
                  </router-link>
                </li>
              </ul>
            </li>

            <!-- User Profile -->
            <li class="mt-auto">
              <div class="flex items-center gap-x-4 px-3 py-3 text-sm font-semibold leading-6 text-gray-900 border-t border-gray-200">
                <div class="h-8 w-8 rounded-full bg-kindergarten-100 flex items-center justify-center">
                  <span class="text-sm font-medium text-kindergarten-600">{{ userDisplayInitial }}</span>
                </div>
                <div class="flex-1 min-w-0">
                  <span class="sr-only">{{ $t('dashboard.yourProfile') }}</span>
                  <span class="block truncate" aria-hidden="true">{{ userDisplayName }}</span>
                  <p class="text-xs text-gray-500 truncate">{{ userRoleLabel }}</p>
                </div>

                <!-- Language Switcher -->
                <LanguageSwitcher />

                <!-- Logout Button -->
                <button
                  @click="logout"
                  class="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                  :title="$t('dashboard.logout')"
                >
                  <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 005.25 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Main content -->
    <div
      :class="[
        'transition-all duration-300 ease-in-out',
        props.sidebarDesktop === 'pinned'
          ? isRTL
            ? 'lg:mr-72'
            : 'lg:ml-72'
          : sidebarOpen
            ? isRTL
              ? 'lg:mr-72'
              : 'lg:ml-72'
            : ''
      ]"
    >
      <!-- Top bar -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <!-- Sidebar toggle -->
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 hover:text-primary-600 transition-colors duration-200 touch-button"
          @click.stop="sidebarOpen = !sidebarOpen"
        >
          <span class="sr-only">{{ $t('dashboard.toggleSidebar') }}</span>
          <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- Separator -->
        <div class="h-6 w-px bg-gray-200" aria-hidden="true" />

        <!-- Page title -->
        <div class="flex-1">
          <h1 class="text-lg font-semibold leading-7 text-gray-900">
            {{ getPageTitle() }}
          </h1>
        </div>

        <!-- Right side items -->
        <div class="flex items-center gap-x-4 lg:gap-x-6">
          <!-- Notifications -->
          <button type="button" class="-m-2.5 p-2.5 text-gray-400 hover:text-gray-500">
            <span class="sr-only">{{ $t('dashboard.viewNotifications') }}</span>
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </button>

          <!-- Profile dropdown -->
          <div class="relative" data-profile-menu>
            <button
              type="button"
              class="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              @click.stop="showProfileDropdown = !showProfileDropdown"
            >
              <span class="sr-only">{{ $t('dashboard.openUserMenu') }}</span>
              <div class="h-8 w-8 rounded-full bg-kindergarten-100 flex items-center justify-center">
                <span class="text-sm font-medium text-kindergarten-600">{{ userDisplayInitial }}</span>
              </div>
              <span class="hidden lg:flex lg:items-center">
                <span class="ms-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">{{ userDisplayName }}</span>
                <svg class="ms-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </span>
            </button>

            <!-- Profile dropdown menu -->
            <div
              v-if="showProfileDropdown"
              class="absolute end-0 z-10 mt-2.5 min-w-[11rem] origin-top-end rounded-md bg-white py-1 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
            >
              <p class="px-3 py-2 text-xs text-gray-500 border-b border-gray-100">
                <span class="block font-medium text-gray-900">{{ userDisplayName }}</span>
                <span v-if="userEmail" class="mt-0.5 block truncate" :title="userEmail">{{ userEmail }}</span>
              </p>
              <router-link
                to="/settings"
                class="block px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
                @click="showProfileDropdown = false"
              >
                {{ $t('dashboard.settings') }}
              </router-link>
              <button
                type="button"
                class="block w-full px-3 py-2 text-start text-sm text-gray-900 hover:bg-gray-50"
                @click="onSignOutClick"
              >
                {{ $t('dashboard.signOut') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Page content -->
      <main
        :class="
          props.contentBleed
            ? 'py-0 px-0'
            : 'py-8 px-4 sm:px-6 lg:px-8'
        "
      >
        <div :class="props.contentBleed ? 'w-full max-w-none' : 'mx-auto max-w-7xl'">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import NavSidebarIcon from '@/components/NavSidebarIcon.vue'
import { authService } from '@/services'
import { resolveNavIcon } from '@/utils/nav-sidebar-icons'

/**
 * sidebarDesktop:
 * - pinned (default): sidebar stays visible from lg breakpoint; main area always offset (stable desktop layout).
 * - collapsible: sidebar can slide off on desktop too; main lg offset only when open (legacy shell).
 */
const props = withDefaults(
  defineProps<{
    sidebarDesktop?: 'pinned' | 'collapsible'
    /** Full-width main area (no max-width / default padding) — e.g. mailbox layouts */
    contentBleed?: boolean
  }>(),
  { sidebarDesktop: 'pinned', contentBleed: false }
)

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

// Reactive data
const sidebarOpen = ref(false);
const showProfileDropdown = ref(false);
const currentUser = ref(authService.getStoredUser())

type StoredUser = {
  id?: string
  email?: string
  firstName?: string
  lastName?: string
  first_name?: string
  last_name?: string
  role?: string
}

const isRTL = computed(() => locale.value === 'ar')

const userDisplayName = computed(() => {
  const u = currentUser.value as StoredUser | null
  if (!u) return t('dashboard.guestUser')
  const fn = String(u.firstName ?? u.first_name ?? '').trim()
  const ln = String(u.lastName ?? u.last_name ?? '').trim()
  const full = `${fn} ${ln}`.trim()
  if (full) return full
  return u.email?.trim() || t('dashboard.guestUser')
})

const userDisplayInitial = computed(() => {
  const name = userDisplayName.value
  const g = t('dashboard.guestUser')
  if (!name || name === g) return '?'
  const ch = name.trim().charAt(0)
  return ch || '?'
})

const userEmail = computed(() => {
  const u = currentUser.value as StoredUser | null
  return u?.email?.trim() || ''
})

const userRoleLabel = computed(() => {
  const role = (currentUser.value as StoredUser | null)?.role
  if (!role) return ''
  const key = `dashboard.${role}`
  const translated = t(key)
  return translated === key ? role : translated
})

const onSignOutClick = async () => {
  showProfileDropdown.value = false
  await logout()
}

type NavChild = { name: string; href: string }
type NavItem = {
  id?: string
  name: string
  href?: string
  icon: string
  children?: NavChild[]
}

const navGroupManualOpen = ref<Record<string, boolean>>({})

function isPaymentSettingsPath(path: string) {
  return path === '/settings/payments' || path.startsWith('/settings/payments/')
}

function isRegistrationManagementPath(path: string) {
  return (
    path === '/students' ||
    path.startsWith('/students/') ||
    path === '/enrollments' ||
    path.startsWith('/enrollments/') ||
    path === '/groups' ||
    path.startsWith('/groups/')
  )
}

function isCoursesManagementPath(path: string) {
  return (
    path === '/courses' ||
    path.startsWith('/courses/') ||
    path === '/graded-courses' ||
    path.startsWith('/graded-courses/') ||
    path === '/weekly-session-plans' ||
    path.startsWith('/weekly-session-plans') ||
    path === '/progress' ||
    path.startsWith('/progress/')
  )
}

function isSystemAdministrationPath(path: string) {
  return (
    path === '/settings' ||
    path === '/users' ||
    path.startsWith('/users/') ||
    path === '/roles' ||
    path.startsWith('/roles/') ||
    path === '/system-settings' ||
    path.startsWith('/system-settings/')
  )
}

function isNotificationsPath(path: string) {
  return (
    path === '/settings/notification-templates' ||
    path.startsWith('/settings/notification-templates') ||
    path === '/settings/message-letters' ||
    path.startsWith('/settings/message-letters')
  )
}

function isChatsPath(path: string) {
  return (
    path === '/chat' ||
    path.startsWith('/chat/') ||
    path === '/messages' ||
    path.startsWith('/messages/') ||
    path === '/approvals' ||
    path === '/admin/meeting-rooms' ||
    path.startsWith('/admin/meeting-rooms/') ||
    path === '/my-meeting-rooms' ||
    path.startsWith('/my-meeting-rooms/') ||
    path.startsWith('/meeting-room/')
  )
}

function isTransportationPath(path: string) {
  return path === '/transportation' || path.startsWith('/transportation/')
}

function isSchoolOperationsPath(path: string) {
  return (
    path === '/schedules' ||
    path.startsWith('/schedules/') ||
    path === '/attendance' ||
    path.startsWith('/attendance/') ||
    path === '/activities' ||
    path.startsWith('/activities/') ||
    path === '/reports' ||
    path.startsWith('/reports/')
  )
}

function isNavGroupPath(groupId: string, path: string): boolean {
  if (groupId === 'fee-settings') return isPaymentSettingsPath(path)
  if (groupId === 'registration-management') return isRegistrationManagementPath(path)
  if (groupId === 'courses-management') return isCoursesManagementPath(path)
  if (groupId === 'system-administration') return isSystemAdministrationPath(path)
  if (groupId === 'notifications') return isNotificationsPath(path)
  if (groupId === 'chats') return isChatsPath(path)
  if (groupId === 'transportation') return isTransportationPath(path)
  if (groupId === 'school-operations') return isSchoolOperationsPath(path)
  return false
}

watch(
  () => route.path,
  (path) => {
    for (const id of [
      'system-administration',
      'fee-settings',
      'notifications',
      'chats',
      'transportation',
      'school-operations',
      'registration-management',
      'courses-management',
    ] as const) {
      if (isNavGroupPath(id, path)) {
        navGroupManualOpen.value = { ...navGroupManualOpen.value, [id]: true }
      }
    }
  },
  { immediate: true },
)

function isNavGroupOpen(item: NavItem) {
  if (!item.id || !item.children?.length) return false
  if (item.id in navGroupManualOpen.value) return navGroupManualOpen.value[item.id]
  return isNavGroupPath(item.id, route.path)
}

function toggleNavGroup(item: NavItem) {
  if (!item.id) return
  const next = !isNavGroupOpen(item)
  navGroupManualOpen.value = { ...navGroupManualOpen.value, [item.id]: next }
}

function navGroupActive(item: NavItem) {
  return !!item.id && isNavGroupPath(item.id, route.path)
}

function navChildActive(href: string) {
  if (route.path === href) return true
  if (href === '/settings/payments/levels' && route.path.startsWith('/settings/payments/level/')) return true
  if (href === '/settings/payments/courses' && route.path.startsWith('/settings/payments/course/')) return true
  if (href === '/settings/payments/packages' && route.path.startsWith('/settings/payments/packages')) return true
  if (href === '/courses' && route.path.startsWith('/courses/')) return true
  if (href === '/graded-courses' && route.path.startsWith('/graded-courses/')) return true
  if (href === '/progress' && route.path.startsWith('/progress/')) return true
  if (href === '/settings/message-letters' && route.path.startsWith('/settings/message-letters')) return true
  if (href === '/chat' && (route.path === '/chat' || route.path.startsWith('/chat/'))) return true
  if (href === '/messages' && route.path.startsWith('/messages')) return true
  if (href === '/groups' && route.path.startsWith('/groups')) return true
  if (href === '/admin/meeting-rooms' && (route.path === '/admin/meeting-rooms' || route.path.startsWith('/meeting-room/'))) {
    return true
  }
  if (href === '/my-meeting-rooms' && (route.path === '/my-meeting-rooms' || route.path.startsWith('/meeting-room/'))) {
    return true
  }
  if (href === '/transportation' && route.path === '/transportation') return true
  if (href === '/transportation/daily-log' && route.path.startsWith('/transportation/daily-log')) return true
  if (href === '/schedules' && route.path.startsWith('/schedules')) return true
  if (href === '/attendance/sessions' && route.path.startsWith('/attendance/sessions')) return true
  if (href === '/attendance' && (route.path === '/attendance' || route.path === '/attendance/collapsible-layout')) {
    return true
  }
  if (href === '/activities' && route.path.startsWith('/activities')) return true
  if (href === '/reports' && route.path.startsWith('/reports')) return true
  return false
}

function schoolOperationsNavGroup(children?: NavItem[]): NavItem {
  return {
    id: 'school-operations',
    name: t('dashboard.schoolOperationsNav'),
    icon: 'clipboard',
    children: children ?? [
      { name: t('scheduleManagement.title'), href: '/schedules' },
      { name: t('attendanceManagement.title'), href: '/attendance' },
      { name: t('sessionAttendance.title'), href: '/attendance/sessions' },
      { name: t('dashboard.activityManagement'), href: '/activities' },
      { name: t('dashboard.reports'), href: '/reports' },
    ],
  }
}

function transportationNavGroup(children?: NavItem[]): NavItem {
  return {
    id: 'transportation',
    name: t('dashboard.transportation'),
    icon: 'truck',
    children: children ?? [
      { name: t('transportation.title'), href: '/transportation' },
      { name: t('busDailyLog.title'), href: '/transportation/daily-log' },
    ],
  }
}

function chatsNavGroup(meetingChild?: { name: string; href: string }): NavItem {
  const children: NavItem[] = [
    { name: t('chatRooms.title'), href: '/chat' },
    { name: t('directMessages.title'), href: '/messages' },
    { name: t('messageLetters.approvalInboxNav'), href: '/approvals' },
  ]
  if (meetingChild) {
    children.push({ name: meetingChild.name, href: meetingChild.href })
  }
  return {
    id: 'chats',
    name: t('dashboard.chatsNav'),
    icon: 'chat',
    children,
  }
}

// Navigation items (filtered by user role)
const navigation = computed(() => {
  const allNavigation = [
  {
    name: t('dashboard.dashboard'),
    href: '/dashboard',
    icon: 'home',
  },
  {
    id: 'system-administration',
    name: t('dashboard.systemAdministrationNav'),
    icon: 'cog',
    children: [
      { name: t('dashboard.userManagement'), href: '/users' },
      { name: t('dashboard.roleManagement'), href: '/roles' },
      { name: t('dashboard.settings'), href: '/settings' },
      { name: t('systemSettings.systemSettings'), href: '/system-settings' },
    ],
  },
  {
    id: 'fee-settings',
    name: t('dashboard.paymentSettingsNav'),
    icon: 'banknotes',
    children: [
      { name: t('paymentSettings.feePackagesNav'), href: '/settings/payments/packages' },
      { name: t('paymentSettings.levelFeesNav'), href: '/settings/payments/levels' },
      { name: t('paymentSettings.courseFeesNav'), href: '/settings/payments/courses' },
    ],
  },
  {
    id: 'notifications',
    name: t('dashboard.notificationsNav'),
    icon: 'bell',
    children: [
      { name: t('dashboard.notificationTemplatesNav'), href: '/settings/notification-templates' },
      { name: t('dashboard.messageLettersNav'), href: '/settings/message-letters' },
    ],
  },
  transportationNavGroup(),
  chatsNavGroup({ name: t('meetingRooms.adminNav'), href: '/admin/meeting-rooms' }),
  schoolOperationsNavGroup(),
  {
    id: 'courses-management',
    name: t('dashboard.coursesManagementNav'),
    icon: 'academic-cap',
    children: [
      { name: t('courseManagement.title'), href: '/courses' },
      { name: t('gradedCourses.title'), href: '/graded-courses' },
      { name: t('weeklySessionPlans.title'), href: '/weekly-session-plans' },
      { name: t('progressTracking.title'), href: '/progress' },
    ],
  },
  {
    id: 'registration-management',
    name: t('dashboard.registrationManagementNav'),
    icon: 'users',
    children: [
      { name: t('dashboard.studentManagement'), href: '/students' },
      { name: t('dashboard.studentPaymentsNav'), href: '/students/payments' },
      { name: t('courseEnrollment.navTitle'), href: '/course-enrollments' },
      { name: t('dashboard.enrollmentManagement'), href: '/enrollments' },
      { name: t('students.registerStudent'), href: '/students/register' },
      { name: t('dashboard.groupManagement'), href: '/groups' },
    ],
  },
  ]

  // Filter navigation based on user role
  const userRole = currentUser.value?.role || 'student'

  // Admin users can see all menus
  if (userRole === 'admin') {
    return allNavigation
  }

  if (userRole === 'teacher') {
    return [
      { name: t('dashboard.dashboard'), href: '/dashboard', icon: 'svg' },
      chatsNavGroup({ name: t('meetingRooms.myMeetingsNav'), href: '/my-meeting-rooms' }),
      { id: 'teacher-my-schedule', name: t('teacher.mySchedule'), href: '/teacher/schedule', icon: 'svg' },
      { id: 'teacher-graded-criterion-tasks', name: t('gradedCriterionTasks.title'), href: '/teacher/graded-criterion-tasks', icon: 'svg' },
      { id: 'teacher-graded-marks', name: t('gradedMarksGrid.navTitle'), href: '/teacher/graded-marks', icon: 'svg' },
      schoolOperationsNavGroup([
        { name: t('attendanceManagement.title'), href: '/attendance' },
        { name: t('dashboard.activityManagement'), href: '/activities' },
      ]),
      transportationNavGroup([{ name: t('busDailyLog.title'), href: '/transportation/daily-log' }]),
      { id: 'teacher-weekly-sessions', name: t('teacherWeeklySessions.title'), href: '/teacher-weekly-sessions', icon: 'svg' },
      { name: t('courseEnrollment.navTitle'), href: '/course-enrollments', icon: 'svg' },
      { name: t('progressTracking.title'), href: '/progress', icon: 'svg' },
      { name: t('dashboard.settings'), href: '/settings', icon: 'svg' },
    ]
  }

  // Parents can only see parent-specific menus
  if (userRole === 'parent') {
    return [
      {
        name: t('parent.dashboard'),
        href: '/parent/dashboard',
        icon: 'svg'
      },
      chatsNavGroup({ name: t('meetingRooms.myMeetingsNav'), href: '/my-meeting-rooms' }),
      {
        name: t('parentFees.navTitle'),
        href: '/parent/fees',
        icon: 'svg'
      },
      {
        name: t('courseEnrollment.parentNav'),
        href: '/parent/course-enrollments',
        icon: 'svg'
      },
      {
        name: t('parent.schedule'),
        href: '/parent/schedule',
        icon: 'svg'
      },
      {
        name: t('parent.attendance'),
        href: '/parent/attendance',
        icon: 'svg'
      },
      {
        name: t('parent.weeklyPlans'),
        href: '/parent/weekly-plans',
        icon: 'svg'
      },
      {
        name: t('parent.assignedActivities'),
        href: '/parent/assigned-activities',
        icon: 'svg'
      },
      {
        name: t('parent.weeklyActivities'),
        href: '/parent/weekly-activities',
        icon: 'svg'
      },
      {
        name: t('parent.progress'),
        href: '/parent/progress',
        icon: 'svg'
      }
    ]
  }

  // Students can see very limited menus
  return allNavigation.filter(item =>
    item.href === '/dashboard' ||
    item.href === '/progress' ||
    item.href === '/messages' ||
    item.href === '/my-meeting-rooms'
  )
});

function navItemActive(item: NavItem) {
  if (!item.href) return false
  if (route.path === item.href) return true
  if (item.href === '/settings/message-letters' && route.path.startsWith('/settings/message-letters')) return true
  if (item.href === '/graded-courses' && route.path.startsWith('/graded-courses')) return true
  if (item.href === '/messages' && route.path.startsWith('/messages')) return true
  if (item.href === '/approvals' && route.path === '/approvals') return true
  if (item.href === '/chat' && route.path.startsWith('/chat/')) return true
  if (item.href === '/attendance' && route.path === '/attendance/collapsible-layout') return true
  return false
}

// Methods
const getPageTitle = () => {
  const currentPath = route.path
  if (currentPath === '/chat') return t('chatRooms.title')
  if (currentPath.startsWith('/chat/')) return t('chatRooms.roomTitleShort')
  if (currentPath === '/messages') return t('directMessages.title')
  if (currentPath.startsWith('/messages/')) return t('directMessages.roomTitle')
  if (currentPath === '/approvals') return t('messageLetters.approvalInboxTitle')
  if (currentPath === '/admin/meeting-rooms') return t('meetingRooms.adminTitle')
  if (currentPath === '/my-meeting-rooms') return t('meetingRooms.myMeetingsTitle')
  if (currentPath.startsWith('/meeting-room/')) return t('meetingRooms.joinTitle')
  if (currentPath === '/settings') return t('dashboard.settings')
  if (currentPath === '/system-settings') return t('systemSettings.systemSettings')
  if (currentPath === '/users') return t('dashboard.userManagement')
  if (currentPath === '/roles') return t('dashboard.roleManagement')
  if (currentPath === '/settings/payments/packages') return t('paymentSettings.feePackagesTitle')
  if (currentPath === '/settings/payments/packages/new') return t('paymentSettings.createFeePackage')
  if (currentPath.startsWith('/settings/payments/packages/')) return t('paymentSettings.editFeePackage')
  if (currentPath === '/settings/payments/levels' || currentPath.startsWith('/settings/payments/level/')) {
    return currentPath.startsWith('/settings/payments/level/')
      ? t('paymentSettings.editLevelTitle')
      : t('paymentSettings.levelFeesPageTitle')
  }
  if (currentPath === '/settings/payments/courses' || currentPath.startsWith('/settings/payments/course/')) {
    return currentPath.startsWith('/settings/payments/course/')
      ? t('paymentSettings.editCourseFeeTitle')
      : t('paymentSettings.courseFeesPageTitle')
  }
  if (currentPath === '/settings/payments/catalog/charges') return t('systemSettings.feeItemsLines')
  if (currentPath === '/settings/payments/catalog/discounts') return t('systemSettings.discountItemsLines')
  if (currentPath === '/settings/notification-templates') return t('notificationTemplates.title')
  if (currentPath === '/settings/message-letters') return t('messageLetters.title')
  if (currentPath === '/students/payments') return t('studentPayments.title')
  if (currentPath === '/groups' || currentPath.startsWith('/groups/')) return t('dashboard.groupManagement')
  if (currentPath === '/transportation') return t('transportation.title')
  if (currentPath.startsWith('/transportation/daily-log')) return t('busDailyLog.title')
  if (currentPath === '/graded-courses') return t('gradedCourses.title')
  if (currentPath === '/graded-courses/new') return t('gradedCourses.addCourse')
  if (currentPath.includes('/graded-courses/') && currentPath.endsWith('/edit')) {
    return t('gradedCourses.editGradedCourse')
  }
  if (currentPath === '/schedules' || currentPath.startsWith('/schedules/')) return t('scheduleManagement.title')
  if (currentPath === '/attendance/sessions' || currentPath.startsWith('/attendance/sessions')) {
    return t('sessionAttendance.title')
  }
  if (currentPath === '/attendance' || currentPath === '/attendance/collapsible-layout') {
    return t('attendanceManagement.title')
  }
  if (currentPath === '/activities' || currentPath.startsWith('/activities/')) return t('dashboard.activityManagement')
  if (currentPath === '/reports' || currentPath.startsWith('/reports/')) return t('dashboard.reports')
  if (currentPath === '/teacher/graded-criterion-tasks') return t('gradedCriterionTasks.title')
  if (currentPath === '/teacher/graded-marks') return t('gradedMarksGrid.navTitle')
  const navItem = navigation.value.find((item) => item.href === currentPath)
  return navItem ? navItem.name : t('dashboard.dashboard')
}

const logout = async () => {
  try {
    await authService.logout()
    currentUser.value = null
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    // Force logout even if API call fails
    authService.logout()
    currentUser.value = null
    router.push('/login')
  }
};

watch(
  () => route.path,
  () => {
    currentUser.value = authService.getStoredUser()
  },
  { immediate: true }
)

const handleNavClick = () => {
  // Close sidebar on mobile when navigation item is clicked
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false;
  }
};

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (!showProfileDropdown.value) return
  const el = event.target as Element | null
  if (el && !el.closest('[data-profile-menu]')) {
    showProfileDropdown.value = false
  }
}

// Handle window resize for responsive behavior
const handleResize = () => {
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
    return
  }
  if (props.sidebarDesktop === 'pinned') {
    sidebarOpen.value = true
  }
};

onMounted(() => {
  currentUser.value = authService.getStoredUser()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
/* Custom scrollbar for sidebar */
.overflow-y-auto::-webkit-scrollbar {
  width: 4px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 2px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Sidebar navigation */
.nav-group {
  width: 100%;
}

.nav-main-link {
  display: flex;
  width: 100%;
  align-items: center;
  gap: 0.75rem;
  margin-block: 0.0625rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.5rem;
  background: transparent;
  font-size: 0.875rem;
  line-height: 1.375rem;
  font-weight: 500;
  color: rgb(55 65 81);
  text-decoration: none;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-main-link:hover {
  @apply bg-gray-50 text-primary-700;
}

.nav-main-link--active {
  @apply bg-primary-50 text-primary-700;
}

.nav-group-trigger {
  font-weight: 600;
}

.nav-group-trigger--open .nav-chevron {
  color: rgb(107 114 128);
}

.nav-main-icon {
  height: 1.25rem;
  width: 1.25rem;
  flex-shrink: 0;
  color: rgb(156 163 175);
  transition: color 0.15s ease;
}

.nav-main-link:hover .nav-main-icon,
.nav-group-trigger--open .nav-main-icon {
  @apply text-primary-600;
}

.nav-main-icon--active {
  @apply text-primary-600;
}

.nav-chevron {
  height: 1rem;
  width: 1rem;
  flex-shrink: 0;
  color: rgb(156 163 175);
  transition:
    transform 0.2s ease,
    color 0.15s ease;
}

.nav-sub-wrap {
  display: block;
  width: 100%;
  margin-block-start: 0.125rem;
  padding-inline-start: 0.625rem;
  margin-inline-start: 0.875rem;
  border-inline-start: 1px solid rgb(229 231 235);
}

.nav-sub-list {
  list-style: none;
  margin: 0;
  padding: 0.125rem 0;
  width: 100%;
}

.nav-sub-item {
  display: block;
  width: 100%;
  margin: 0;
  border-radius: 0.375rem;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.nav-sub-item:hover {
  @apply bg-primary-50/80;
}

.nav-sub-item--active {
  @apply bg-primary-100;
}

.nav-sub-link {
  display: block;
  width: 100%;
  padding: 0.4375rem 0.625rem;
  text-align: start;
  font-size: 0.8125rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: rgb(107 114 128);
  text-decoration: none;
  border-radius: inherit;
  transition: color 0.15s ease;
}

.nav-sub-link:hover {
  @apply text-primary-800;
}

.nav-sub-item--active .nav-sub-link {
  @apply text-primary-700 font-medium;
}

/* Mobile touch targets */
.touch-button {
  min-height: 44px;
  min-width: 44px;
}

/* Mobile-first responsive behavior */
@media (max-width: 1023px) {
  .sidebar-mobile {
    transform: translateX(-100%);
  }

  .sidebar-mobile.open {
    transform: translateX(0);
  }
}
</style>

