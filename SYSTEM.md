# FIKR / Zinat Al-Haya — System Knowledge

This is the product memory for agents after chat history is cleared. Read the section that matches the task before changing code. After you add or change a page, flow, API, or rule, update this file in the same change.

Related files (do not duplicate them here):

| File | What it is |
|------|------------|
| `AGENT_DEPLOY_HANDOFF.md` | How to run locally, restore the DB dump, demo logins |
| `.cursor/rules/fikr-page-chrome.mdc` | List-page chrome (header, toolbar, dialogs) |
| `.cursor/rules/fikr-form-fields.mdc` | Input/label look (register-page tokens) |
| `.cursor/rules/grid-row-actions.mdc` | 3-dot row menus |
| `.cursor/rules/back-navigation-button.mdc` | Icon-only back control |
| `.cursor/rules/student-register-form.mdc` | `/students/register` wizard is not a list page |
| `.cursor/rules/notification-templates.mdc` | Template variables + locale on send |
| `TEMPLATE_INSTRUCTIONS.md` | Enrollment Word/docx merge fields |

Do **not** treat `README.md` as current product truth (it is outdated). Do **not** edit `_fikr-redesign-backup/` or `school-management-backend/dist/` as source.

---

## 1. What this product is

**FIKR** is a multi-tenant school / kindergarten platform. The first live tenant is **Zinat Al-Haya Kindergarten** (`landing_slug`: `zinat-al-haya`, school id `1`).

Three surfaces share one SPA + one API:

1. **Public / marketing** — platform hub, per-school landing, school signup, public enrollment form.
2. **School app** — admin, teacher, parent, student dashboards for one school.
3. **Platform console** — super-admin / system-user tools for all schools, plans, and platform billing.

Default UI language is **Arabic (RTL)**. English exists via `vue-i18n` (`ar` + `en` JSON).

---

## 2. Repo layout

```
zinat-al-haya-kindergarten/
  school-management-backend/     NestJS 11 API (TypeORM, PostgreSQL, JWT)
  school-management-unified/     Vue 3 SPA (Vite, Tailwind, Pinia, i18n)
  .cursor/rules/                 Agent UI/product rules
  backups/                       DB dumps (see AGENT_DEPLOY_HANDOFF.md)
  docker-compose.yml             Local Postgres (+ optional prod compose)
```

| Piece | Path | Stack | Default |
|-------|------|-------|---------|
| API | `school-management-backend/` | NestJS, TypeORM, JWT, Socket.IO | `http://localhost:3002` — routes under `/api` |
| SPA | `school-management-unified/` | Vue 3.5, Vite 7, Tailwind 3.4, vue-router 4, vue-i18n 11 | `http://localhost:5173` |
| DB | PostgreSQL 15 | `synchronize: false` — use migrations | `school_management` |

Frontend talks to the API via `VITE_API_BASE_URL` (dev default `http://localhost:3002/api`). Axios lives in `school-management-unified/src/services/api.ts`. Envelope: `{ success, data, message, count? }`. Auth header: `Authorization: Bearer <token>`.

Uploads are served at `/api/files/`. Socket.IO uses the API host without `/api`.

---

## 3. How to run

See `AGENT_DEPLOY_HANDOFF.md` for dump restore, env vars, and demo accounts. Short version:

```bash
# API
cd school-management-backend && npm install --legacy-peer-deps && npm run start:dev

# SPA (Node 20.19+ or 22.12+)
cd school-management-unified && npm install && npm run dev
```

Migrations: `school-management-backend/src/migrations/`. Run only when code is newer than the dump (`npm run migration:run`).

---

## 4. Personas, tenancy, and entry points

### Users

| Kind | How it is stored | Home after login |
|------|------------------|------------------|
| Platform super admin | `isSuperAdmin` / `isSystemUser`, `school_id` null, `user_type: platform` | `/platform/schools` |
| School admin | `role: admin` | `/dashboard` |
| Teacher | `role: teacher` | `/dashboard` (teacher-filtered nav) |
| Parent | `role: parent` | `/parent/dashboard` |
| Student | `role: student` | `/dashboard` (very small nav) |

`user_type` is `staff | parent | student | platform`. Legacy `role` is still used by the Vue router and sidebar.

### Tenancy

- Almost every school record has `school_id`.
- There is **no in-app school switcher**. Staff see only their school.
- Platform users manage many schools; they are **not** dropped into a school dashboard (`/dashboard` → `/platform/schools`).
- School status: `pending | active | suspended | rejected`. Pending/rejected school staff cannot sign in.

### Public entry

| Path | Who | What |
|------|-----|------|
| `/` | Anyone | FIKR platform hub (`ForSchoolsView`) |
| `/subscribe` | New school | Self-service school registration |
| `/s/:slug` | Public | School-branded landing CMS |
| `/s/:slug/login` | Staff/parents of that school | Branded login (logo/name) |
| `/login` | Anyone | Generic platform login |
| `/student-enrollment` | Prospective family | Public enrollment application (no auth) |

`/s/default` redirects to `/s/zinat-al-haya`. `/for-schools` redirects to `/`.

---

## 5. Architecture

