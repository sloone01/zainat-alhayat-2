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
              <ul role="list" class="-mx-2 space-y-1" :class="isRTL ? 'text-right' : 'text-left'">
                <li v-for="item in navigation" :key="item.id || item.href">
                  <router-link
                    :to="item.href"
                    @click="handleNavClick"
                    :class="[
                      navItemActive(item)
                        ? 'bg-primary-50 text-primary-700 border-s-2 border-primary-600'
                        : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50',
                      'group flex rounded-md p-3 text-sm leading-6 font-medium transition-colors duration-200 touch-button',
                      isRTL ? 'flex-row-reverse gap-x-3' : 'gap-x-3'
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        navItemActive(item) ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
                        'h-5 w-5 shrink-0'
                      ]"
                      aria-hidden="true"
                    />
                    {{ item.name }}
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
      <main class="py-8 px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-7xl">
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
import { authService } from '@/services'

/**
 * sidebarDesktop:
 * - pinned (default): sidebar stays visible from lg breakpoint; main area always offset (stable desktop layout).
 * - collapsible: sidebar can slide off on desktop too; main lg offset only when open (legacy shell).
 */
const props = withDefaults(
  defineProps<{
    sidebarDesktop?: 'pinned' | 'collapsible'
  }>(),
  { sidebarDesktop: 'pinned' }
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

// Navigation items (filtered by user role)
const navigation = computed(() => {
  const allNavigation = [
  {
    name: t('dashboard.dashboard'),
    href: '/dashboard',
    icon: 'svg'
  },
  {
    name: t('dashboard.userManagement'),
    href: '/users',
    icon: 'svg'
  },
  {
    name: t('dashboard.roleManagement'),
    href: '/roles',
    icon: 'svg'
  },
  {
    name: t('dashboard.settings'),
    href: '/settings',
    icon: 'svg'
  },
  {
    name: t('systemSettings.systemSettings'),
    href: '/system-settings',
    icon: 'svg'
  },
  {
    name: t('dashboard.groupManagement'),
    href: '/groups',
    icon: 'svg'
  },
  {
    name: t('dashboard.transportation'),
    href: '/transportation',
    icon: 'svg'
  },
  {
    name: t('dashboard.busDailyLog'),
    href: '/transportation/daily-log',
    icon: 'svg'
  },
  {
    name: t('chatRooms.title'),
    href: '/chat',
    icon: 'svg'
  },
  {
    name: t('directMessages.title'),
    href: '/messages',
    icon: 'svg'
  },
  {
    name: t('meetingRooms.adminNav'),
    href: '/admin/meeting-rooms',
    icon: 'svg'
  },
  {
    name: t('courseManagement.title'),
    href: '/courses',
    icon: 'svg'
  },
  {
    name: t('gradedCourses.title'),
    href: '/graded-courses',
    icon: 'svg'
  },
  {
    name: t('scheduleManagement.title'),
    href: '/schedules',
    icon: 'svg'
  },
  {
    name: t('attendanceManagement.title'),
    href: '/attendance',
    icon: 'svg'
  },
  {
    id: 'weekly-session-plans',
    name: t('weeklySessionPlans.title'),
    href: '/weekly-session-plans',
    icon: 'svg'
  },
  {
    name: t('progressTracking.title'),
    href: '/progress',
    icon: 'svg'
  },
  {
    name: t('dashboard.studentManagement'),
    href: '/students',
    icon: 'svg'
  },
  {
    name: t('dashboard.enrollmentManagement'),
    href: '/enrollments',
    icon: 'svg'
  },
  {
    name: t('students.registerStudent'),
    href: '/students/register',
    icon: 'svg'
  },
  {
    name: t('dashboard.activityManagement'),
    href: '/activities',
    icon: 'svg'
  },
  {
    name: t('dashboard.reports'),
    href: '/reports',
    icon: 'svg'
  }
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
      { name: t('chatRooms.title'), href: '/chat', icon: 'svg' },
      { name: t('directMessages.title'), href: '/messages', icon: 'svg' },
      { name: t('meetingRooms.myMeetingsNav'), href: '/my-meeting-rooms', icon: 'svg' },
      { id: 'teacher-my-schedule', name: t('teacher.mySchedule'), href: '/teacher/schedule', icon: 'svg' },
      { id: 'teacher-graded-criterion-tasks', name: t('gradedCriterionTasks.title'), href: '/teacher/graded-criterion-tasks', icon: 'svg' },
      { id: 'teacher-graded-marks', name: t('gradedMarksGrid.navTitle'), href: '/teacher/graded-marks', icon: 'svg' },
      { name: t('attendanceManagement.title'), href: '/attendance', icon: 'svg' },
      { name: t('dashboard.busDailyLog'), href: '/transportation/daily-log', icon: 'svg' },
      { name: t('dashboard.activityManagement'), href: '/activities', icon: 'svg' },
      { id: 'teacher-weekly-sessions', name: t('teacherWeeklySessions.title'), href: '/teacher-weekly-sessions', icon: 'svg' },
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
      {
        name: t('chatRooms.title'),
        href: '/chat',
        icon: 'svg'
      },
      {
        name: t('directMessages.title'),
        href: '/messages',
        icon: 'svg'
      },
      {
        name: t('meetingRooms.myMeetingsNav'),
        href: '/my-meeting-rooms',
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

function navItemActive(item: { href: string }) {
  if (route.path === item.href) return true
  if (item.href === '/graded-courses' && route.path.startsWith('/graded-courses')) return true
  if (item.href === '/messages' && route.path.startsWith('/messages')) return true
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
  if (currentPath === '/admin/meeting-rooms') return t('meetingRooms.adminTitle')
  if (currentPath === '/my-meeting-rooms') return t('meetingRooms.myMeetingsTitle')
  if (currentPath.startsWith('/meeting-room/')) return t('meetingRooms.joinTitle')
  if (currentPath === '/graded-courses') return t('gradedCourses.title')
  if (currentPath === '/graded-courses/new') return t('gradedCourses.addCourse')
  if (currentPath.includes('/graded-courses/') && currentPath.endsWith('/edit')) {
    return t('gradedCourses.editGradedCourse')
  }
  if (currentPath === '/attendance/collapsible-layout') return t('attendanceManagement.title')
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

