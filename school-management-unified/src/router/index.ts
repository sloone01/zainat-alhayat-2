import { createRouter, createWebHistory } from 'vue-router'
import LandingView from '../views/LandingView.vue'
import AttendanceManagementView from '../views/AttendanceManagementView.vue'
import { authService } from '@/services'
import { rememberErrorTicket, showSystemErrorOverlay } from '@/utils/error-pages'
import { reportClientError } from '@/utils/error-reporting'
import { demoPersonaFromQuery, ensureDemoSession } from '@/utils/demo-play'
import { isNativeApp, isNativePublicLandingPath } from '@/utils/native-app'
import { getSessionPersona, sessionHomePath, sessionMustChangePassword } from '@/utils/auth-token'
import { useClaims } from '@/composables/useClaims'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'platform-hub',
      component: () => import('../views/ForSchoolsView.vue'),
    },
    { path: '/brochure', redirect: '/' },
    {
      path: '/docs',
      redirect: '/docs/staff/admin-overview',
    },
    {
      path: '/docs/:audience/:slug',
      name: 'platform-docs',
      component: () => import('../views/DocsView.vue'),
      beforeEnter: (to) => {
        const audience = String(to.params.audience || '')
        if (audience !== 'staff' && audience !== 'parents') {
          return { path: '/docs/staff/admin-overview' }
        }
        return true
      },
    },
    {
      path: '/demo',
      redirect: '/demo/sign-in',
    },
    {
      path: '/demo/:slug',
      name: 'platform-demo',
      component: () => import('../views/DemoTheaterView.vue'),
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
      path: '/custom-plan',
      name: 'custom-plan-request',
      component: () => import('../views/CustomPlanRequestView.vue'),
    },
    {
      // General platform login (not tied to one school)
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/change-password',
      name: 'change-password',
      component: () => import('../views/ChangePasswordView.vue'),
    },
    {
      path: '/reset-password',
      name: 'reset-password',
      component: () => import('../views/ResetPasswordView.vue'),
    },
    {
      path: '/letter-approval',
      name: 'letter-approval',
      component: () => import('../views/LetterApprovalView.vue'),
    },
    {
      path: '/unauthorized',
      name: 'unauthorized',
      component: () => import('../views/UnauthorizedView.vue'),
    },
    {
      path: '/error',
      name: 'system-error',
      component: () => import('../views/SystemErrorView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/platform/schools',
      name: 'platform-schools',
      component: () => import('../views/PlatformSchoolsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/schools/new',
      name: 'platform-school-register',
      component: () => import('../views/PlatformSchoolRegisterView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/schools/registration',
      name: 'platform-school-registration',
      component: () => import('../views/PlatformSchoolRegistrationView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      // Legacy UUID or numeric URL → param-free registration page (id kept in session).
      path: '/platform/schools/:id',
      redirect: (to) => {
        const id = String(to.params.id || '')
        if (/^[0-9a-f-]{36}$/i.test(id) || /^\d+$/.test(id)) {
          try {
            sessionStorage.setItem('platform.selectedSchoolId', id)
          } catch {
            /* ignore */
          }
        }
        return {
          name: 'platform-school-registration',
          state: { schoolId: id },
        }
      },
    },
    {
      path: '/platform/logs',
      name: 'platform-logs',
      component: () => import('../views/PlatformActivityLogView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/plans',
      name: 'platform-plans',
      component: () => import('../views/PlatformPlansView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/custom-plan-requests',
      name: 'platform-custom-plan-requests',
      component: () => import('../views/PlatformCustomPlanRequestsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/custom-plan-requests/:id',
      name: 'platform-custom-plan-request',
      component: () => import('../views/PlatformCustomPlanRequestView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/plans/:code',
      name: 'platform-plan-edit',
      component: () => import('../views/PlatformPlanEditView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/payments',
      name: 'platform-fee-payments',
      component: () => import('../views/PlatformFeePaymentsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/transfers',
      name: 'platform-fee-transfers',
      component: () => import('../views/PlatformFeeTransfersView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/transfers/new',
      name: 'platform-fee-transfer-create',
      component: () => import('../views/PlatformFeeTransferCreateView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/notification-layouts',
      name: 'platform-notification-layouts',
      component: () => import('../views/AdminNotificationLayoutsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/notification-templates',
      name: 'platform-notification-templates',
      component: () => import('../views/AdminNotificationTemplatesView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/notification-transactions',
      name: 'platform-notification-transactions',
      component: () => import('../views/AdminNotificationTransactionsView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/notification-transactions/:id',
      name: 'platform-notification-transaction-detail',
      component: () => import('../views/AdminNotificationTransactionDetailView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true },
    },
    {
      path: '/platform/system-templates',
      name: 'platform-system-templates',
      component: () => import('../views/AdminNotificationTemplatesView.vue'),
      meta: { requiresAuth: true, requiresPlatform: true, templateAudience: 'system' },
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/billing',
      name: 'school-billing',
      component: () => import('../views/SchoolBillingView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/mobile-dashboard',
      redirect: '/dashboard',
    },
    {
      path: '/mobile/account',
      name: 'mobile-account',
      component: () => import('../views/MobileAccountView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles',
      name: 'roles',
      component: () => import('../views/RoleManagementView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles/new',
      name: 'role-create',
      component: () => import('../views/RoleCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles/:id',
      name: 'role-edit',
      component: () => import('../views/RoleClaimsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/roles/:id/claims',
      redirect: to => `/roles/${to.params.id}`,
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
      path: '/transportation/dashboard',
      name: 'transportation-dashboard',
      component: () => import('../views/TransportationDashboardView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transportation/buses/new',
      name: 'transportation-bus-new',
      component: () => import('../views/TransportationBusEditorView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/transportation/buses/:busId',
      name: 'transportation-bus-edit',
      component: () => import('../views/TransportationBusEditorView.vue'),
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
      meta: { requiresAuth: true, audience: 'parents' },
      beforeEnter: (to) => {
        if (to.query.kind !== 'student') return true
        const query = { ...to.query }
        delete query.kind
        return { path: '/users/students', query }
      },
    },
    {
      path: '/users/new',
      name: 'user-create',
      component: () => import('../views/UserCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/users/students',
      name: 'user-students',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true, audience: 'students' },
    },
    {
      path: '/employees',
      name: 'employees',
      component: () => import('../views/UserManagementView.vue'),
      meta: { requiresAuth: true, audience: 'staff' }
    },
    {
      path: '/employees/new',
      name: 'employee-create',
      component: () => import('../views/EmployeeCreateView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/employees/:userId/access',
      name: 'employee-access',
      component: () => import('../views/EmployeeAccessView.vue'),
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
      path: '/settings/grades',
      name: 'grade-levels',
      component: () => import('../views/GradeLevelsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/enrollment-responsibilities',
      name: 'enrollment-responsibilities',
      component: () => import('../views/EnrollmentResponsibilitiesView.vue'),
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
      path: '/settings/payments/catalog/extras',
      name: 'payment-catalog-extras',
      component: () => import('../views/PaymentExtraCatalogView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments/catalog/inclusions',
      name: 'payment-catalog-inclusions',
      component: () => import('../views/PaymentInclusionCatalogView.vue'),
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
      component: () => import('../views/FeePackageStructureEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/packages/:packageId',
      name: 'payment-fee-package-edit',
      component: () => import('../views/FeePackageStructureEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/installment-plans',
      name: 'installment-plans',
      component: () => import('../views/InstallmentPlansView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/installment-plans/new',
      name: 'installment-plan-new',
      component: () => import('../views/InstallmentPlanEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/payments/installment-plans/:planId',
      name: 'installment-plan-edit',
      component: () => import('../views/InstallmentPlanEditorView.vue'),
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
      component: () => import('../views/PaymentGradeFeeLinkView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments/course/:courseId',
      name: 'payment-course-edit',
      component: () => import('../views/PaymentCourseFeeLinkView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/payments',
      redirect: '/settings/payments/levels',
    },
    {
      path: '/settings/notification-layouts',
      name: 'notification-layouts',
      component: () => import('../views/AdminNotificationLayoutsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/notification-templates',
      name: 'notification-templates',
      component: () => import('../views/AdminNotificationTemplatesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/message-letters',
      name: 'message-letters',
      component: () => import('../views/AdminMessageLettersView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/settings/notification-transactions',
      name: 'notification-transactions',
      component: () => import('../views/AdminNotificationTransactionsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/settings/notification-transactions/:id',
      name: 'notification-transaction-detail',
      component: () => import('../views/AdminNotificationTransactionDetailView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
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
      meta: { requiresAuth: true, courseKind: 'milestone' },
    },
    {
      path: '/courses/new',
      name: 'course-create',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true, courseKind: 'milestone' },
    },
    {
      path: '/courses/:id/edit',
      name: 'course-edit',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true, courseKind: 'milestone' },
    },
    {
      path: '/courses/:id',
      name: 'course-details',
      component: () => import('../views/CourseDetailsView.vue'),
      meta: { requiresAuth: true, courseKind: 'milestone' },
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
    {
      path: '/schedules/auto',
      name: 'schedules-auto',
      component: () => import('../views/ScheduleAutoView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/flexible',
      name: 'flexible',
      component: () => import('../views/ScheduleFlexibleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/schedules/flexible',
      redirect: '/flexible',
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
      path: '/graded-marks',
      redirect: '/teacher/graded-marks',
    },
    {
      path: '/attendance/excuses',
      name: 'absence-excuses',
      component: () => import('../views/AbsenceExcusesView.vue'),
      meta: { requiresAuth: true },
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
      path: '/students/:id/edit',
      name: 'student-edit',
      component: () => import('../views/StudentEditView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/students/payments',
      name: 'student-payments',
      component: () => import('../views/StudentChargesView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/students/payments/pending-receipts',
      name: 'fee-pending-receipts',
      component: () => import('../views/FeePendingReceiptsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/students/payments/pending-transfers',
      name: 'fee-pending-transfers',
      component: () => import('../views/FeePendingTransfersView.vue'),
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
      component: () => import('../views/GroupChatListView.vue'),
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'group-chat-list',
          component: () => import('../views/GroupChatWelcomePane.vue'),
        },
        {
          path: ':groupId',
          name: 'group-chat-room',
          component: () => import('../views/GroupChatRoomView.vue'),
        },
      ],
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
      redirect: '/reports/academic',
    },
    {
      path: '/reports/academic',
      name: 'reports-academic',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true, reportsKind: 'academic' }
    },
    {
      path: '/reports/financial',
      name: 'reports-financial',
      component: () => import('../views/ReportsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, reportsKind: 'financial' }
    },
    {
      path: '/reports/graded-marks/class',
      name: 'reports-graded-marks-class',
      component: () => import('../views/GradedMarksClassReportView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports/graded-marks/student',
      name: 'reports-graded-marks-student',
      component: () => import('../views/GradedMarksStudentReportView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/reports/fees/due-installments',
      name: 'reports-due-installments',
      component: () => import('../views/DueInstallmentsReportView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
      path: '/course-materials',
      name: 'course-materials',
      component: () => import('../views/CourseMaterialsView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/standalone-courses',
      name: 'standalone-courses',
      component: () => import('../views/CourseManagementView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, courseKind: 'standalone' },
    },
    {
      path: '/standalone-courses/new',
      name: 'standalone-course-create',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, courseKind: 'standalone' },
    },
    {
      path: '/standalone-courses/:id/edit',
      name: 'standalone-course-edit',
      component: () => import('../views/CourseEditorView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, courseKind: 'standalone' },
    },
    {
      path: '/standalone-courses/:id',
      name: 'standalone-course-details',
      component: () => import('../views/CourseDetailsView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true, courseKind: 'standalone' },
    },
    {
      path: '/parent/course-materials',
      name: 'parent-course-materials',
      component: () => import('../views/CourseMaterialsView.vue'),
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
      path: '/admin/chat-review',
      component: () => import('../views/ChatReviewView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
      redirect: '/admin/chat-review/groups',
      children: [
        {
          path: 'groups',
          name: 'admin-chat-review',
          component: () => import('../views/ChatReviewWelcomePane.vue'),
        },
        {
          path: 'groups/:kind/:id',
          name: 'admin-chat-review-group',
          component: () => import('../views/ChatReviewThreadView.vue'),
        },
        {
          path: 'single',
          name: 'admin-chat-review-single',
          component: () => import('../views/ChatReviewWelcomePane.vue'),
        },
        {
          path: 'single/:id',
          name: 'admin-chat-review-direct',
          component: () => import('../views/ChatReviewThreadView.vue'),
        },
      ],
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
      path: '/parent/excuses',
      name: 'parent-excuses',
      component: () => import('../views/ParentExcusesView.vue'),
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
    /** Unknown URLs render nothing without this catch-all. */
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('../views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(to, _from, savedPosition) {
    if (to.hash) {
      return { el: to.hash, top: 80 }
    }
    if (savedPosition) return savedPosition
    return { top: 0, left: 0 }
  },
})

function homeForStoredUser(): string {
  const persona = getSessionPersona()
  if (persona) return sessionHomePath(persona)
  const u = authService.getStoredUser() as {
    role?: string
    user_type?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
    school_status?: string | null
  } | null
  if (u?.role === 'parent' || u?.user_type === 'parent') return '/parent/dashboard'
  if (u?.isSuperAdmin || u?.user_type === 'platform' || u?.isSystemUser) {
    return '/platform/schools'
  }
  if (u?.school_status === 'pending_payment') return '/billing'
  return '/dashboard'
}

function isSharedAppPath(path: string): boolean {
  return (
    path === '/error' ||
    path === '/unauthorized' ||
    path === '/mobile/account' ||
    path.startsWith('/meeting-room') ||
    path.startsWith('/online-session')
  )
}

function isPlatformAppPath(path: string): boolean {
  if (isSharedAppPath(path)) return true
  if (path.startsWith('/platform')) return true
  return path === '/roles' || path.startsWith('/roles/')
}

function isParentAppPath(path: string): boolean {
  if (isSharedAppPath(path)) return true
  if (path.startsWith('/parent')) return true
  return (
    path.startsWith('/chat') ||
    path.startsWith('/messages') ||
    path === '/approvals' ||
    path.startsWith('/my-meeting-rooms')
  )
}

function isPendingPaymentLock(): boolean {
  const u = authService.getStoredUser() as {
    role?: string
    user_type?: string
    isSuperAdmin?: boolean
    isSystemUser?: boolean
    school_status?: string | null
  } | null
  if (!u || u.role === 'parent' || u.user_type === 'parent') return false
  if (u.isSuperAdmin || u.user_type === 'platform' || u.isSystemUser) return false
  return u.school_status === 'pending_payment'
}

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const demoPlay =
    String(to.query.demo || '') === 'play' || String(from.query.demo || '') === 'play'
  if (demoPlay && String(to.query.demo || '') !== 'play') {
    next({
      path: to.path,
      query: {
        ...to.query,
        demo: 'play',
        persona: to.query.persona || from.query.persona || 'staff',
      },
      hash: to.hash,
      replace: true,
    })
    return
  }
  if (demoPlay && String(to.query.persona || '') === '' && from.query.persona) {
    next({
      path: to.path,
      query: { ...to.query, demo: 'play', persona: from.query.persona },
      hash: to.hash,
      replace: true,
    })
    return
  }

  // Capacitor: skip marketing / school CMS landings — open login (or home if signed in).
  if (isNativeApp() && !demoPlay && isNativePublicLandingPath(to.path)) {
    if (authService.isAuthenticated()) {
      next(sessionMustChangePassword() ? '/change-password' : homeForStoredUser())
      return
    }
    const slug = typeof to.params.slug === 'string' ? to.params.slug.trim() : ''
    if (slug) {
      next({ name: 'school-login', params: { slug }, replace: true })
      return
    }
    next({ path: '/login', replace: true })
    return
  }

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  const isLoginRoute = to.name === 'login' || to.name === 'school-login'
  const isChangePasswordRoute = to.name === 'change-password' || to.path === '/change-password'
  const isResetPasswordRoute = to.name === 'reset-password' || to.path === '/reset-password'

  if (demoPlay && requiresAuth) {
    await ensureDemoSession(demoPersonaFromQuery(to.query as Record<string, unknown>))
  }

  // Login first so leftover tokens / must_change_password cannot steal /login
  // (including Sign in again from /unauthorized).
  if (isLoginRoute) {
    if (String(to.query.demo || '') === 'play') {
      next()
      return
    }
    const forceLogin = String(to.query.reauth || '') === '1'
    if (forceLogin) {
      await authService.logout()
      const query = { ...to.query }
      delete query.reauth
      next({ path: to.path, query, hash: to.hash, replace: true })
      return
    }
    if (authService.isAuthenticated()) {
      const isValid = await authService.verifyToken()
      if (isValid) {
        const server = await authService.verifyServerSession()
        if (server === true) {
          next(sessionMustChangePassword() ? '/change-password' : homeForStoredUser())
          return
        }
        if (server === false) {
          await authService.logout()
        }
      }
    }
    next()
    return
  }

  if (isResetPasswordRoute) {
    next()
    return
  }

  if (!demoPlay && authService.isAuthenticated() && sessionMustChangePassword()) {
    if (
      !isChangePasswordRoute &&
      to.path !== '/unauthorized' &&
      to.name !== 'unauthorized' &&
      to.path !== '/error' &&
      to.name !== 'system-error'
    ) {
      next({ path: '/change-password', replace: true })
      return
    }
  }

  if (isChangePasswordRoute) {
    if (demoPlay) {
      next(homeForStoredUser())
      return
    }
    if (!authService.isAuthenticated()) {
      next('/login')
      return
    }
    next()
    return
  }

  // Public school signup — never bounce away on a stale/broken session.
  if (to.path === '/subscribe') {
    if (authService.isAuthenticated()) {
      try {
        const isValid = await authService.verifyToken()
        if (isValid) {
          next(homeForStoredUser())
          return
        }
      } catch {
        // Token check failed (API down / network). Still open the public form.
      }
    }
    next()
    return
  }

  // System error page uses DashboardLayout. Skip token verify so a down API
  // cannot loop /error → verify fail → /error.
  if (to.path === '/error' || to.name === 'system-error') {
    if (!authService.isAuthenticated()) {
      next('/login')
      return
    }
    if (isNativeApp()) {
      const q = to.query.ticket
      const ticket =
        typeof q === 'string' && q.trim()
          ? q.trim()
          : Array.isArray(q) && typeof q[0] === 'string'
            ? q[0]
            : undefined
      showSystemErrorOverlay(ticket)
      if (from.matched.length) {
        next(false)
      } else {
        next(homeForStoredUser())
      }
      return
    }
    next()
    return
  }

  if (!requiresAuth) {
    next()
    return
  }

  if (!authService.isAuthenticated()) {
    next('/login')
    return
  }

  try {
    const isValid = await authService.verifyToken()
    if (!isValid) {
      next({ name: 'unauthorized' })
      return
    }
  } catch (err) {
    // API down / network: keep the user on a usable route instead of trapping them
    // on an error surface for every navigation (common after local restarts).
    const message = err instanceof Error ? err.message : String(err || '')
    const looksLikeNetwork =
      /network|timeout|ECONNREFUSED|Failed to fetch|Network Error|ERR_CONNECTION/i.test(message) ||
      (err as { code?: string } | null)?.code === 'ERR_NETWORK'
    if (looksLikeNetwork) {
      next()
      return
    }
    next()
    void reportClientError(err, { component: 'router.verifyToken' }).then((ticket) => {
      if (ticket) rememberErrorTicket(ticket)
      showSystemErrorOverlay(ticket)
    })
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
    const u = user as {
      role?: string
      user_type?: string
      isSuperAdmin?: boolean
      isSystemUser?: boolean
    } | null
    const isPlatform =
      !!(u?.isSuperAdmin || u?.user_type === 'platform' || u?.isSystemUser) &&
      u?.role !== 'parent' &&
      u?.user_type !== 'parent'
    if (!isPlatform) {
      next(user?.role === 'parent' ? '/parent/dashboard' : '/dashboard')
      return
    }
  }

  // JWT persona wins over leftover user_data so /schedules cannot keep a
  // platform/parent session on a school-admin page that then 400s.
  {
    const persona = getSessionPersona()
    if (persona === 'platform' && !isPlatformAppPath(to.path)) {
      next('/platform/schools')
      return
    }
    if (persona === 'parent' && !isParentAppPath(to.path)) {
      next(to.path === '/schedules' ? '/parent/schedule' : '/parent/dashboard')
      return
    }
  }

  if (user?.role === 'parent' && to.path.startsWith('/transportation')) {
    next('/parent/dashboard')
    return
  }

  if (user?.role === 'student' && to.path.startsWith('/transportation')) {
    next('/dashboard')
    return
  }

  if (isPendingPaymentLock()) {
    const allowed =
      to.path === '/billing' ||
      to.path === '/unauthorized' ||
      to.path === '/error' ||
      to.path === '/mobile/account'
    if (!allowed) {
      next('/billing')
      return
    }
  }

  // Claim-gated pages: hide/deny routes the session cannot open (nav already filters).
  // Catalog-unmapped paths stay open; API ClaimGuard remains the real enforcement.
  {
    const claimExempt =
      to.path === '/change-password' ||
      to.path === '/unauthorized' ||
      to.path === '/error' ||
      to.path === '/billing' ||
      to.path === '/mobile/account'
    if (!claimExempt) {
      const { loadClaims, canOpenRoute, isPlatform } = useClaims()
      await loadClaims()
      const home = sessionHomePath()
      if (!isPlatform.value && to.path !== home && !canOpenRoute(to.path)) {
        next(home)
        return
      }
    }
  }

  next()
})

export default router