```
Browser (Vue SPA)
  ├── vue-router (src/router/index.ts) — one file, all routes
  ├── DashboardLayout — sidebar + chrome for ~all authenticated pages
  ├── services/*.ts — Axios wrappers (Pinia is unused in real flows)
  └── i18n locales ar/en; main.ts currently forces Arabic + RTL
        │
        ▼
NestJS /api  (monolithic AppModule — most controllers/services registered there)
  ├── AuthModule (JWT) — global JwtAuthGuard + ClaimGuard; `@Public()` to opt out
  ├── ErrorsModule — AllExceptionsFilter, LoggingInterceptor, ErrorAlertService (email traces)
  ├── RbacModule (pages × actions, groups, claims)
  ├── ChatModule (group + DM + Socket.IO; JWT on handshake.auth.token)
  ├── NotificationsModule (global: email / SMS / push + templates)
  ├── PlatformBillingModule (plans, modules, school subscriptions)
  ├── PublicSubscriptionModule (school signup)
  └── ~40 inline controllers/services (school domain)
        │
        ▼
PostgreSQL (TypeORM entities + migrations) + ./uploads filesystem
```

**Frontend state:** component state + `localStorage` (`auth_token`, `user_data`, `language`). Pinia `stores/counter.ts` is leftover scaffold.

**Layout:** `App.vue` is only `<RouterView />`. Authenticated pages wrap themselves in `DashboardLayout.vue`. Public pages have their own chrome.

**JWT payload:** `sub`, `email`, `role`, `user_type`, `school_id`, `is_system_user`, `is_super_admin`.

**New API routes** use thrown Nest HTTP exceptions (not `{ success: false }` with HTTP 200) so `AllExceptionsFilter` can set status codes and alert on 5xx. Attach `@RequireClaim` when the surface is permissioned; use `@Public()` for intentionally open routes.

---

## 6. Auth, RBAC, and navigation

### Auth flow

1. `POST /api/auth/login` → JWT + user.
2. SPA stores `auth_token` and `user_data`.
3. Router `beforeEach` calls `authService.verifyToken()` (`GET /api/auth/verify`) on guarded routes.
4. Invalid token → logout → `/login`. A leftover token must **not** bounce `/login` ↔ `/dashboard` (verify-first).
5. Axios 401 clears storage and redirects to `/login` except on public paths (`/`, `/login`, `/subscribe`, `/student-enrollment`, `/s/*`).

Guards in `src/router/index.ts`:

- `requiresAuth` — most app pages
- `requiresAdmin` — admin or `isSuperAdmin`; others → `/dashboard`
- `requiresPlatform` — `isSuperAdmin` or `isSystemUser`
- Extra: teachers cannot open `/students*`; parents/students cannot open `/transportation*`; students cannot open `/chat*`; teachers hitting `/weekly-session-plans` go to `/teacher-weekly-sessions`

### RBAC (fine-grained)

Backend catalog: `school-management-backend/src/rbac/rbac-catalog.seed.ts`.

- **Pages** have a `key` + `route` + scope (`platform | school | both`) + allowed **actions**: `view search create edit delete approve export manage`.
- **RBAC groups** (UI label: “roles” / “user groups”) hold `pageKey → action[]`.
- Users belong to groups. Effective claims: `GET /api/rbac/me/claims`.
- UI: `/roles` list, `/roles/:id` page×action grid (`RoleManagementView`, `RoleClaimsView`).
- **Important:** the Vue router and sidebar are still **coarse role-based**. Fine claims are enforced mainly on the API (`ClaimGuard` + `@RequireClaim`). Do not assume hiding a nav item is the only security.
- Super admin / platform users bypass `ClaimGuard`. School admins currently also bypass `user_groups` claims during the RBAC transition.
- Effective claims: union of group permissions + per-user overrides. `GET /api/rbac/me/claims` also returns `entitledPageKeys` (subscription modules).

`/roles` is **permission groups**, not classroom groups. Classroom groups are `/groups`.

Platform entitlement: a school’s subscribed modules can limit which page keys it may use (`entitledPageKeys`).

### Sidebar (by persona)

Defined in `DashboardLayout.vue` (not the router).

**Admin:** Dashboard · Student management (students, register, enrollments, course enrollments) · School operations (schedules, flexible schedule, attendance, session attendance, activities) · Courses (milestone courses, graded, standalone, materials, weekly plans, progress) · Fee operations (charge sheets, pending receipts, pending transfers) · Chats (group, DM, approvals, admin meeting rooms) · Payment settings (catalogs, packages, installment plans, level fees, course fees) · Reports · Transportation · System administration (users, roles, settings, grades, class groups, system settings, landing editor, notification templates, message letters)

**Teacher:** Dashboard · Teaching (my schedule, graded tasks, graded marks, materials, weekly sessions, progress) · Attendance + activities · Course enrollments · Bus daily log · Chats + my meetings · Settings

**Parent:** Parent dashboard · My children (schedule, attendance, progress) · Learning (course enrollments, materials, weekly plans, assigned activities, weekly activities) · Fees · Chats + my meetings

**Student:** Dashboard · Progress · Direct messages · My meetings

**Platform:** Schools · Billing (plans, payments, transfers) · Roles

---

## 7. Design system (Fikr)

Brand: teal **primary `#00A19B`**, navy `#0A2147`, parchment/ice surfaces. Tokens in `school-management-unified/tailwind.config.js` and `src/assets/main.css`.

Shared Vue pieces:

