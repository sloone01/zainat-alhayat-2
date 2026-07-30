/** @typedef {'public' | 'admin' | 'teacher' | 'parent'} Role */

/**
 * @typedef {Object} ModalTrigger
 * @property {string} id - suffix for filename
 * @property {RegExp[]} patterns - button text (EN or AR)
 */

/**
 * @typedef {Object} PageDef
 * @property {string} slug - URL-safe id for filenames
 * @property {string} path - route path (may contain {placeholders})
 * @property {string} label - human label for designer
 * @property {Role[]} roles
 * @property {ModalTrigger[]} [modals]
 * @property {boolean} [skipTabs] - skip auto tab capture
 * @property {'row-view' | 'row-edit'} [rowAction] - open first table row action
 */

/** @type {PageDef[]} */
export const PAGES = [
  // ── Public ──
  { slug: 'landing', path: '/', label: 'Landing', roles: ['public'] },
  { slug: 'login', path: '/login', label: 'Login', roles: ['public'] },
  { slug: 'subscribe', path: '/subscribe', label: 'School Subscription', roles: ['public'] },
  { slug: 'student-enrollment', path: '/student-enrollment', label: 'Student Enrollment (public)', roles: ['public'] },

  // ── Admin core ──
  { slug: 'dashboard', path: '/dashboard', label: 'Admin Dashboard', roles: ['admin'] },
  { slug: 'mobile-dashboard', path: '/mobile-dashboard', label: 'Mobile Dashboard', roles: ['admin'] },
  { slug: 'roles', path: '/roles', label: 'Role Management', roles: ['admin'], modals: [{ id: 'add-role', patterns: [/add role/i, /إضافة دور/] }, { id: 'permissions', patterns: [/manage permissions/i, /إدارة الصلاحيات/], dropdown: true }] },
  { slug: 'groups', path: '/groups', label: 'Group Management', roles: ['admin'], modals: [{ id: 'add-group', patterns: [/add group/i, /إضافة مجموعة/] }] },
  { slug: 'users', path: '/users', label: 'User Management', roles: ['admin'], modals: [{ id: 'add-user', patterns: [/add user/i, /إضافة مستخدم/] }] },
  { slug: 'students', path: '/students', label: 'Student Management', roles: ['admin'], modals: [{ id: 'add-parent', patterns: [/add parent/i, /إضافة ولي أمر/] }], rowAction: 'row-view' },
  { slug: 'student-register', path: '/students/register', label: 'Student Registration', roles: ['admin'], modals: [{ id: 'search-parent', patterns: [/search.*parent/i, /البحث في قاعدة بيانات/] }] },
  { slug: 'student-payments', path: '/students/payments', label: 'Student Payments', roles: ['admin'] },
  { slug: 'settings', path: '/settings', label: 'School Settings', roles: ['admin'], modals: [{ id: 'add-year', patterns: [/add year/i, /إضافة سنة/] }, { id: 'add-semester', patterns: [/add semester/i, /إضافة فصل/] }] },
  { slug: 'system-settings', path: '/system-settings', label: 'System Settings', roles: ['admin'] },

  // ── Transportation ──
  { slug: 'transportation', path: '/transportation', label: 'Transportation', roles: ['admin'], modals: [{ id: 'add-bus', patterns: [/add bus/i, /إضافة حافلة/] }] },
  { slug: 'transportation-daily-log', path: '/transportation/daily-log', label: 'Bus Daily Log', roles: ['admin'] },

  // ── Courses ──
  { slug: 'courses', path: '/courses', label: 'Course Management', roles: ['admin'] },
  { slug: 'course-create', path: '/courses/new', label: 'Create Course', roles: ['admin'] },
  { slug: 'course-details', path: '/courses/{courseId}', label: 'Course Details', roles: ['admin'], modals: [{ id: 'add-phase', patterns: [/add phase/i, /إضافة مرحلة/] }] },
  { slug: 'course-edit', path: '/courses/{courseId}/edit', label: 'Edit Course', roles: ['admin'] },
  { slug: 'course-enrollments', path: '/course-enrollments', label: 'Course Enrollments', roles: ['admin'] },
  { slug: 'graded-courses', path: '/graded-courses', label: 'Graded Courses', roles: ['admin'] },
  { slug: 'graded-course-create', path: '/graded-courses/new', label: 'Create Graded Course', roles: ['admin'] },

  // ── Schedules & attendance ──
  { slug: 'schedules', path: '/schedules', label: 'Schedule Management', roles: ['admin'] },
  { slug: 'attendance', path: '/attendance', label: 'Daily Attendance', roles: ['admin', 'teacher'] },
  { slug: 'attendance-sessions', path: '/attendance/sessions', label: 'Session Attendance', roles: ['admin', 'teacher'] },
  { slug: 'progress', path: '/progress', label: 'Progress Tracking', roles: ['admin', 'teacher'] },
  { slug: 'course-progress', path: '/progress/course/{courseId}', label: 'Course Progress', roles: ['admin', 'teacher'] },

  // ── Activities & approvals ──
  { slug: 'activities', path: '/activities', label: 'Activity Management', roles: ['admin', 'teacher'], modals: [{ id: 'add-activity', patterns: [/add activity/i, /إضافة نشاط/] }] },
  { slug: 'approvals', path: '/approvals', label: 'Approval Inbox', roles: ['admin', 'teacher'] },
  { slug: 'reports', path: '/reports', label: 'Reports', roles: ['admin'], modals: [{ id: 'generate-report', patterns: [/generate report/i, /إنشاء تقرير/] }] },

  // ── Enrollments ──
  { slug: 'enrollments', path: '/enrollments', label: 'Enrollment Management', roles: ['admin'] },
  { slug: 'enrollment-details', path: '/enrollments/{enrollmentId}', label: 'Enrollment Details', roles: ['admin'] },
  { slug: 'enrollment-edit', path: '/enrollments/{enrollmentId}/edit', label: 'Edit Enrollment', roles: ['admin'] },
  { slug: 'enrollment-print', path: '/enrollments/{enrollmentId}/print', label: 'Enrollment Print', roles: ['admin'] },

  // ── Payments (admin) ──
  { slug: 'payment-levels', path: '/settings/payments/levels', label: 'Payment Level Fees', roles: ['admin'] },
  { slug: 'payment-courses', path: '/settings/payments/courses', label: 'Payment Course Fees', roles: ['admin'] },
  { slug: 'payment-packages', path: '/settings/payments/packages', label: 'Fee Packages', roles: ['admin'] },
  { slug: 'payment-package-new', path: '/settings/payments/packages/new', label: 'New Fee Package', roles: ['admin'] },
  { slug: 'payment-package-edit', path: '/settings/payments/packages/{packageId}', label: 'Edit Fee Package', roles: ['admin'] },
  { slug: 'payment-level-edit', path: '/settings/payments/level/{levelId}', label: 'Edit Level Fees', roles: ['admin'] },
  { slug: 'payment-catalog-charges', path: '/settings/payments/catalog/charges', label: 'Charge Catalog', roles: ['admin'] },
  { slug: 'payment-catalog-discounts', path: '/settings/payments/catalog/discounts', label: 'Discount Catalog', roles: ['admin'] },
  { slug: 'notification-templates', path: '/settings/notification-templates', label: 'Notification Templates', roles: ['admin'] },
  { slug: 'message-letters', path: '/settings/message-letters', label: 'Message Letters', roles: ['admin'], modals: [{ id: 'new-letter', patterns: [/new letter/i, /رسالة جديدة/] }] },

  // ── Chat & messages ──
  { slug: 'chat-list', path: '/chat', label: 'Group Chat List', roles: ['admin', 'teacher', 'parent'] },
  { slug: 'chat-room', path: '/chat/{groupId}', label: 'Group Chat Room', roles: ['admin', 'teacher', 'parent'] },
  { slug: 'messages', path: '/messages', label: 'Direct Messages', roles: ['admin', 'teacher', 'parent'] },

  // ── Weekly sessions & meetings ──
  { slug: 'weekly-session-plans', path: '/weekly-session-plans', label: 'Weekly Session Plans', roles: ['admin'] },
  { slug: 'admin-meeting-rooms', path: '/admin/meeting-rooms', label: 'Admin Meeting Rooms', roles: ['admin'] },
  { slug: 'my-meeting-rooms', path: '/my-meeting-rooms', label: 'My Meeting Rooms', roles: ['admin', 'teacher'] },

  // ── Teacher ──
  { slug: 'teacher-schedule', path: '/teacher/schedule', label: 'Teacher Schedule', roles: ['teacher', 'admin'] },
  { slug: 'teacher-weekly-sessions', path: '/teacher-weekly-sessions', label: 'Teacher Weekly Sessions', roles: ['teacher', 'admin'] },
  { slug: 'teacher-graded-tasks', path: '/teacher/graded-criterion-tasks', label: 'Graded Criterion Tasks', roles: ['teacher', 'admin'], modals: [{ id: 'add-task', patterns: [/add task/i, /إضافة مهمة/], looseText: true }] },
  { slug: 'teacher-graded-marks', path: '/teacher/graded-marks', label: 'Graded Marks Grid', roles: ['teacher', 'admin'] },

  // ── Parent portal ──
  { slug: 'parent-dashboard', path: '/parent/dashboard', label: 'Parent Dashboard', roles: ['parent'] },
  { slug: 'parent-schedule', path: '/parent/schedule', label: 'Parent Schedule', roles: ['parent'] },
  { slug: 'parent-attendance', path: '/parent/attendance', label: 'Parent Attendance', roles: ['parent'] },
  { slug: 'parent-weekly-plans', path: '/parent/weekly-plans', label: 'Parent Weekly Plans', roles: ['parent'] },
  { slug: 'parent-assigned-activities', path: '/parent/assigned-activities', label: 'Parent Assigned Activities', roles: ['parent'] },
  { slug: 'parent-weekly-activities', path: '/parent/weekly-activities', label: 'Parent Weekly Activities', roles: ['parent'] },
  { slug: 'parent-progress', path: '/parent/progress', label: 'Parent Progress', roles: ['parent'] },
  { slug: 'parent-fees', path: '/parent/fees', label: 'Parent Fees', roles: ['parent'], modals: [{ id: 'pay-now', patterns: [/pay now/i, /ادفع الآن/] }] },
  { slug: 'parent-course-enrollments', path: '/parent/course-enrollments', label: 'Parent Course Enrollments', roles: ['parent'] },
]

export const CREDENTIALS = {
  admin: { email: 'admin@zinatalhaykindergarten.com', password: 'Admin123!' },
  teacher: { email: 'moza@zinat.local', password: 'Screenshot123!' },
  parent: { email: 'parent_95064063@zinat.local', password: 'Screenshot123!' },
}

export const BASE_URL = process.env.SCREENSHOT_BASE_URL || 'http://localhost:5173'
export const API_URL = process.env.SCREENSHOT_API_URL || 'http://localhost:3002/api'
export const OUT_DIR = process.env.SCREENSHOT_OUT_DIR || 'design-screenshots'
