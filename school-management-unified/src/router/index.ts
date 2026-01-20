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
    {
      path: '/weekly-session-plans',
      name: 'weekly-session-plans',
      component: () => import('../views/WeeklySessionPlanView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teacher-weekly-sessions',
      name: 'teacher-weekly-sessions',
      component: () => import('../views/TeacherWeeklySessionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/student-enrollment',
      name: 'student-enrollment',
      component: () => import('../views/StudentEnrollmentView.vue'),
      meta: { requiresAuth: false }
    },
    // Enrollment Management Routes
    {
      path: '/enrollments',
      name: 'enrollment-management',
      component: () => import('../views/EnrollmentManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/enrollments/:id',
      name: 'enrollment-details',
      component: () => import('../views/EnrollmentDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/enrollments/:id/edit',
      name: 'enrollment-edit',
      component: () => import('../views/EnrollmentEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/enrollments/:id/print',
      name: 'enrollment-print',
      component: () => import('../views/EnrollmentPrintView.vue'),
      meta: { requiresAuth: true }
    },
    // Parent Routes
    {
      path: '/parent/dashboard',
      name: 'parent-dashboard',
      component: () => import('../views/ParentDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/schedule',
      name: 'parent-schedule',
      component: () => import('../views/ParentScheduleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/weekly-plans',
      name: 'parent-weekly-plans',
      component: () => import('../views/ParentWeeklyPlansView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/weekly-activities',
      name: 'parent-weekly-activities',
      component: () => import('../views/ParentWeeklyActivitiesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/progress',
      name: 'parent-progress',
      component: () => import('../views/ParentProgressView.vue'),
      meta: { requiresAuth: true }
    },
  ],
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  console.log('🔐 Authentication enabled')
  console.log('Navigation to:', to.path)

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

    // Verify token with backend
    try {
      const isValid = await authService.verifyToken()
      if (isValid) {
        console.log('Token verified - proceeding to route')
        next()
      } else {
        console.log('Token invalid - redirecting to login')
        next('/login')
      }
    } catch (error) {
      console.log('Token verification failed - redirecting to login')
      next('/login')
    }
  } else {
    // Allow access to public routes
    next()
  }

  // Handle redirect from login if already authenticated
  if (to.path === '/login' && isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard')
    next('/dashboard')
    return
  }
})

export default router