- `FikrPageHeader` — title + subtitle only (no eyebrow)
- `FikrDialog` — `plain-footer`; pearl cancel + primary save
- `RowActionsMenu` / `RowActionsItem` — 3-dot menus, filled dots, default placement **up**
- `ListViewModeToggle` — cards vs table
- Fields: `fk-field` / `reg-input` / `fk-input` — white, gray border, primary focus ring

**Exceptions (do not flatten to list chrome):**

- `/students/register` — 3-step wizard, navy header, stepper, card footers
- Login, chat composers, live video rooms, print views

Back/up control: green square chevron, `h-8 w-8`, `rtl:rotate-180`, translated `aria-label`. See `back-navigation-button.mdc`.

`_fikr-redesign-backup/` is a snapshot of pre-redesign UI. Do not copy it forward unless asked.

---

## 8. Domain model (how pieces connect)

```
School
  ├── Users (admin/teacher/parent/student) + RBAC groups
  ├── AcademicYear → Semester
  ├── Grade (stage) + SchoolPaymentLevel
  ├── Class Group (classroom) ← Students ← Parents
  │     ├── Schedule / attendance / group chat
  │     └── Weekly session plans
  ├── Courses (kind: milestone | graded | standalone)
  │     ├── milestone: Phase → Milestone → StudentProgress
  │     ├── graded: scheme → semester config → criteria → teacher tasks → marks
  │     ├── materials (all kinds)
  │     └── StudentCourseEnrollment (optional paid extras)
  ├── Buses → students + daily movement log
  ├── Fee catalog → packages → links (grade / bus / course)
  │     └── StudentChargeSheet (per student + year) → installments → payments
  ├── Enrollments (applications) → on approve: Student + Parent(s)
  ├── Activities, message letters, notification templates
  └── Landing page CMS (/s/:slug)
```

**Two different “enrollments”:**

| Name | Table / API | Meaning |
|------|-------------|---------|
| Application enrollment | `enrollments` / `/enrollments` | Family applies; staff approve/reject |
| Course enrollment | `student_course_enrollments` / `/course-enrollments` | Student joins a course (often standalone/paid) |

**Two different “groups”:**

| Name | Route | Meaning |
|------|-------|---------|
| Class group | `/groups` | Classroom / age cohort |
| RBAC group | `/roles` | Permission set |

**Three course kinds** (`course_kind`):

| Kind | Admin UI | Teaching |
|------|----------|----------|
| `milestone` | `/courses` | Phases + milestones + `/progress` |
| `graded` | `/graded-courses` | Criteria, teacher tasks, marks grid, reports |
| `standalone` | `/standalone-courses` | Materials + optional course fee link; not milestone-based |

Materials work for all three (`/course-materials` and `/parent/course-materials` share `CourseMaterialsView`).

---

## 9. End-to-end flows

### 9.1 New school (platform)

1. Visitor opens `/` or `/subscribe`.
2. `POST /api/public/school-subscription/register` creates school (`status: pending`) + owner user (inactive until approve) + CR / ID uploads.
3. Platform admin at `/platform/schools` reviews and `POST /api/platform/schools/:id/approve`.
4. School becomes `active`; owner can log in at `/login` or `/s/:slug/login`.
5. Platform assigns a **plan** + modules (`/platform/plans`). Modules gate entitled pages.

### 9.2 Public student application

1. Family uses `/student-enrollment` (or a school landing CTA).
2. Multi-step form (student, academic, health, guardian, address, review) → `POST /api/enrollments`.
3. Staff list at `/enrollments`. Detail `/enrollments/:id`, edit, print (`/enrollments/:id/print` uses document generator / Word fields in `TEMPLATE_INSTRUCTIONS.md`).
4. **Approve** creates a `Student` + `Parent` record(s), sets enrollment `status: enrolled`, sends `enrollment.accepted`.
5. **Reject** sets `rejected` and sends `enrollment.rejected`.
6. Staff still assign the student to a **class group** (and bus, payment level) on `/students`.

### 9.3 In-app student register (staff)

`/students/register` is a **3-step wizard**: student → parent → group. It creates records directly (not the public application). Teachers are blocked from `/students*`.

### 9.4 Fees v2 (current billing)

Configure first, then generate a per-student sheet.

1. **Catalog** — charge types `/settings/payments/catalog/charges`, discounts `/settings/payments/catalog/discounts`.
2. **Package** — `/settings/payments/packages` + structure editor: which charges, upfront vs installment, per-year vs once, amounts per level/course.
3. **Installment plan** — `/settings/payments/installment-plans` (weights / dates). School `installment_due_day` (1–31 or null = last day) drives due dates (`installment-due-date.util.ts`).
4. **Links**
   - Grade/level → package: `/settings/payments/levels` → `/settings/payments/level/:levelId`
   - Course → package: `/settings/payments/courses` → `/settings/payments/course/:courseId`
   - Bus → package: on the bus editor
5. Student is on a grade/group, optional bus, optional course enrollments.
6. `/students/payments` opens the **charge sheet** (`GET/POST /api/fees/v2/students/:id/charge-sheet`). Refresh rebuilds lines from grade + bus + course links for the **active academic year**.
7. Admin assigns installment plan, discounts, optional upfront pay.
8. Pay:
   - Admin record installment / upfront → immediate `paid`
   - Parent `/parent/fees` — Thawani checkout (`POST /api/fees/v2/students/:id/payments/thawani/session`) or upload offline receipt (`pending_approval`)
   - Staff approve/reject at `/students/payments/pending-receipts`
   - Webhook `POST /api/fees/v2/payments/thawani/webhook` is `@Public()` (Thawani headers in CORS)
