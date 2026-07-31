/** Seed definitions for rbac_pages + allowed actions (page → actions link). */

export const RBAC_ACTION_SEED = [
  { code: 'view', name: 'View', sortOrder: 1 },
  { code: 'search', name: 'Search', sortOrder: 2 },
  { code: 'create', name: 'Create', sortOrder: 3 },
  { code: 'edit', name: 'Edit', sortOrder: 4 },
  { code: 'delete', name: 'Delete', sortOrder: 5 },
  { code: 'approve', name: 'Approve', sortOrder: 6 },
  { code: 'export', name: 'Export', sortOrder: 7 },
  { code: 'manage', name: 'Manage', sortOrder: 8 },
] as const;

type Scope = 'platform' | 'school' | 'both';

export interface RbacPageSeed {
  key: string;
  route: string;
  nameEn: string;
  nameAr: string;
  scope: Scope;
  sortOrder: number;
  actions: readonly string[];
}

const CRUD = ['view', 'search', 'create', 'edit', 'delete'] as const;
const VIEW_SEARCH = ['view', 'search'] as const;
const VIEW_EDIT = ['view', 'search', 'edit'] as const;

export const RBAC_PAGE_SEED: RbacPageSeed[] = [
  // Platform
  { key: 'platform_schools', route: '/platform/schools', nameEn: 'Schools', nameAr: 'المدارس', scope: 'platform', sortOrder: 1, actions: [...CRUD, 'manage'] },
  { key: 'platform_subscriptions', route: '/platform/subscriptions', nameEn: 'Subscriptions', nameAr: 'الاشتراكات', scope: 'platform', sortOrder: 2, actions: [...VIEW_EDIT, 'approve', 'manage'] },
  { key: 'platform_payments', route: '/platform/payments', nameEn: 'Platform Payments', nameAr: 'مدفوعات المنصة', scope: 'platform', sortOrder: 3, actions: [...VIEW_SEARCH, 'edit', 'export', 'manage'] },
  { key: 'platform_system_users', route: '/platform/users', nameEn: 'System Users', nameAr: 'مستخدمو النظام', scope: 'platform', sortOrder: 4, actions: [...CRUD, 'manage'] },
  { key: 'platform_user_groups', route: '/platform/user-groups', nameEn: 'Platform User Groups', nameAr: 'مجموعات المنصة', scope: 'platform', sortOrder: 5, actions: [...CRUD, 'manage'] },

  // School core
  { key: 'dashboard', route: '/dashboard', nameEn: 'Dashboard', nameAr: 'لوحة التحكم', scope: 'school', sortOrder: 10, actions: ['view'] },
  { key: 'mobile_dashboard', route: '/mobile-dashboard', nameEn: 'Mobile Dashboard', nameAr: 'لوحة الجوال', scope: 'school', sortOrder: 11, actions: ['view'] },
  { key: 'users', route: '/users', nameEn: 'Users', nameAr: 'المستخدمون', scope: 'school', sortOrder: 12, actions: [...CRUD, 'manage'] },
  { key: 'user_groups', route: '/roles', nameEn: 'User Groups', nameAr: 'مجموعات المستخدمين', scope: 'school', sortOrder: 13, actions: [...CRUD, 'manage'] },
  { key: 'groups', route: '/groups', nameEn: 'Class Groups', nameAr: 'المجموعات', scope: 'school', sortOrder: 14, actions: [...CRUD] },
  { key: 'students', route: '/students', nameEn: 'Students', nameAr: 'الطلاب', scope: 'school', sortOrder: 15, actions: [...CRUD] },
  { key: 'student_register', route: '/students/register', nameEn: 'Student Registration', nameAr: 'تسجيل طالب', scope: 'school', sortOrder: 16, actions: ['view', 'create'] },
  { key: 'student_payments', route: '/students/payments', nameEn: 'Student Payments', nameAr: 'مدفوعات الطلاب', scope: 'school', sortOrder: 17, actions: [...VIEW_SEARCH, 'create', 'edit', 'export'] },
  { key: 'settings', route: '/settings', nameEn: 'School Settings', nameAr: 'إعدادات المدرسة', scope: 'school', sortOrder: 18, actions: ['view', 'edit', 'manage'] },
  { key: 'system_settings', route: '/system-settings', nameEn: 'System Settings', nameAr: 'إعدادات النظام', scope: 'both', sortOrder: 19, actions: ['view', 'edit', 'manage'] },

  { key: 'transportation', route: '/transportation', nameEn: 'Transportation', nameAr: 'النقل', scope: 'school', sortOrder: 20, actions: [...CRUD] },
  { key: 'transportation_daily_log', route: '/transportation/daily-log', nameEn: 'Bus Daily Log', nameAr: 'سجل الحافلات', scope: 'school', sortOrder: 21, actions: ['view', 'search', 'create', 'edit'] },

  { key: 'courses', route: '/courses', nameEn: 'Courses', nameAr: 'المقررات', scope: 'school', sortOrder: 30, actions: [...CRUD] },
  { key: 'course_enrollments', route: '/course-enrollments', nameEn: 'Course Enrollments', nameAr: 'تسجيل المقررات', scope: 'school', sortOrder: 31, actions: [...VIEW_EDIT, 'create', 'delete'] },
  { key: 'graded_courses', route: '/graded-courses', nameEn: 'Graded Courses', nameAr: 'مقررات التقييم', scope: 'school', sortOrder: 32, actions: [...CRUD] },
  { key: 'schedules', route: '/schedules', nameEn: 'Schedules', nameAr: 'الجداول', scope: 'school', sortOrder: 33, actions: [...CRUD] },
  { key: 'attendance', route: '/attendance', nameEn: 'Attendance', nameAr: 'الحضور', scope: 'school', sortOrder: 34, actions: ['view', 'search', 'create', 'edit'] },
  { key: 'attendance_sessions', route: '/attendance/sessions', nameEn: 'Session Attendance', nameAr: 'حضور الجلسات', scope: 'school', sortOrder: 35, actions: ['view', 'search', 'create', 'edit'] },
  { key: 'progress', route: '/progress', nameEn: 'Progress', nameAr: 'التقدم', scope: 'school', sortOrder: 36, actions: ['view', 'search', 'edit'] },
  { key: 'activities', route: '/activities', nameEn: 'Activities', nameAr: 'الأنشطة', scope: 'school', sortOrder: 37, actions: [...CRUD, 'approve'] },
  { key: 'approvals', route: '/approvals', nameEn: 'Approvals', nameAr: 'الموافقات', scope: 'school', sortOrder: 38, actions: ['view', 'search', 'approve'] },
  { key: 'reports', route: '/reports', nameEn: 'Reports', nameAr: 'التقارير', scope: 'school', sortOrder: 39, actions: ['view', 'search', 'export'] },

  { key: 'enrollments', route: '/enrollments', nameEn: 'Enrollments', nameAr: 'طلبات التسجيل', scope: 'school', sortOrder: 40, actions: [...VIEW_EDIT, 'approve', 'export', 'delete'] },
  { key: 'chat', route: '/chat', nameEn: 'Group Chat', nameAr: 'محادثة المجموعة', scope: 'school', sortOrder: 41, actions: ['view', 'create'] },
  { key: 'messages', route: '/messages', nameEn: 'Direct Messages', nameAr: 'الرسائل', scope: 'school', sortOrder: 42, actions: ['view', 'create'] },
  { key: 'weekly_session_plans', route: '/weekly-session-plans', nameEn: 'Weekly Session Plans', nameAr: 'خطط الجلسات', scope: 'school', sortOrder: 43, actions: [...CRUD] },
  { key: 'teacher_weekly_sessions', route: '/teacher-weekly-sessions', nameEn: 'Teacher Weekly Sessions', nameAr: 'جلسات المعلم', scope: 'school', sortOrder: 44, actions: ['view', 'search', 'edit'] },
  { key: 'teacher_schedule', route: '/teacher/schedule', nameEn: 'Teacher Schedule', nameAr: 'جدول المعلم', scope: 'school', sortOrder: 45, actions: ['view'] },
  { key: 'teacher_graded_tasks', route: '/teacher/graded-criterion-tasks', nameEn: 'Graded Tasks', nameAr: 'مهام التقييم', scope: 'school', sortOrder: 46, actions: ['view', 'create', 'edit', 'delete'] },
  { key: 'teacher_graded_marks', route: '/teacher/graded-marks', nameEn: 'Graded Marks', nameAr: 'درجات التقييم', scope: 'school', sortOrder: 47, actions: ['view', 'edit'] },
  { key: 'admin_meeting_rooms', route: '/admin/meeting-rooms', nameEn: 'Meeting Rooms', nameAr: 'غرف الاجتماعات', scope: 'school', sortOrder: 48, actions: [...CRUD] },
  { key: 'my_meeting_rooms', route: '/my-meeting-rooms', nameEn: 'My Meeting Rooms', nameAr: 'اجتماعاتي', scope: 'school', sortOrder: 49, actions: ['view', 'create'] },

  { key: 'payment_levels', route: '/settings/payments/levels', nameEn: 'Payment Levels', nameAr: 'مستويات الرسوم', scope: 'school', sortOrder: 50, actions: [...CRUD] },
  { key: 'payment_courses', route: '/settings/payments/courses', nameEn: 'Payment Courses', nameAr: 'رسوم المقررات', scope: 'school', sortOrder: 51, actions: [...CRUD] },
  { key: 'payment_packages', route: '/settings/payments/packages', nameEn: 'Fee Packages', nameAr: 'باقات الرسوم', scope: 'school', sortOrder: 52, actions: [...CRUD] },
  { key: 'payment_catalog_charges', route: '/settings/payments/catalog/charges', nameEn: 'Charge Catalog', nameAr: 'كتالوج الرسوم', scope: 'school', sortOrder: 53, actions: [...CRUD] },
  { key: 'payment_catalog_discounts', route: '/settings/payments/catalog/discounts', nameEn: 'Discount Catalog', nameAr: 'كتالوج الخصومات', scope: 'school', sortOrder: 54, actions: [...CRUD] },
  { key: 'notification_templates', route: '/settings/notification-templates', nameEn: 'Notification Templates', nameAr: 'قوالب الإشعارات', scope: 'school', sortOrder: 55, actions: ['view', 'edit', 'manage'] },
  { key: 'message_letters', route: '/settings/message-letters', nameEn: 'Message Letters', nameAr: 'الرسائل الرسمية', scope: 'school', sortOrder: 56, actions: [...CRUD, 'approve'] },

  { key: 'parent_dashboard', route: '/parent/dashboard', nameEn: 'Parent Dashboard', nameAr: 'لوحة ولي الأمر', scope: 'school', sortOrder: 70, actions: ['view'] },
  { key: 'parent_schedule', route: '/parent/schedule', nameEn: 'Parent Schedule', nameAr: 'جدول ولي الأمر', scope: 'school', sortOrder: 71, actions: ['view'] },
  { key: 'parent_attendance', route: '/parent/attendance', nameEn: 'Parent Attendance', nameAr: 'حضور ولي الأمر', scope: 'school', sortOrder: 72, actions: ['view'] },
  { key: 'parent_fees', route: '/parent/fees', nameEn: 'Parent Fees', nameAr: 'رسوم ولي الأمر', scope: 'school', sortOrder: 73, actions: ['view', 'create'] },
  { key: 'parent_progress', route: '/parent/progress', nameEn: 'Parent Progress', nameAr: 'تقدم ولي الأمر', scope: 'school', sortOrder: 74, actions: ['view'] },
  { key: 'parent_activities', route: '/parent/weekly-activities', nameEn: 'Parent Activities', nameAr: 'أنشطة ولي الأمر', scope: 'school', sortOrder: 75, actions: ['view', 'approve'] },
];
