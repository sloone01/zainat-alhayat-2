import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import { authService } from '@/services'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'landing',
      component: LandingView,
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/mobile-dashboard',
      name: 'mobile-dashboard',
      component: () => import('../views/MobileDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RoleManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/groups',
      name: 'groups',
      component: () => import('../views/GroupManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users',
      name: 'users',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('../views/SettingsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/system-settings',
      name: 'system-settings',
      component: () => import('../views/SystemSettingsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CourseManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id',
      name: 'course-details',
      component: () => import('../views/CourseDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: () => import('../views/ScheduleManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: () => import('../views/AttendanceManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/progress',
      name: 'progress',
      component: () => import('../views/TeacherProgressView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/progress/course/:id',
      name: 'course-progress',
      component: () => import('../views/CourseProgressView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students',
      name: 'students',
      component: () => import('../views/StudentManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students/register',
      name: 'student-registration',
      component: () => import('../views/StudentRegistrationView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('../views/ActivityManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// DEVELOPMENT MODE: Authentication disabled for development
// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  console.log('🚧 DEVELOPMENT MODE: Authentication disabled')
  console.log('Navigation to:', to.path)

  // DEVELOPMENT: Skip all authentication checks
  console.log('✅ Allowing access without authentication (development mode)')
  next()
  return

  // PRODUCTION CODE (commented out for development):
  /*
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authService.isAuthenticated()
  const token = authService.getStoredToken()

  console.log('Router Guard Debug:', {
    route: to.path,
    requiresAuth,
    isAuthenticated,
    hasToken: !!token,
    tokenPreview: token ? token.substring(0, 20) + '...' : null
  })

  if (requiresAuth) {
    if (!isAuthenticated) {
      console.log('Redirecting to login - no token found')
      next('/login')
      return
    }

    // Verify token validity for protected routes
    try {
      console.log('Verifying token validity...')
      const isValid = await authService.verifyToken()
      if (!isValid) {
        console.log('Token invalid - redirecting to login')
        authService.logout() // Clear invalid token
        next('/login')
        return
      }
      console.log('Token is valid - proceeding to route')
      next()
    } catch (error) {
      console.log('Token verification failed:', error)
      authService.logout() // Clear invalid token
      next('/login')
    }
  } else {
    next()
  }
  */
})

export default router