9. Transfers: platform batches `pending_reconcile` payments into a `FeeTransfer`; school approves at `/students/payments/pending-transfers` (platform view: `/platform/transfers`).
10. Due/late report: `/reports/fees/due-installments`.

**Payment statuses:** `pending`, `pending_approval`, `pending_reconcile`, `paid`, `rejected`, `cancelled`, `failed`.

School flag `payment_allow_admin_adjust_student_total` (on `schools`) allows admin to override a student’s total (legacy `/api/student-payments` path).

**Two fee systems coexist.** New work uses **fees v2** (`/api/fees/v2`, `StudentChargeSheetService`, `FeePaymentService`, `ThawaniService`). Legacy still live: `/api/payment-config` profiles, `/api/fee-packages`, `/api/student-payments` (`StudentPayment` / `StudentFeeCharge` / `PaymentTransaction`). Unrouted Vue editors (`StudentPaymentsView`, `PaymentLevelEditorView`, `PaymentFeePackageEditorView`, `PaymentCourseEditorView`) belong to the legacy path — do not revive them.

### 9.5 Milestone teaching

1. Admin creates course `/courses` → editor with phases/milestones.
2. Schedule maps group + course + teacher + room + time (`/schedules` or `/schedules/flexible`). Class durations / start times live in Settings (`class-settings`).
3. Teacher `/teacher/schedule` is read-only timetable.
4. `/progress` → `/progress/course/:id` marks milestone status per student.
5. Parents see `/parent/progress`.

### 9.6 Graded teaching

1. Admin `/graded-courses` creates a graded course + assessment scheme (semesters, criteria, weights).
2. Two mark models exist:
   - **Task-based:** teacher tasks per criterion (`GradedCriterionTeacherTask` → `GradedCriterionTaskStudentMark`) via `/teacher/graded-criterion-tasks` and `/api/graded-criterion-tasks`.
   - **Direct criterion marks:** semester grid (`GradedCriterionStudentMark`) via `/teacher/graded-marks` and `/api/graded-criterion-marks/grid`.
3. Reports: `/reports/graded-marks/class` and `/student` (`GET /api/graded-criterion-marks/reports/class|student`).
4. These endpoints are JWT + `Roles(admin, teacher)`.

### 9.7 Weekly sessions & live class

1. Admin `/weekly-session-plans` (teachers are redirected away).
2. Teacher `/teacher-weekly-sessions` — week/group filters, complete tasks, upload session media, start Daily.co online session.
3. Live room `/online-session/:id` (presence + student attendance).
4. Session attendance list `/attendance/sessions`.
5. Parents: `/parent/weekly-plans`.

Daily.co key: `DAILY_API_KEY` in backend `.env` / `.env.local`.

### 9.8 Daily attendance & activities

- `/attendance` (and `/attendance/collapsible-layout`) — bulk mark a class group for a date; export Word/Excel/PDF. Parents: `/parent/attendance`.
- `/activities` — school activities; can attach approval letters. Parents: `/parent/assigned-activities`, `/parent/weekly-activities`. Approvals land in `/approvals`.

### 9.9 Communications

| Channel | Staff UI | Parent/student | Backend |
|---------|----------|----------------|---------|
| Group chat | `/chat` → `/chat/:groupId` | same (not students) | `/api/chat/groups`, Socket.IO |
| Direct messages | `/messages` → `/messages/:threadId` | same | `/api/chat` DM endpoints |
| Message letters | `/settings/message-letters` compose + dispatch | `/approvals` if approval required | `/api/message-letters` + chat approval |
| Meeting rooms | Admin `/admin/meeting-rooms`; others `/my-meeting-rooms` | join `/meeting-room/:id` | Daily.co via `/api/meeting-rooms` |
| Notification templates | `/settings/notification-templates` | inbox/SMS/email | `NotificationDispatcherService` |

Template keys (`notification-template-keys.ts`):

- `payment.receipt`
- `payment.offline_submitted`
- `payment.rejected`
- `transfer.pending_school`
- `enrollment.accepted`
- `enrollment.rejected`
- `auth.password_reset`

Send path **must** take an explicit `locale` (`en` | `ar`) and resolve that locale’s stored template. See `notification-templates.mdc`.

### 9.10 Transportation

`/transportation` fleet → `/transportation/buses/new|:busId` editor (can link a fee package) → `/transportation/daily-log`. Students assigned from student management or bus editor. Parent dashboard shows bus movements.

---

## 10. Pages (route → view → job)

Almost every authenticated view wraps `DashboardLayout`. Router: `school-management-unified/src/router/index.ts`.

### Public

| Path | View | Job |
|------|------|-----|
| `/` | `ForSchoolsView` → `ForSchoolsGalleryLanding` | Platform marketing |
| `/s/:slug` | `LandingView` | School CMS page (`GET /api/public/landing/:slug`) |
| `/s/:slug/login`, `/login` | `LoginView` | JWT login; branded vs generic |
| `/subscribe` | `SchoolSubscriptionView` | New school signup |
| `/student-enrollment` | `StudentEnrollmentView` | Public application wizard |

### Platform (`requiresPlatform`)

