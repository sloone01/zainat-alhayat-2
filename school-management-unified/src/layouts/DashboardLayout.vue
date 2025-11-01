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
        'fixed inset-y-0 z-50 flex w-72 flex-col transition-transform duration-300 ease-in-out lg:translate-x-0',
        isRTL ? 'right-0' : 'left-0',
        sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')
      ]"
    >

      <!-- Sidebar content -->
      <div class="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-4 shadow-xl">
        <!-- Logo -->
        <div class="flex h-16 shrink-0 items-center">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-gradient-to-r from-kindergarten-600 to-kindergarten-500 rounded-lg flex items-center justify-center">
              <span class="text-white font-bold text-sm">ز</span>
            </div>
            <div>
              <h1 class="text-lg font-bold text-gray-900">زهرة الحياة</h1>
              <p class="text-xs text-gray-500">{{ $t('dashboard.schoolManagement') }}</p>
            </div>
          </div>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col">
          <ul role="list" class="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" class="-mx-2 space-y-1" :class="isRTL ? 'text-right' : 'text-left'">
                <li v-for="item in navigation" :key="item.name">
                  <router-link
                    :to="item.href"
                    @click="handleNavClick"
                    :class="[
                      $route.path === item.href
                        ? 'bg-primary-50 text-primary-700 border-s-2 border-primary-600'
                        : 'text-gray-700 hover:text-primary-700 hover:bg-primary-50',
                      'group flex rounded-md p-3 text-sm leading-6 font-medium transition-colors duration-200 touch-button',
                      isRTL ? 'flex-row-reverse gap-x-3' : 'gap-x-3'
                    ]"
                  >
                    <component
                      :is="item.icon"
                      :class="[
                        $route.path === item.href ? 'text-primary-600' : 'text-gray-400 group-hover:text-primary-600',
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
                  <span class="text-sm font-medium text-kindergarten-600">أم</span>
                </div>
                <div class="flex-1">
                  <span class="sr-only">{{ $t('dashboard.yourProfile') }}</span>
                  <span aria-hidden="true">أحمد محمد</span>
                  <p class="text-xs text-gray-500">{{ $t('dashboard.admin') }}</p>
                </div>

                <!-- Language Switcher -->
                <LanguageSwitcher />
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
        isRTL ? 'lg:mr-72' : 'lg:ml-72'
      ]"
    >
      <!-- Top bar -->
      <div class="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
        <!-- Sidebar toggle -->
        <button
          type="button"
          class="-m-2.5 p-2.5 text-gray-700 hover:text-primary-600 transition-colors duration-200 touch-button"
          @click="sidebarOpen = !sidebarOpen"
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
          <div class="relative">
            <button
              type="button"
              class="-m-1.5 flex items-center p-1.5 hover:bg-gray-50 rounded-lg transition-colors duration-200"
              @click="showProfileDropdown = !showProfileDropdown"
            >
              <span class="sr-only">{{ $t('dashboard.openUserMenu') }}</span>
              <div class="h-8 w-8 rounded-full bg-kindergarten-100 flex items-center justify-center">
                <span class="text-sm font-medium text-kindergarten-600">أم</span>
              </div>
              <span class="hidden lg:flex lg:items-center">
                <span class="ml-4 text-sm font-semibold leading-6 text-gray-900" aria-hidden="true">أحمد محمد</span>
                <svg class="ml-2 h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                </svg>
              </span>
            </button>

            <!-- Profile dropdown menu -->
            <div
              v-if="showProfileDropdown"
              class="absolute right-0 z-10 mt-2.5 w-32 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-gray-900/5 focus:outline-none"
            >
              <a href="#" class="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50">{{ $t('dashboard.profile') }}</a>
              <a href="#" class="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50">{{ $t('dashboard.settings') }}</a>
              <a href="#" class="block px-3 py-1 text-sm leading-6 text-gray-900 hover:bg-gray-50" @click="logout">{{ $t('dashboard.signOut') }}</a>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const { locale, t } = useI18n()
const route = useRoute()
const router = useRouter()

// Reactive data
const sidebarOpen = ref(false)
const showProfileDropdown = ref(false)

// Computed properties
const isRTL = computed(() => locale.value === 'ar')

// Navigation items
const navigation = computed(() => [
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
    name: t('settings.systemSettings'),
    href: '/system-settings',
    icon: 'svg'
  },
  {
    name: t('dashboard.groupManagement'),
    href: '/groups',
    icon: 'svg'
  },
  {
    name: t('courseManagement.title'),
    href: '/courses',
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
])

// Methods
const getPageTitle = () => {
  const currentPath = route.path
  const navItem = navigation.value.find(item => item.href === currentPath)
  return navItem ? navItem.name : t('dashboard.dashboard')
}

const logout = () => {
  router.push('/login')
}

const handleNavClick = () => {
  // Close sidebar on mobile when navigation item is clicked
  if (window.innerWidth < 1024) {
    sidebarOpen.value = false
  }
}

// Close dropdowns when clicking outside
const handleClickOutside = (event: Event) => {
  if (showProfileDropdown.value && !(event.target as Element).closest('.relative')) {
    showProfileDropdown.value = false
  }
}

// Handle window resize for responsive behavior
const handleResize = () => {
  if (window.innerWidth >= 1024) {
    // Desktop: keep sidebar open
    sidebarOpen.value = true
  } else {
    // Mobile: close sidebar
    sidebarOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  // Set initial state based on screen size
  handleResize()
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
})
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

