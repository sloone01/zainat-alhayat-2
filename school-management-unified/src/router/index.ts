import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import AttendanceManagementView from '../views/AttendanceManagementView.vue'
import { authService } from '@/services'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'platform-hub',
      component: () => import('../views/ForSchoolsView.vue'),
    },
    {
      // Legacy URL → platform hub
      path: '/for-schools',
      redirect: '/',
    },
    {
      path: '/s/default',
      redirect: '/s/zinat-al-haya',
    },
    {
      path: '/s/:slug',
      name: 'school-landing',
      component: LandingView,
    },
    {
      // School-branded login (keeps that school’s logo / name)
      path: '/s/:slug/login',
      name: 'school-login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/settings/landing-page',
      name: 'school-landing-editor',
      component: () => import('../views/SchoolLandingEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/subscribe',
      name: 'school-subscription',
      component: () => import('../views/SchoolSubscriptionView.vue'),
    },
    {
      // General platform login (not tied to one school)
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/platform/schools',
      name: 'platform-schools',
      component: () => import('../views/PlatformSchoolsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
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
      path: '/transportation',
      name: 'transportation',
      component: () => import('../views/TransportationManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transportation/daily-log',
      name: 'transportation-daily-log',
      component: () => import('../views/BusDailyLogView.vue'),
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
      path: '/settings/payments/catalog/charges',
      name: 'payment-catalog-charges',
      component: () => import('../views/PaymentChargeCatalogView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments/catalog/discounts',
      name: 'payment-catalog-discounts',
      component: () => import('../views/PaymentDiscountCatalogView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments/level/new',
      redirect: '/settings/payments/levels',
    },
    {
      path: '/settings/payments/packages',
      name: 'payment-fee-packages',
      component: () => import('../views/PaymentFeePackagesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/packages/new',
      name: 'payment-fee-package-new',
      component: () => import('../views/PaymentFeePackageEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/packages/:packageId',
      name: 'payment-fee-package-edit',
      component: () => import('../views/PaymentFeePackageEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/levels',
      name: 'payment-level-fees',
      component: () => import('../views/PaymentLevelFeesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/courses',
      name: 'payment-course-fees',
      component: () => import('../views/PaymentCourseFeesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/level/:levelId',
      name: 'payment-level-edit',
      component: () => import('../views/PaymentLevelEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments/course/:courseId',
      name: 'payment-course-edit',
      component: () => import('../views/PaymentCourseEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments',
      redirect: '/settings/payments/levels',
    },
    {
      path: '/settings/notification-templates',
      name: 'notification-templates',
      component: () => import('../views/AdminNotificationTemplatesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/message-letters',
      name: 'message-letters',
      component: () => import('../views/AdminMessageLettersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/course-enrollments',
      name: 'course-enrollments',
      component: () => import('../views/CourseEnrollmentView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/courses',
      name: 'courses',
      component: () => import('../views/CourseManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/new',
      name: 'course-create',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id/edit',
      name: 'course-edit',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/courses/:id',
      name: 'course-details',
      component: () => import('../views/CourseDetailsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/graded-courses',
      name: 'graded-courses',
      component: () => import('../views/GradedCoursesListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/graded-courses/new',
      name: 'graded-course-create',
      component: () => import('../views/GradedCourseCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/graded-courses/:courseId/edit',
      name: 'graded-course-edit',
      component: () => import('../views/GradedCourseCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules',
      name: 'schedules',
      component: () => import('../views/ScheduleManagementView.vue'),
      meta: { requiresAuth: true }
    },
    // Teacher weekly class grid (read-only timetable); distinct from /teacher-weekly-sessions
    {
      path: '/teacher/schedule',
      name: 'teacher-schedule',
      component: () => import('../views/TeacherScheduleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teacher/graded-criterion-tasks',
      name: 'teacher-graded-criterion-tasks',
      component: () => import('../views/TeacherGradedCriterionTasksView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/teacher/graded-marks',
      name: 'teacher-graded-marks',
      component: () => import('../views/TeacherGradedMarksGridView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/attendance/sessions',
      name: 'session-attendance',
      component: () => import('../views/SessionAttendanceManagementView.vue'),
      meta: { requiresAuth: true },
    },
    // Daily group attendance (fixed import so this route never resolves to another lazy chunk)
    {
      path: '/attendance/collapsible-layout',
      name: 'attendance-collapsible-layout',
      component: AttendanceManagementView,
      meta: { requiresAuth: true, attendanceKind: 'daily-group' }
    },
    {
      path: '/attendance',
      name: 'attendance',
      component: AttendanceManagementView,
      meta: { requiresAuth: true, attendanceKind: 'daily-group' }
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
      path: '/students/payments',
      name: 'student-payments',
      component: () => import('../views/StudentPaymentsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/activities',
      name: 'activities',
      component: () => import('../views/ActivityManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat',
      name: 'group-chat-list',
      component: () => import('../views/GroupChatListView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/chat/:groupId',
      name: 'group-chat-room',
      component: () => import('../views/GroupChatRoomView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/approvals',
      name: 'approval-inbox',
      component: () => import('../views/ApprovalInboxView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages',
      component: () => import('../views/DirectMessagesLayoutView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'direct-messages-list',
          component: () => import('../views/DirectMessagesWelcomePane.vue'),
        },
        {
          path: ':threadId',
          name: 'direct-messages-room',
          component: () => import('../views/DirectChatRoomView.vue'),
        },
      ],
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
    // Original teacher workflow: weekly sessions, tasks, group/week filters (unchanged URL)
    {
      path: '/teacher-weekly-sessions',
      name: 'teacher-weekly-sessions',
      component: () => import('../views/TeacherWeeklySessionsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/online-session/:id',
      name: 'online-session-room',
      component: () => import('../views/OnlineSessionRoomView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/admin/meeting-rooms',
      name: 'admin-meeting-rooms',
      component: () => import('../views/AdminMeetingRoomsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/my-meeting-rooms',
      name: 'my-meeting-rooms',
      component: () => import('../views/MyMeetingRoomsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/meeting-room/:id',
      name: 'meeting-room',
      component: () => import('../views/MeetingRoomView.vue'),
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
      path: '/parent/attendance',
      name: 'parent-attendance',
      component: () => import('../views/ParentAttendanceView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/weekly-plans',
      name: 'parent-weekly-plans',
      component: () => import('../views/ParentWeeklyPlansView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/assigned-activities',
      name: 'parent-assigned-activities',
      component: () => import('../views/ParentAssignedActivitiesView.vue'),
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
    {
      path: '/parent/fees',
      name: 'parent-fees',
      component: () => import('../views/ParentFeesView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/parent/course-enrollments',
      name: 'parent-course-enrollments',
      component: () => import('../views/ParentCourseEnrollmentView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isAuthenticated = authService.isAuthenticated()

  // Logged-in users hitting login → role-specific home
  if ((to.name === 'login' || to.name === 'school-login') && isAuthenticated) {
    const u = authService.getStoredUser() as {
      role?: string
      isSuperAdmin?: boolean
      isSystemUser?: boolean
    } | null
    let dest = '/dashboard'
    if (u?.isSuperAdmin || u?.isSystemUser) dest = '/platform/schools'
    else if (u?.role === 'parent') dest = '/parent/dashboard'
    else if (u?.role === 'teacher') dest = '/dashboard'
    next(dest)
    return
  }

  if (to.path === '/subscribe' && isAuthenticated) {
    next('/dashboard')
    return
  }

  if (!requiresAuth) {
    next()
    return
  }

  if (!isAuthenticated) {
    next('/login')
    return
  }

  try {
    const isValid = await authService.verifyToken()
    if (!isValid) {
      next('/login')
      return
    }
  } catch {
    next('/login')
    return
  }

  const user = authService.getStoredUser()
  if (user?.role === 'student' && to.path.startsWith('/chat')) {
    next('/dashboard')
    return
  }

  const requiresAdmin = to.matched.some((r) => r.meta.requiresAdmin)
  if (requiresAdmin && user?.role !== 'admin' && !(user as { isSuperAdmin?: boolean })?.isSuperAdmin) {
    next('/dashboard')
    return
  }

  const requiresPlatform = to.matched.some((r) => r.meta.requiresPlatform)
  if (requiresPlatform) {
    const u = user as { isSuperAdmin?: boolean; isSystemUser?: boolean } | null
    if (!u?.isSuperAdmin && !u?.isSystemUser) {
      next(user?.role === 'parent' ? '/parent/dashboard' : '/dashboard')
      return
    }
  }

  // Platform users land on registered schools, not school dashboard menus
  if (
    (user as { isSuperAdmin?: boolean; isSystemUser?: boolean } | null)?.isSuperAdmin ||
    (user as { isSystemUser?: boolean } | null)?.isSystemUser
  ) {
    if (to.path === '/dashboard') {
      next('/platform/schools')
      return
    }
  }

  if (user?.role === 'teacher' && to.path.startsWith('/students')) {
    next('/teacher/schedule')
    return
  }

  if (user?.role === 'parent' && to.path.startsWith('/transportation')) {
    next('/parent/dashboard')
    return
  }

  if (user?.role === 'student' && to.path.startsWith('/transportation')) {
    next('/dashboard')
    return
  }

  if (user?.role === 'teacher' && to.path === '/weekly-session-plans') {
    next('/teacher-weekly-sessions')
    return
  }

  next()
})

export default router