| Path | View | Job |
|------|------|-----|
| `/platform/schools` | `PlatformSchoolsView` | List/approve schools, subscription |
| `/platform/plans` | `PlatformPlansView` | Plan catalog |
| `/platform/plans/:code` | `PlatformPlanEditView` | Plan modules/prices |
| `/platform/payments` | `PlatformFeePaymentsView` | Cross-school payment ledger |
| `/platform/transfers` | `PlatformFeeTransfersView` | Platform transfers / reconcile |

### Dashboards

| Path | View | Job |
|------|------|-----|
| `/dashboard` | `DashboardView` | Staff KPIs (`/api/statistics/dashboard`); teacher variant |
| `/mobile-dashboard` | `MobileDashboardView` | Compact/mobile shell |
| `/parent/dashboard` | `ParentDashboardView` | Children, trips, shortcuts |

### Students & applications

| Path | View | Job |
|------|------|-----|
| `/students` | `StudentManagementView` | List/edit, assign group/bus/parent/payment level |
| `/students/register` | `StudentRegistrationView` | In-app 3-step create |
| `/enrollments` | `EnrollmentManagementView` | Application inbox |
| `/enrollments/:id` | `EnrollmentDetailsView` | Approve / reject |
| `/enrollments/:id/edit` | `EnrollmentEditView` | Staff edit application |
| `/enrollments/:id/print` | `EnrollmentPrintView` | Print / document |
| `/course-enrollments` | `CourseEnrollmentView` | Staff enroll in courses |
| `/parent/course-enrollments` | `ParentCourseEnrollmentView` | Parent enrolls child |

### Academic structure

| Path | View | Job |
|------|------|-----|
| `/groups` | `GroupManagementView` | Classrooms |
| `/settings/grades` | `GradeLevelsView` | Grade/stage list (`GradeModal`) |
| `/settings` | `SettingsView` | School profile, years, semesters, class times (`canvas="ice"`) |
| `/system-settings` | `SystemSettingsView` | Key-value + payment flags |
| `/settings/landing-page` | `SchoolLandingEditorView` | CMS for `/s/:slug` |

### Courses & teaching

| Path | View | Job |
|------|------|-----|
| `/courses` | `CourseManagementView` | Milestone courses |
| `/courses/new`, `/courses/:id/edit` | `CourseEditorView` | Create/edit + phases |
| `/courses/:id` | `CourseDetailsView` | Phases/milestones |
| `/graded-courses` | `GradedCoursesListView` | Graded courses |
| `/graded-courses/new`, `/:courseId/edit` | `GradedCourseCreateView` | Scheme + criteria |
| `/standalone-courses` | `StandaloneCoursesView` | Standalone kind (admin) |
| `/course-materials`, `/parent/course-materials` | `CourseMaterialsView` | Upload/list/download |
| `/weekly-session-plans` | `WeeklySessionPlanView` | Admin plans |
| `/teacher-weekly-sessions` | `TeacherWeeklySessionsView` | Teacher week workflow |
| `/teacher/schedule` | `TeacherScheduleView` | Read-only timetable |
| `/teacher/graded-criterion-tasks` | `TeacherGradedCriterionTasksView` | Tasks |
| `/teacher/graded-marks` | `TeacherGradedMarksGridView` | Marks grid |
| `/progress` | `TeacherProgressView` | Milestone overview |
| `/progress/course/:id` | `CourseProgressView` | Per-course grid |
| `/parent/progress` | `ParentProgressView` | Parent view |
| `/parent/weekly-plans` | `ParentWeeklyPlansView` | Parent plans |

### Schedules & attendance

| Path | View | Job |
|------|------|-----|
| `/schedules` | `ScheduleManagementView` | Fixed weekly grid |
| `/schedules/flexible` | `ScheduleFlexibleView` | Flexible variant |
| `/attendance` | `AttendanceManagementView` | Daily group roll |
| `/attendance/sessions` | `SessionAttendanceManagementView` | Online session roll |
| `/parent/attendance` | `ParentAttendanceView` | Child history |
| `/parent/schedule` | `ParentScheduleView` | Child timetable |
| `/activities` | `ActivityManagementView` | Activities + letters |
| `/parent/assigned-activities` | `ParentAssignedActivitiesView` | Assigned list |
| `/parent/weekly-activities` | `ParentWeeklyActivitiesView` | Weekly feed |

### Fees

| Path | View | Job |
|------|------|-----|
| `/settings/payments/catalog/charges` | `PaymentChargeCatalogView` | Fee items |
| `/settings/payments/catalog/discounts` | `PaymentDiscountCatalogView` | Discount items |
| `/settings/payments/packages` | `PaymentFeePackagesView` | Packages |
| `/settings/payments/packages/new/:packageId` | `FeePackageStructureEditorView` | Package structure |
| `/settings/payments/installment-plans` | `InstallmentPlansView` | Plans |
| `/settings/payments/installment-plans/new/:planId` | `InstallmentPlanEditorView` | Plan entries |
| `/settings/payments/levels` | `PaymentLevelFeesView` | Level → package |
| `/settings/payments/level/:levelId` | `PaymentGradeFeeLinkView` | Edit level link |
| `/settings/payments/courses` | `PaymentCourseFeesView` | Course → package |
| `/settings/payments/course/:courseId` | `PaymentCourseFeeLinkView` | Edit course link |
| `/students/payments` | `StudentChargesView` | Charge sheets + take payment |
| `/students/payments/pending-receipts` | `FeePendingReceiptsView` | Approve offline |
| `/students/payments/pending-transfers` | `FeePendingTransfersView` | School transfers |
| `/parent/fees` | `ParentFeesView` | Parent pay (Thawani / receipt) |
| `/reports/fees/due-installments` | `DueInstallmentsReportView` | Due/late |

`/settings/payments` redirects to levels.

### Transport

| Path | View | Job |
|------|------|-----|
| `/transportation` | `TransportationManagementView` | Fleet |
| `/transportation/buses/new`, `/:busId` | `TransportationBusEditorView` | Bus + fee link |
| `/transportation/daily-log` | `BusDailyLogView` | Movements |

### Users & access

| Path | View | Job |
|------|------|-----|
| `/users` | `UserManagementView` | Users CRUD, password, activate |
| `/roles` | `RoleManagementView` | RBAC groups |
| `/roles/:id` | `RoleClaimsView` | Claims grid |

### Comms & video

| Path | View | Job |
|------|------|-----|
| `/chat` | `GroupChatListView` | Rooms |
| `/chat/:groupId` | `GroupChatRoomView` | Socket.IO room |
| `/messages` | `DirectMessagesLayoutView` + welcome pane | Mailbox |
| `/messages/:threadId` | `DirectChatRoomView` | Thread |
| `/approvals` | `ApprovalInboxView` | Letter/activity approvals |
| `/settings/message-letters` | `AdminMessageLettersView` | Compose/dispatch letters |
| `/settings/notification-templates` | `AdminNotificationTemplatesView` | Templates (TipTap) |
| `/admin/meeting-rooms` | `AdminMeetingRoomsView` | Schedule rooms |
| `/my-meeting-rooms` | `MyMeetingRoomsView` | Mine |
| `/meeting-room/:id` | `MeetingRoomView` | Daily.co meeting |
| `/online-session/:id` | `OnlineSessionRoomView` | Live class |

### Reports hub

Sidebar **Reports** has two submenu links, each opening its own list page so more reports can be added per category:

- Academic reports → `/reports/academic`
- Financial reports → `/reports/financial`

`/reports` redirects to `/reports/academic`.

| Path | View | Job |
|------|------|-----|
| `/reports` | redirect | → `/reports/academic` |
| `/reports/academic` | `ReportsView` | Academic report list |
| `/reports/financial` | `ReportsView` | Financial report list |
| `/reports/graded-marks/class` | `GradedMarksClassReportView` | Class marks |
| `/reports/graded-marks/student` | `GradedMarksStudentReportView` | Student marks |
| `/reports/fees/due-installments` | `DueInstallmentsReportView` | Due/late |

### Unrouted (do not revive unless asked)

`HomeView`, `AboutView`, `TeacherDashboardView`, `StudentPaymentsView`, `PaymentLevelEditorView`, `PaymentFeePackageEditorView`, `PaymentCourseEditorView`.

---

## 11. Backend API map

Global prefix: `/api`. CORS allows all origins + `thawani-signature` / `thawani-timestamp`. Validation: whitelist + forbid non-whitelisted.

| Prefix | Job |
|--------|-----|
| `/auth` | login, register, profile, verify, refresh, change/reset password |
| `/users` | CRUD, password, toggle active, by role |
| `/rbac` | catalog, me/claims, groups, permissions |
| `/students` | CRUD, search, by group/bus/parent, assign group/bus |
| `/parents` | CRUD, assign student, **dashboard** (`/parents/dashboard/my-data`, attendance, activities, bus-movements) |
| `/groups` | classroom CRUD, capacity, stats |
| `/grades` | grade levels, reorder, initialize defaults |
| `/academic-years`, `/semesters` | calendar |
| `/class-settings` | durations, start times, time slots |
| `/courses`, `/phases`, `/milestones` | milestone curriculum |
| `/course-enrollments` | enrollable list, enroll course/student, delete |
| `/course-materials` | list by course, upload, download |
| `/graded-assessment` | graded course CRUD |
| `/graded-criterion-tasks` | tasks, sync, marks-grid (task-level) |
| `/graded-criterion-marks` | marks grid + class/student reports |
| `/student-progress` | milestone progress + summaries |
| `/schedules` | weekly / by group/teacher/room |
| `/attendance` | daily roll, bulk, stats, daily report |
| `/weekly-session-plans` | plans, complete, copy week, tasks |
| `/session-media` | uploads for a plan |
| `/online-sessions` | create, join, presence, attendance |
| `/activities` | CRUD |
| `/enrollments` | public create + staff list/approve/reject/document |
| `/buses` | fleet, students, movements |
| `/payment-config` | levels, charge/discount types, school flags, profiles |
| `/fees/v2` | packages, installment plans, grade/bus/course links, charge sheets, pay, Thawani, transfers, due report |
| `/student-payments` | **legacy** ledger |
| `/fee-packages` | older package CRUD |
| `/notification-templates` | definitions, school overrides, preview |
| `/message-letters` | CRUD, audience preview, dispatch |
| `/chat` | group messages, DMs, approvals |
| `/meeting-rooms` | create, mine, join |
| `/settings` | school system key-value |
| `/school-landing` | authenticated CMS get/put |
| `/public/landing` | public landing by slug |
| `/public/school-subscription` | register school |
| `/public/platform-plans` | marketing plan list (public) |
| `/platform/schools` | list/approve |
| `/platform` (billing) | plans, modules, school subscription, invoices |
| `/statistics` | dashboard, progress, attendance, courses |
| `/files` | photo/document upload + static |
| `/mail` | status + test send |
| `/errors` | client crash report (`POST /errors/report`, public) |
| `/health`, `/health/simple` | health |
| `/debug` | **unguarded** env/DB/raw SQL — do not expose in production |

Frontend service files mirror these names under `school-management-unified/src/services/`.

---

## 12. Important entities (backend)

Under `school-management-backend/src/entities/`:

**Core:** `School`, `User`, `Student`, `Parent`, `Staff`, `Group`, `Grade`, `Room`, `AcademicYear`, `Semester`, `ClassSettings`

**Curriculum:** `Course` (`course_kind`), `Phase`, `Milestone`, `StudentProgress`, `StudentCourseEnrollment`, `CourseMaterial`

**Graded:** `GradedAssessmentScheme`, `GradedSemesterConfig`, `GradedCriterion`, `GradedCriterionTeacherTask`, `GradedCriterionTaskStudentMark` (task-based), `GradedCriterionStudentMark` (direct grid)

**Ops:** `Schedule`, `Attendance`, `WeeklySessionPlan`, `SessionMedia`, `Activity`, `Enrollment`, `Bus`, `BusMovementLog`

**Video:** `OnlineVideoSession`, `OnlineSessionPresence`, `OnlineSessionStudentAttendance`, `MeetingRoom`, `MeetingRoomInvitee`

**Fees v2:** `PaymentChargeType`, `PaymentDiscountType`, `FeePackage` + charge/discount/installment/level/course amount tables, `InstallmentPlan` + entries, `GradeFeeLink` / `BusFeeLink` / `CourseFeeLink` (+ lines), `StudentChargeSheet` + lines/installments/discounts, `StudentFeePayment`, `FeeTransfer` + lines

**Comms:** `SchoolMessageLetter`, `DirectChatMessage` / `DirectChatThread`, `GroupChatMessage`, `NotificationTemplateDefinition`, `SchoolNotificationTemplate`, `SchoolLandingPage`, `SchoolSystemSetting`

**RBAC:** `RbacPage`, `RbacAction`, `RbacPageAction`, `RbacGroup`, `RbacGroupPermission`, `RbacUserGroupMember`, `RbacUserPermissionOverride`, plus older `RbacRole*` tables

**Platform billing:** under `platform-billing/entities/` — `PlatformPlan`, prices, modules, `SchoolPlatformSubscription`, addons, invoices

Recent migrations of note (names in `src/migrations/`): student fee payments, graded criterion student marks, course materials, fee transfers, installment due dates, notification event templates, payment rejected template, notification template school branding.

---

## 13. i18n, files, and extras

- Locales: `school-management-unified/src/i18n/locales/ar.json` and `en.json`. Add keys to **both**.
- `main.ts` currently **forces** `language=ar` and `dir=rtl` on boot. `LanguageSwitcher` still exists in the sidebar.
- Capacitor 7 wrappers exist for mobile; `MobileDashboardView` is a compact dashboard.
- Thawani return page: `school-management-unified/public/pay-return.html`.
- Meeting / online video: Daily.co.
- Chat realtime: `socket.io-client` ↔ backend `ChatModule`.
- Design screenshots: `school-management-unified/design-screenshots/` (reference only; student-register purple mock is **deprecated**).

---

## 14. Agent conventions

When implementing UI:

1. Follow the matching `.cursor/rules/*.mdc` file.
2. Reuse `FikrPageHeader`, `FikrDialog`, `RowActionsMenu`, `ListViewModeToggle`.
3. Put new authenticated pages in `DashboardLayout` and add a **router entry** + **sidebar item** (correct persona).
4. If the page is a permission surface, add/update `RBAC_PAGE_SEED` and claims UI.
5. Mirror new strings in `ar.json` + `en.json`.
6. Prefer fees v2, not the legacy student-payments views.
7. Do not flatten `/students/register` into list-page chrome.
8. After a product change, update **this file**.

When implementing API:

1. Keep `/api` prefix and `{ success, data }` envelopes.
2. Scope by `school_id` unless the user is platform. Fees v2 already does this strictly; many legacy controllers do not.
3. Prefer `throw new HttpException` / Nest exceptions over catching and returning `{ success: false }` with HTTP 200 (so the global filter can set status + email 5xx).
4. Use `ClaimGuard` + `@RequireClaim` for new permission surfaces; `@Public()` for open routes. `@Roles()` only where that pattern already exists.
5. Notifications: declare only real variables; pass `locale` into `resolveForSend`.
6. New tables → TypeORM entity + migration (`synchronize` is false).
7. Do not add routes to `/debug`. Do not call unguarded legacy endpoints from new UI without adding auth.
8. Use Nest `Logger` in services you touch; HTTP traffic is already logged by `LoggingInterceptor`.

---

## 15. Quick “where do I edit X?”

| Task | Start here |
|------|------------|
| Add a page | `src/router/index.ts` + view + `DashboardLayout` nav + optional RBAC seed |
| Change list chrome | `.cursor/rules/fikr-page-chrome.mdc` + `GradeLevelsView` / `UserManagementView` as reference |
| Change form fields | `.cursor/rules/fikr-form-fields.mdc` |
| Student register wizard | `StudentRegistrationView.vue` + `student-register-form.mdc` |
| Fees config | `payment-config` + `fees/v2` + views under `/settings/payments` |
| Charge sheet / pay | `StudentChargeSheetService`, `FeePaymentService`, `ThawaniService` |
| Enrollment approve | `EnrollmentService.approveEnrollment` |
| Graded marks | `GradedCriterionMarksService` + teacher grid + reports |
| Templates | `NotificationTemplateService` + `AdminNotificationTemplatesView` |
| Sidebar | `DashboardLayout.vue` |
| Login redirect | `homeForStoredUser()` in `router/index.ts` |
| Demo passwords / DB | `AGENT_DEPLOY_HANDOFF.md` |

---

## 16. Error handling, logging, and alert emails

Centralized in `school-management-backend/src/common/`:

| Piece | Job |
|-------|-----|
| `ErrorsModule` | Registers global filter + HTTP logger; exports `ErrorAlertService` |
| `AllExceptionsFilter` | Catches every thrown exception; returns `{ success: false, message, error, statusCode, requestId? }`; logs warn (4xx) / error (5xx) |
| `LoggingInterceptor` | Assigns `X-Request-Id`, logs `→` / `←` method, path, status, duration (skips health + static files) |
| `ErrorAlertService` | Emails ops on API **5xx** (and all SPA crash reports) with stack + request context; dedupe + hourly cap |
| `POST /api/errors/report` | `@Public()` — SPA posts client crashes (`main.ts` errorHandler / unhandledrejection / axios 5xx) |

**SPA:** `school-management-unified/src/utils/error-reporting.ts` (`getErrorMessage`, `reportClientError`, `reportApiFailure`). Axios interceptor reports network failures (API 5xx are emailed server-side).

**Enable alert emails** (needs working SMTP):

```bash
ERROR_ALERT_ENABLED=true
ERROR_ALERT_EMAIL=ops@example.com
```

---

## 17. Security hardening (authZ / secrets / uploads)

| Control | Where |
|---------|--------|
| JWT secret required (no hardcoded fallback; rejects known leaked values) | `common/security/runtime-secrets.ts`, `auth.module`, `jwt.strategy` |
| `User.password` `select: false` + sanitize on student/parent/user responses | `user.entity`, `school-access.sanitizeUserDeep` |
| School scoping from JWT for students / parents / enrollments / users list | controllers + `resolveActorSchoolId` |
| Enrollments have `school_id` (migration `1785400000000`) | public create requires `school_id` |
| Register cannot create `admin`; school forced from actor | `auth.service.register` |
| Uploads **not** publicly static-mounted; `GET /api/files/:category/:filename` requires JWT | `main.ts`, `file-upload.controller` |
| Helmet + Throttler (login 10/min, reset 5/min) | `main.ts`, `AppModule`, `auth.controller` |
| CORS from `CORS_ORIGIN` allowlist (required in production) | `main.ts`, chat gateway |
| Crypto-strong temp passwords on reset (still email-based; token flow TBD) | `auth.service.resetPassword` |

**Still open / follow-up:** git history purge + rotate SMTP/Daily/DB in all environments; DOMPurify on template `v-html`; signed URL or blob-fetch for `<img>` of `/api/files` (browser won't send Bearer); full IDOR pass on remaining controllers (buses, chat, session media, etc.); token-based password reset.

**Secrets hygiene:** root `.gitignore` excludes `.env*`, dumps, `login_response.json`, `token_response.json`. Files were untracked from the index — **history purge + credential rotation still required** if the repo was ever pushed.

---

## 18. Integrations, env, and security caveats

| Integration | Service | Env / notes |
|-------------|---------|-------------|
| Thawani Checkout | `ThawaniService` | `THAWANI_BASE_URL`, `THAWANI_SECRET_KEY`, `THAWANI_PUBLISHABLE_KEY`. Amounts in OMR baisas. Webhook is public. Return: `public/pay-return.html`. |
| SMTP | `MailService` | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |
| Error alert email | `ErrorAlertService` | `ERROR_ALERT_EMAIL`, `ERROR_ALERT_ENABLED` (see §16) |
| SMS | `SmsService` | `SMS_PROVIDER=log` (default) or `http` + `SMS_HTTP_URL` / `SMS_HTTP_TOKEN` |
| Push | `PushService` | Stub — logs only, no FCM/device tokens yet |
| Daily.co | `OnlineSessionService`, meeting rooms | `DAILY_API_KEY` (often in `.env.local`) |
| Socket.IO | `ChatGateway` | JWT via `handshake.auth.token` or `?token=` |
| Word docs | `DocumentGeneratorService` | `docxtemplater` + enrollment template fields |

**Explicitly public (by design):** `POST /auth/login|reset-password`, `POST /enrollments`, `GET /grades/active`, `GET /public/*`, `POST /fees/v2/payments/thawani/webhook`, `POST /errors/report`, `/health`, `/`, (files are **not** public).

**Open because claims/scoping incomplete (legacy):** some older domain controllers still need school_id from JWT on every mutation — prefer fees-v2 pattern. `/debug` only if `ENABLE_DEBUG_ENDPOINTS=true`.

**Other caveats:**

- Global `APP_GUARD`: `JwtAuthGuard` + `ClaimGuard` + `ThrottlerGuard`. Use `@Public()` for open routes.
- `/debug` must stay off production.
- Dual fee systems (v1 + v2) and dual graded-mark tables — use the v2 / current UI paths above.
- Swagger is in package.json but not wired in `main.ts`.

