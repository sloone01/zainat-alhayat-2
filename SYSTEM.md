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
| `.cursor/rules/student-edit-form.mdc` | `/students/:id/edit` tabs + parents grid |
| `.cursor/rules/notification-templates.mdc` | Template variables + locale on send |
| `TEMPLATE_INSTRUCTIONS.md` | Enrollment Word/docx merge fields |

**Later work:** §19 (school coverage roadmap). Do not start those items unless the user asks.

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
| Parent | `role: parent`, **`school_id` null** (login is school-less); school tenancy via `parents.school_id` + linked students | `/parent/dashboard` — sees **all linked children** across schools (no school switcher) |
| Student | `role: student` | `/dashboard` (very small nav) |

`user_type` is `staff | parent | student | platform`. Legacy `role` is still used by the Vue router and sidebar.

### Tenancy

- Almost every school record has `school_id` (**UUID**, same type as `schools.id`).
- Domain resource PKs are UUID (students, courses, groups, fees, chat, …). Leftover serial PKs (parents, rooms, staff, platform billing rows, …) were converted to UUID in migration `1790700000000-ConvertRemainingIntIdsToUuid`.
- **Exception:** RBAC catalog tables `rbac_pages` / `rbac_actions` stay integer seed IDs (composite permission keys).
- There is **no in-app school switcher**. Staff see only their school.
- **Parents** are not school-tethered on `users.school_id`. One parent login can have multiple school-scoped `Parent` profiles and children in different schools; parent self-APIs filter by `student_parents` (linked students), not JWT school.
- Platform users manage many schools; they are **not** dropped into a school dashboard (`/dashboard` → `/platform/schools`). Never treat `school_id` null alone as platform when `user_type`/`role` is parent or student (`isPlatformActor` in `school-access.ts`).
- School status: `pending | pending_payment | active | suspended | rejected`. Pending/rejected school staff cannot sign in. `pending_payment` may sign in but only `/billing` (Thawani) until the first invoice is paid.

### Public entry

| Path | Who | What |
|------|-----|------|
| `/` | Anyone | FIKR platform hub (`ForSchoolsView`) |
| `/docs`, `/docs/:audience/:slug` | Anyone | Public product documentation (staff + parent how-tos) |
| `/subscribe` | New school | Self-service school registration |
| `/s/:slug` | Public | School-branded landing CMS |
| `/s/:slug/login` | Staff/parents of that school | Branded login (logo/name) |
| `/login` | Anyone | Generic platform login |
| `/student-enrollment` | Prospective family | Public enrollment application (no auth). Query: `school_id` (UUID only). Form loads school name/logo/brand colors via `GET /api/public/landing/school-id/:id`. Brand colors are sampled from the school logo in Settings and stored on `school_landing_pages`. |

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

**JWT payload:** `sub`, `email`, `role`, `user_type`, `school_id`, `is_system_user`, `is_super_admin`. `is_system_user` reflects platform flags only — not “`school_id` is null” (parents are school-less).

**New API routes** use thrown Nest HTTP exceptions (not `{ success: false }` with HTTP 200) so `AllExceptionsFilter` can set status codes and alert on 5xx. Attach `@RequireClaim` when the surface is permissioned; use `@Public()` for intentionally open routes.

---

## 6. Auth, RBAC, and navigation

### Auth flow

1. `POST /api/auth/login` → JWT + user.
2. SPA stores `auth_token` and `user_data`.
3. Router `beforeEach` checks JWT `exp` locally on guarded routes (does **not** call `/auth/verify` on every navigation).
4. Axios refreshes the token when it is within 15 minutes of expiry (`POST /api/auth/refresh`). Refresh accepts a token that is still valid **or** expired by at most 2 hours (`JWT_REFRESH_GRACE_SECONDS`) so in-flight use is not logged out.
5. A 401 retries refresh once. If the token is expired and refresh fails, storage is cleared and the SPA goes to `/unauthorized` (not `/login`). Timeouts, network errors, and **5xx** never log the user out — they open `/error` with a support ticket. Login/refresh credential failures stay on the form. Leftover expired tokens on `/login` are dropped locally so they cannot bounce `/login` ↔ `/dashboard`.

Guards in `src/router/index.ts`:

- `requiresAuth` — most app pages
- `requiresAdmin` — admin or `isSuperAdmin`; others → `/dashboard`
- `requiresPlatform` — `isSuperAdmin` / `user_type: platform` / `isSystemUser`, never parent
- Extra: teachers cannot open `/students*`; parents/students cannot open `/transportation*`; students cannot open `/chat*`; teachers hitting `/weekly-session-plans` go to `/teacher-weekly-sessions`

### RBAC (fine-grained)

Backend catalog: `school-management-backend/src/rbac/rbac-catalog.seed.ts`.

- **Pages** have a `key` + `route` + scope (`platform | school | both`) + allowed **actions**: `view search create edit delete approve export manage`.
- **RBAC groups** (UI label: “roles” / “user groups”) hold `pageKey → action[]`.
- Users belong to groups. Effective claims: `GET /api/rbac/me/claims`.
- UI: `/roles` list, `/roles/new` create (details + package-entitled claims picker), `/roles/:id` claims grid (`RoleManagementView`, `RoleCreateView`, `RoleClaimsView`).
- School create/edit claim pickers list only pages in `entitledPageKeys` from the subscription package (when modules are synced).
- **Important:** the Vue router and sidebar are still **coarse role-based**. Fine claims are enforced mainly on the API (`ClaimGuard` + `@RequireClaim`). Do not assume hiding a nav item is the only security.
- Super admin / platform users bypass `ClaimGuard`. School admins currently also bypass `user_groups` claims during the RBAC transition.
- Effective claims: union of group permissions + per-user overrides. `GET /api/rbac/me/claims` also returns `entitledPageKeys` (subscription modules).
- **Adding a page:** insert a new `RBAC_PAGE_SEED` row + allowed actions; add the key to the subscription module `page_keys` if module-gated; copy grants onto groups that already have the sibling page. Never delete existing group claims to introduce a page.

`/roles` is **permission groups**, not classroom groups. Classroom groups are `/groups`.

Platform entitlement: a school’s subscribed modules can limit which page keys it may use (`entitledPageKeys`).

### Sidebar (by persona)

Defined in `DashboardLayout.vue` (not the router).

**Admin:** Dashboard · Student management (students, register, enrollments, course enrollments) · School operations (schedules, flexible schedule, attendance, session attendance, activities) · Courses (milestone courses, graded, standalone, materials, weekly plans, progress) · Fee operations (charge sheets, pending receipts, pending transfers) · Chats (group, DM, approvals, admin meeting rooms) · Payment settings (catalogs, packages, installment plans, level fees, course fees) · Reports · Transportation · **User management** (parents/students accounts, employees, user groups) · **Notifications** (email layouts, notification templates, message letters) · System administration (settings, grades, class groups, system settings, landing editor)

**Teacher:** Dashboard · Teaching (my schedule, graded tasks, graded marks, materials, weekly sessions, progress) · Attendance + activities · Course enrollments · Bus daily log · Chats + my meetings · Settings

**Parent:** Parent dashboard · My children (schedule, attendance, progress) · Learning (course enrollments, materials, weekly plans, assigned activities, weekly activities) · Fees · Chats + my meetings

**Student:** Dashboard · Progress · Direct messages · My meetings

**Platform:** Schools · Billing (plans, payments, transfers) · Roles · Notifications (email layouts, notification templates, system templates) · Activity log

---

## 7. Design system (Fikr)

Brand: teal **primary `#00A19B`**, navy `#0A2147`, parchment/ice surfaces. Tokens in `school-management-unified/tailwind.config.js` and `src/assets/main.css`.

Shared Vue pieces:

- `FikrPageHeader` — title + subtitle only (no eyebrow)
- `FikrDialog` — `plain-footer`; pearl cancel + primary save
- `RowActionsMenu` / `RowActionsItem` — 3-dot menus, filled dots, default placement **up**
- `ListViewModeToggle` — cards vs table
- Fields: `fk-field` / `reg-input` / `fk-input` — white, gray border, primary focus ring
- Labels: `mb-1.5 block text-xs font-medium text-gray-600` (or `fk-flabel`)
- Editor tabs: Student-edit / bus-editor pills (`bg-primary-600` active), not navy `fk-segmented`

**Exceptions (do not flatten to list chrome):**

- Login, chat composers, live video rooms, print views

`/students/register` — 3-step wizard, navy header, stepper, card footers

**Parent & teacher surfaces** (`Parent*View`, `Teacher*View`, `CourseProgressView`) use the same Fikr chrome as admin lists: `fk-page` + `FikrPageHeader`, `fk-card` / `fk-card__title` / `fk-card__meta` section headers, primary spinners and accents (no purple/indigo legacy), and empty states with the gray rounded icon well (`h-14 w-14 rounded-2xl bg-gray-100`).

**Native mobile shell (Capacitor Android/iOS only):** `DashboardLayout` shows a fixed 5-tab bottom bar (`MobileBottomNav`) — Activities · Home · Chats · Schedule · Account — with role-specific routes (`navigation/mobile-bottom-nav.ts`). Web browsers never show it (`isNativeApp()` / `Capacitor.isNativePlatform()`). Account tab opens `/mobile/account` for overflow links + language + sign-out. Bar is hidden on chat/DM threads and live meeting rooms.

**App shell branding:** `useSchoolBrand` drives sidebar logo/name, `document.title`, and favicon. Platform actors get FIKR; school tenants get landing CMS brand. Default `index.html` is FIKR.

**Android project:** `school-management-unified/android/` (`appId` `com.fikr.school`). iOS: `school-management-unified/ios/`. Config: `capacitor.config.ts`. Mobile builds use `.env.mobile` → Railway API `https://divine-clarity-production-d359.up.railway.app/api`.

```bash
cd school-management-unified
npm run cap:sync          # build:mobile + sync android/ios
npm run cap:android       # sync + open Android Studio
npm run cap:ios           # sync + open Xcode
# or: npx cap run ios --target <simulator-udid>
```

Backend `CORS_ORIGIN` must include `https://localhost` (and optionally `capacitor://localhost`) for the Capacitor WebView. Physical device on LAN is not required when using Railway HTTPS.

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
| `milestone` | `/courses` | Phases + milestones + `/progress` (core curriculum) |
| `graded` | `/graded-courses` | Criteria, teacher tasks, marks grid, reports (no phases) |
| `standalone` | `/standalone-courses` | Same phase/milestone editor as milestone courses, plus materials + optional course fee / enrollment — product surface kept separate via `course_kind` |

Materials work for all three (`/course-materials` and `/parent/course-materials` share `CourseMaterialsView`).

---

## 9. End-to-end flows

### 9.1 New school (platform)

1. Visitor opens `/` or `/subscribe`. The marketing hub consult form (**المتابعة للاشتراك**) collects school name, admin email, **mobile**, and school size, then `POST /api/public/school-subscription/inquiry` emails the real inquiry inbox (`PLATFORM_INQUIRY_EMAIL`, else `ERROR_ALERT_EMAIL`, plus any platform operator with a routable mailbox — not seed `@zinat.platform` logins) via `platform.school_inquiry`, emails the visitor a confirmation (`platform.school_inquiry_received`), and shows an on-page “our team will contact you” message — it does **not** start `/subscribe`.
2. Owner email is verified via OTP (`POST /api/public/school-subscription/email-otp/send` → `…/email-otp/verify`). In non-production, the OTP is always `000000`.
3. `POST /api/public/school-subscription/register` (requires `email_verification_token`) creates school (`status: pending`) + owner user (inactive until approve) + CR / ID uploads.
4. **Or** a platform admin opens `/platform/schools/new` and registers directly (`POST /api/platform/schools`, claim `platform_schools` manage) — no OTP; CR/ID optional. **Save as draft** leaves the school `pending`. **Submit & activate** requires paid amount + receipt file, issues/marks the first invoice paid, activates the school, and emails the owner one combined message (`platform.school_approved`: registration + temporary password + payment receipt; receipt file attached when uploaded).
5. Platform admin opens `/platform/schools/registration` (**بيانات التسجيل**; school selected without id in the URL), reviews details, then confirms approve (`POST …/approve`) or reject (`POST …/reject`) when the school is still pending (e.g. public signup or a draft).
6. Approve (from a pending school) issues the first platform invoice, emails the owner a temporary password (`platform.school_approved`), and sets school `pending_payment` (unless the invoice is zero — then `active`).
7. Owner signs in at `/login` or `/s/:slug/login`. Nav is **Payment only** (`/billing`) while `pending_payment`. They pay with Thawani (`POST /api/school-billing/thawani/session` + webhook `POST /api/fees/v2/payments/thawani/webhook`).
8. Paid invoice sets school + subscription `active` and unlocks the plan’s entitled pages. Platform can mark paid from the school billing drawer (`POST /api/platform/invoices/:id/mark-paid` multipart: required `paid_amount`, optional note + receipt; stores `paid_amount` / `paid_receipt_url` without changing invoice total). Owner receives `platform.invoice_paid` email/SMS as a payment receipt; uploaded receipt file is attached when present.

### 9.2 Public student application

1. Family uses `/student-enrollment` (or a school landing CTA).
2. Multi-step form (student, academic, health, guardian, address, review) → `POST /api/enrollments`.
3. Staff list at `/enrollments`. Detail `/enrollments/:id`, edit, print (`/enrollments/:id/print` uses document generator / Word fields in `TEMPLATE_INSTRUCTIONS.md`).
4. **Approve** creates a `Student` + `Parent` record(s), sets enrollment `status: enrolled`, sends `enrollment.accepted`.
5. **Reject** sets `rejected` and sends `enrollment.rejected`.
6. Staff still assign the student to a **class group** (and bus, payment level) on `/students`.

### 9.3 In-app student register (staff)

`/students/register` is a **3-step wizard**: student → parent → group. It creates records directly (not the public application). Teachers are blocked from `/students*`.

Staff submit **`POST /api/students/register`** (`students` `create`). That call:

- Creates the student and assigns the selected class group (fee level comes from the group).
- Links an existing parent **or** creates a parent record.
- Optional **Create user account** (parent): creates a `User` (`user_type: parent`), links `parent.user_id`, emails a temporary password.
- Optional **Create student login**: creates a `User` (`user_type: student`), links `student.user_id`, emails a temporary password (requires a student email). Kindergarten default is parent-only login; student login stays opt-in.

`/students/:id/edit` is a separate **tabbed editor** (student · parents · class · bus). The **Parents** tab is a grid: add father / mother / guardian, choosing an existing parent or creating a new profile (type-specific fields). Join table `student_parents.relationship` stores the role.

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
6. `/students/payments` opens the **charge sheet** (`GET/POST /api/fees/v2/students/:id/charge-sheet`). **Update** (`PUT .../charge-sheet/plan`) is the single save: rebuilds lines from grade + bus + course links, writes discounts, and sets the editable **advance (مقدم)** from the schedule grid (sequence `0` row). Assigning/removing a bus (or class group) also rebuilds the sheet; `GET` charge-sheet auto-rebuilds when saved lines disagree with current grade/bus/course candidates (including charges removed from a package structure but still stored on a link amount). Grade/level amounts come from the level payment profile (`level_payment_charge_lines`) when present, with `grade_fee_link_lines` as fallback; saving a level profile also syncs `grade_fee_links` so both stores stay aligned.
7. A sheet always gets one **immediate مقدم** installment (sequence `0`, due today) whenever net due > 0 — amount comes from the editable **advance** (and can be raised up to net due). Remaining after advance is split on the plan, earlier rows rounded **up to 5**, last installment absorbs leftover (smallest). Changing the advance in the schedule grid **live-previews** the same split before Save; unsaved plan/discount/advance changes hide **إضافة دفعة** and show a red **بانتظار الحفظ** until Update. On the schedule grid the مقدم row’s due amount is editable **until payment is initiated** — money applied (`amount_paid` / `paid_total` / payment `paid`) **or** an open receipt (`pending` / `pending_approval` / `pending_reconcile`); then plan/advance/discounts lock to labels. **إضافة دفعة** allocation lists unpaid installments in schedule order (**مقدم first**); rows with an open pending receipt stay visible but disabled until that receipt is resolved.
8. Pay:
   - Staff **Add payment** on the schedule: enter amount + receipt, then allocate across open installments in sequence (cannot exceed a row’s remaining; later rows stay locked until the previous is fully covered). `POST /api/fees/v2/students/:id/payments/offline` with `allocations` creates one shared `payments` header (`payment_ref`) and one `student_fee_payments` slice per installment (same proof). Parent offline/Thawani stay single-target and also create a `payments` row.
   - Parent `/parent/fees` — Thawani checkout (`POST /api/fees/v2/students/:id/payments/thawani/session`) or upload offline receipt (`pending_approval`)
   - Staff approve/reject at `/students/payments/pending-receipts`
   - Webhook `POST /api/fees/v2/payments/thawani/webhook` is `@Public()` (Thawani headers in CORS)
9. Transfers: platform batches `pending_reconcile` payments into a `FeeTransfer`; school approves at `/students/payments/pending-transfers` (platform view: `/platform/transfers`).
10. Due/late report: `/reports/fees/due-installments`.

**Payment statuses:** `pending`, `pending_approval`, `pending_reconcile`, `paid`, `rejected`, `cancelled`, `failed`.

School flag `payment_allow_admin_adjust_student_total` (on `schools`) allows admin to override a student’s total (legacy `/api/student-payments` path).

**Two fee systems coexist.** New work uses **fees v2** (`/api/fees/v2`, `StudentChargeSheetService`, `FeePaymentService`, `ThawaniService`). Shared receipt headers live in reusable table **`payments`** (`Payment` entity, `payment_ref`); fee slices in `student_fee_payments` link via `payment_id`. Legacy still live: `/api/payment-config` profiles, `/api/fee-packages`, `/api/student-payments` (`StudentPayment` / `StudentFeeCharge` / `PaymentTransaction`). Unrouted Vue editors (`StudentPaymentsView`, `PaymentLevelEditorView`, `PaymentFeePackageEditorView`, `PaymentCourseEditorView`) belong to the legacy path — do not revive them.

### 9.5 Milestone teaching

1. Admin creates course `/courses` → editor tabs (course info; learning phases + milestones).
2. Schedule maps group + course + teacher + room + time (`/schedules` fixed grid, or `/flexible` flexible timetable). Class durations / start–end / breaks live in Settings (`class-settings`). One duration must be **Default**; regenerating periods uses first-class → end, inserting break slots. Regenerating updates the period template only — existing schedule rows keep their times until edited. On `/schedules`, period start/duration come only from that template (no duration picker); break rows are non-assignable; empty room is shown blank (no “بدون غرفة”). `/schedules/flexible` redirects to `/flexible`.
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

1. Admin `/weekly-session-plans` (teachers are redirected away). Group + week pickers; no summary stat chips or jump-to-schedule link.
2. Teacher `/teacher-weekly-sessions` — week/group filters, complete tasks, upload session media, start Daily.co online session.
3. Live room `/online-session/:id` (presence + student attendance).
4. Session attendance list `/attendance/sessions`.
5. Parents: `/parent/weekly-plans`.

Daily.co key: `DAILY_API_KEY` in backend `.env` / `.env.local`.

### 9.8 Daily attendance & activities

- `/attendance` (and `/attendance/collapsible-layout`) — bulk mark a class group for a date (inline group + date pickers); export via icon menu (Word/Excel/PDF). Parents: `/parent/attendance`.
- `/activities` — school activities; can attach parent-approval letters (composer matches notification-templates: template picker from message letters, centered EN/AR, subject + variables inside the email editor). Parents: `/parent/assigned-activities`, `/parent/weekly-activities`. Approvals land in `/approvals`.

### 9.9 Communications

| Channel | Staff UI | Parent/student | Backend |
|---------|----------|----------------|---------|
| Group chat | `/chat` → `/chat/:groupId` | same (not students) | `/api/chat/groups`, Socket.IO; ad-hoc + bus rooms |
| Direct messages | `/messages` → `/messages/:threadId` | same | `/api/chat` DM endpoints |
| Message letters | `/settings/message-letters` compose + dispatch | `/approvals` if approval required | `/api/message-letters` + chat approval |
| Meeting rooms | Admin `/admin/meeting-rooms`; others `/my-meeting-rooms` | join `/meeting-room/:id` | Daily.co via `/api/meeting-rooms` |
| Notification templates | `/settings/notification-layouts`, `/settings/notification-templates`, `/settings/notification-sms` (platform mirrors under `/platform/...`) | inbox/SMS/email | `NotificationDispatcherService` + layouts |

**Group chat kinds:** (1) **class** — implicit membership from class group / schedule / child enrollment; (2) **ad-hoc** — `POST /api/chat/rooms` with name + `userIds` (`chat:create`); (3) **bus** — `POST /api/chat/rooms/from-bus/:busId` adds parents of students on that bus (idempotent per bus). Tables: `adhoc_chat_rooms`, `adhoc_chat_room_members`, `adhoc_chat_messages`. List mixes all kinds on `GET /api/chat/groups`.

**Layouts vs content:** Email **layouts** are reusable HTML shells with `{{content}}` (school table `school_notification_layouts`; platform product defaults in `platform_notification_layouts`). Email/SMS **content** stays on notification templates; each school template may set `layout_id`. Send path wraps body via `applyEmailLayout` when a layout applies.

**System / platform emails** (`audience: system`, keys `platform.*`): FIKR chrome (navy `#0A2147` + teal `#00A19B`). Header is a full-width row: **فكر / FIKR** title at the reading start, wordmark at the far end (EN: title left / logo right; AR: title right / logo left). Layout is **full width** (no centered card). Body copy is plain formatted text (no tinted boxes). Logo is **embedded inline** (`cid:fikr-logo@fikr`). Preview uses `GET /api/public/branding/fikr-logo.png`. Preview at `/platform/system-templates`.

**School emails:** school logo/name from school settings; default shell uses the same FIKR palette with `{{schoolName}}` / `{{schoolLogoHtml}}`.

Template keys (`notification-template-keys.ts`):

- `payment.receipt`
- `payment.offline_submitted`
- `payment.rejected`
- `transfer.pending_school`
- `enrollment.accepted`
- `enrollment.rejected`
- `auth.password_reset`
- `platform.invoice_paid` (owner payment receipt when platform marks invoice paid; file attachment supported)
- `platform.school_inquiry` (landing consult form → inquiry inbox / platform operators)
- `platform.school_inquiry_received` (confirmation to the visitor’s email)

Send path **must** take an explicit `locale` (`en` | `ar`) and resolve that locale’s stored template. See `notification-templates.mdc`.

### 9.10 Transportation

`/transportation` fleet → `/transportation/buses/new|:busId` editor (can link a fee package) → `/transportation/daily-log`. Students assigned from student management or bus editor. Bus row action **Chat with bus parents** opens/creates an ad-hoc bus chat. Parent dashboard shows bus movements.

---

## 10. Pages (route → view → job)

Almost every authenticated view wraps `DashboardLayout`. Router: `school-management-unified/src/router/index.ts`.

### Public

| Path | View | Job |
|------|------|-----|
| `/` | `ForSchoolsView` → `ForSchoolsGalleryLanding` | Platform marketing hub. Navbar: Features, Pricing, **Documentation**, demo school, language, sign in, subscribe. Hero: desktop browser + 2 phones. Features (`#gallery-features`): **navy dark band**, centered title + **6 icon cards** (transport, attendance, courses/grading, activities, chats/video/messages, fees) in FIKR teal — each card links to the matching staff how-to under `/docs`. Pricing (`#gallery-pricing`) is live plan cards from the public catalog, plus a third **custom** card (مخصص) whose CTA (**اختر ما يناسبك** / Choose what suits you) links to `/custom-plan`. Bottom consult form emails platform operators (`POST /public/school-subscription/inquiry`) instead of navigating to `/subscribe`. |
| `/docs`, `/docs/:audience/:slug` | `DocsView` | Public product documentation (no auth). Audience `staff` \| `parents`. Sidebar of topics/subtopics; articles are how-tos (who / when / numbered steps) in `src/docs/` (ar+en). `/docs` redirects to `/docs/staff/sign-in`. Same marketing header/footer as `/`. |
| `/custom-plan` | `CustomPlanRequestView` | Public custom-plan builder: optional module grid with explanations, then contact details; submits `POST /api/public/school-subscription/custom-plan-request`. |
| `/s/:slug` | `LandingView` | School CMS page (`GET /api/public/landing/:slug`) |
| `/s/:slug/login`, `/login` | `LoginView` | JWT login; branded vs generic |
| `/unauthorized` | `UnauthorizedView` | Session ended (401). Sign-in CTA; no ticket |
| `/error` | `SystemErrorView` | Unexpected error with support ticket number (issues one via `POST /errors/report` if the URL has none) |
| `/subscribe` | `SchoolSubscriptionView` | New school signup. Billing period tabs (monthly / semester / yearly / summer) sit centered under the plan heading. Priced plans register in-place; the custom/contact card (**اختر ما يناسبك**) goes to `/custom-plan` (same module + contact flow as the marketing hub). |
| `/student-enrollment` | `StudentEnrollmentView` | Public application wizard |

### Platform (`requiresPlatform`)

| Path | View | Job |
|------|------|-----|
| `/platform/schools` | `PlatformSchoolsView` | List schools; **Register school** CTA; row menu opens registration page or billing |
| `/platform/schools/new` | `PlatformSchoolRegisterView` | Platform admin creates a school + owner (optional docs; activate now) |
| `/platform/schools/registration` | `PlatformSchoolRegistrationView` | **بيانات التسجيل** — school id via session/history state (not URL); approve/reject |
| `/platform/plans` | `PlatformPlansView` | Plan catalog |
| `/platform/plans/:code` | `PlatformPlanEditView` | Plan modules/prices |
| `/platform/custom-plan-requests` | `PlatformCustomPlanRequestsView` | Inbox of custom-plan requests from landing (modules + contact); status new/contacted/closed |
| `/platform/payments` | `PlatformFeePaymentsView` | Cross-school payment ledger |
| `/platform/transfers` | `PlatformFeeTransfersView` | Platform transfers / reconcile |

### Dashboards

| Path | View | Job |
|------|------|-----|
| `/dashboard` | `DashboardView` | Staff KPIs (`/api/statistics/dashboard`); teacher variant |
| `/billing` | `SchoolBillingView` | School admin pays the platform subscription (Thawani); only nav while `pending_payment` |
| `/mobile-dashboard` | `MobileDashboardView` | Compact/mobile shell |
| `/parent/dashboard` | `ParentDashboardView` | Children, trips, shortcuts |

### Students & applications

| Path | View | Job |
|------|------|-----|
| `/students` | `StudentManagementView` | List/view, assign group/bus shortcuts; Edit opens edit page; no summary stat chips |
| `/students/register` | `StudentRegistrationView` | In-app 3-step create |
| `/students/:id/edit` | `StudentEditView` | Tabbed edit (student / parents grid / class / bus) |
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
| `/settings` | `SettingsView` | School profile, years, semesters, class times (`canvas="ice"`). Logo URL + **Detect from logo** samples primary/accent hex into `school_landing_pages.brand_*_color` for public enrollment branding. |
| `/system-settings` | `SystemSettingsView` | Key-value + payment flags |
| `/settings/landing-page` | `SchoolLandingEditorView` | CMS for `/s/:slug` |

### Courses & teaching

| Path | View | Job |
|------|------|-----|
| `/courses` | `CourseManagementView` | Milestone courses |
| `/courses/new`, `/courses/:id/edit` | `CourseEditorView` | Tabs: course info + learning phases with milestones |
| `/courses/:id` | `CourseDetailsView` | Phases/milestones |
| `/graded-courses` | `GradedCoursesListView` | Graded courses (assessment scheme; no phases) |
| `/graded-courses/new`, `/:courseId/edit` | `GradedCourseCreateView` | Scheme + criteria |
| `/standalone-courses` | `CourseManagementView` (`courseKind: standalone`) | Standalone list + phases count |
| `/standalone-courses/new`, `/:id/edit` | `CourseEditorView` | Phases editor for standalone |
| `/standalone-courses/:id` | `CourseDetailsView` | Phases/milestones + materials link |
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
| `/schedules` | `ScheduleManagementView` | Fixed weekly grid; group picker in the toolbar; export via icon menu (Word/Excel/PDF) |
| `/flexible` | `ScheduleFlexibleView` | Flexible timetable (not under `/schedules`); `/schedules/flexible` redirects here |
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
| `/settings/payments/packages` | `PaymentFeePackagesView` | Packages (list includes `charge_lines` for the count chip) |
| `/settings/payments/packages/new/:packageId` | `FeePackageStructureEditorView` | Package structure |
| `/settings/payments/installment-plans` | `InstallmentPlansView` | Plans |
| `/settings/payments/installment-plans/new/:planId` | `InstallmentPlanEditorView` | Plan entries |
| `/settings/payments/levels` | `PaymentLevelFeesView` | Level → package |
| `/settings/payments/level/:levelId` | `PaymentGradeFeeLinkView` | Edit level link |
| `/settings/payments/courses` | `PaymentCourseFeesView` | Course → package |
| `/settings/payments/course/:courseId` | `PaymentCourseFeeLinkView` | Edit course link |
| `/students/payments` | `StudentChargesView` | **Server-paged** student list (`GET /students?page&limit&q&fee_level`) + charge summaries scoped by `student_ids`; open row → charge sheet (one **Update**; schedule grid shows due/paid/remaining, **partially paid**, and `payment_ref` from shared `payments`; **Add payment** allocates a receipt across installments in order). Payment request list/approve is on pending-receipts, not embedded here. |
| `/students/payments/pending-receipts` | `FeePendingReceiptsView` | School inbox of receipts (`pending_approval` / `pending_reconcile`); **View receipt** loads `/api/files/...` with JWT (blob URL). Approve/reject of parent receipts is platform-only (`/platform` fee payments); school confirms money later on pending-transfers. |
| `/students/payments/pending-transfers` | `FeePendingTransfersView` | School transfers |
| `/parent/fees` | `ParentFeesView` | Parent pay (Thawani / receipt) |
| `/reports/fees/due-installments` | `DueInstallmentsReportView` | Due/late |

`/settings/payments` redirects to levels.

### Transport

| Path | View | Job |
|------|------|-----|
| `/transportation` | `TransportationManagementView` | Fleet |
| `/transportation/buses/new`, `/:busId` | `TransportationBusEditorView` | Tabs: **details** (route, staff driver/supervisor, fees) · **track/students** (assign/remove via existing student↔bus APIs + pickup lat/lng on `student_buses`; GPS or map coords; parents can share via dashboard) |
| `/transportation/daily-log` | `BusDailyLogView` | Movements |

### Users & access

| Path | View | Job |
|------|------|-----|
| `/users` | `UserManagementView` (`audience: parents`) | Parent/student accounts; **Parent / Student** tabs; **+** opens create page. List includes parents with null `users.school_id` when they are linked to this school’s students (or `parents.school_id`). Staff accounts are on `/employees`. |
| `/users/new` | `UserCreateView` | Full-page create; Parent/Student tabs; register-style fields; temp password emailed |
| `/employees` | `UserManagementView` (`audience: staff`) | Staff accounts; **+** opens create page; row action **Edit role** opens access page |
| `/employees/new` | `EmployeeCreateView` | Full-page create; searchable multi-select staff user groups; temp password emailed |
| `/employees/:userId/access` | `EmployeeAccessView` | Multi-select staff user groups (searchable) + optional per-user claim grants |
| `/roles` | `RoleManagementView` | RBAC groups list |
| `/roles/new` | `RoleCreateView` | Create group + pick package-entitled privileges |
| `/roles/:id` | `RoleClaimsView` | Claims grid (entitled pages only) |

### Comms & video

| Path | View | Job |
|------|------|-----|
| `/chat` | `GroupChatListView` | Class rooms + **New group chat** (ad-hoc member pick) |
| `/chat/:groupId` | `GroupChatRoomView` | Socket.IO room (class, ad-hoc, or bus) |
| `/messages` | `DirectMessagesLayoutView` + welcome pane | Mailbox; conversation list reloads after opening a thread or sending a DM |
| `/messages/:threadId` | `DirectChatRoomView` | Thread |
| `/approvals` | `ApprovalInboxView` | Letter/activity approvals |
| `/settings/message-letters` | `AdminMessageLettersView` | Compose/dispatch letters; visual editor with merge-field chips; sample/test data in the preview dialog |
| `/settings/notification-layouts` | `AdminNotificationLayoutsView` | Visual email layout builder + live preview; **Import .docx → HTML** (mammoth); Advanced HTML optional; body injects at `{{content}}` |
| `/settings/notification-templates` | `AdminNotificationTemplatesView` | Email + SMS content (SMS stacked under email; seeds use `channel=both`); dual live preview; layout picker; merge-field chips |
| `/platform/notification-layouts` | `AdminNotificationLayoutsView` | Same visual builder for product default layouts (seed schools) |
| `/platform/notification-templates` | `AdminNotificationTemplatesView` | Shared content defaults |
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
| `/students` | CRUD, search, by group/bus/parent, assign group/bus, **in-app register** (`POST /register`: student + parent + optional parent/student logins + group). **Paging:** `GET /students?page&limit&q&fee_level` returns `{ items, total, page, limit, pages }` when `page` is set; omit `page` for the legacy full array. |
| `/parents` | CRUD, assign/unassign student (`relationship`: father\|mother\|guardian), **dashboard** (`/parents/dashboard/my-data`, attendance, activities, bus-movements) |
| `/groups` | classroom CRUD, capacity, stats; **GET list** also allows picker claims (`schedules`/`attendance`/`students`/… `view`) via `@RequireAnyClaim` |
| `/grades` | grade levels, reorder, initialize defaults |
| `/academic-years`, `/semesters` | calendar |
| `/class-settings` | durations, start times, time slots |
| `/courses`, `/phases`, `/milestones` | milestone curriculum |
| `/course-enrollments` | enrollable list, enroll course/student, delete |
| `/course-materials` | list by course, upload, download |
| `/graded-assessment` | graded course CRUD (`@RequireClaim('graded_courses')`; school from JWT via `resolveActorSchoolId`) |
| `/graded-criterion-tasks` | tasks, sync, marks-grid (task-level); admin/teacher roles + JWT school bind |
| `/graded-criterion-marks` | marks grid + class/student reports; admin/teacher roles + JWT school bind |
| `/student-progress` | milestone progress + summaries |
| `/schedules` | weekly / by group/teacher/room |
| `/attendance` | daily roll, bulk, stats, daily report |
| `/weekly-session-plans` | plans, complete, copy week, tasks (`@RequireClaim` / `@RequireAnyClaim` `weekly_session_plans` + `teacher_weekly_sessions`; school via `group.school_id`) |
| `/session-media` | uploads for a plan (`@RequireAnyClaim` view/edit; `uploaded_by` from JWT; school via plan→group) |
| `/online-sessions` | create (`schedules`/`attendance_sessions` create), join/presence/resolve (parent-self, no claim), attendance list (`attendance_sessions` view + `resolveActorSchoolId`; `school_id` query is UUID, not int) |
| `/activities` | CRUD (`activities` claims + `resolveActorSchoolId` / `assertSameSchool`; `school_id` UUID) |
| `/enrollments` | public create + staff list/approve/reject/document |
| `/buses` | fleet, students, movements; required staff driver (`driver_user_id`) + optional supervisor; pickup on `student_buses` (`pickup_lat/lng/source`, migration `1791600000000`); `PATCH /buses/:id/students/:studentId/pickup` |
| `/payment-config` | levels, charge/discount types, school flags, profiles (PUT by-level/by-course binds `school_id` from JWT) |
| `/fees/v2` | packages, installment plans, grade/bus/course links, charge sheets, pay, Thawani, transfers, due report. `GET charge-sheet-summaries` accepts optional `student_ids` (comma-separated) to scope the batch. |
| `/student-payments` | **legacy** ledger |
| `/fee-packages` | older package CRUD |
| `/notification-templates` | definitions, school overrides, preview, `layout_id` (`notification_templates` claim) |
| `/notification-layouts` | school email layout CRUD + preview (`notification_layouts` claim) |
| `/platform/notification-templates` | platform defaults (`platform_notification_templates` **or** `platform_schools` view/manage + `assertPlatformUser`) |
| `/platform/notification-layouts` | product default layouts; seed schools via `ensureDefault` (`platform_notification_layouts` **or** `platform_schools`) |
| `/message-letters` | CRUD, audience preview, dispatch |
| `/chat` | group messages, DMs, approvals; `POST /rooms`, `POST /rooms/from-bus/:busId`, `GET /member-candidates` |
| `/meeting-rooms` | create (`admin_meeting_rooms`), mine (`my_meeting_rooms`), join (invitee self); `school_id` via `resolveActorSchoolId` |
| `/settings` | school system key-value |
| `/school-landing` | authenticated CMS get/put |
| `/public/landing` | public landing by slug |
| `/public/school-subscription` | `inquiry` (landing consult → email platform operators); `custom-plan-request` (optional modules + contact → persisted inbox + email); register school; `email-otp/send` + `email-otp/verify` (owner email OTP; non-prod OTP `000000`) |
| `/platform` | `custom-plan-requests` list/update (`platform_schools` view/edit) — custom plan inbox from marketing |
| `/public/platform-plans` | marketing plan list (public) |
| `/platform/schools` | list |
| `/platform/schools` POST | platform admin register school (multipart; optional CR/ID; `save_as_draft` or submit with `paid_amount` + `receipt` → active + owner email) |
| `/platform/schools/:id` | get one |
| `/platform/schools/:id` PUT | update registration details |
| `/platform/schools/:id/approve` | approve pending → invoice + `pending_payment` + login email |
| `/platform/schools/:id/reject` | reject pending (optional notes) |
| `/school-billing` | school self-serve invoice + Thawani (`me`, `thawani/session`, `thawani/confirm`; claim `school_billing`) |
| `/platform` (billing) | plans, modules, school subscription, invoices; `POST …/invoices/:id/mark-paid` multipart (`paid_amount`, optional note + receipt) |
| `/statistics` | dashboard, progress, attendance, courses |
| `/files` | photo/document upload + static |
| `/mail` | status + test send |
| `/errors` | client crash report (`POST /errors/report`, public) — returns a support `ticket` |
| `/health`, `/health/simple` | health |
| `/debug` | **unguarded** env/DB/raw SQL — do not expose in production |

Frontend service files mirror these names under `school-management-unified/src/services/`.

---

## 12. Important entities (backend)

Under `school-management-backend/src/entities/`:

**Core:** `School`, `User`, `Student`, `Parent`, `Staff`, `Group`, `Grade`, `Room`, `AcademicYear`, `Semester`, `ClassSettings`

**Curriculum:** `Course` (`course_kind`), `Phase`, `Milestone`, `StudentProgress`, `StudentCourseEnrollment`, `CourseMaterial`

**Graded:** `GradedAssessmentScheme`, `GradedSemesterConfig`, `GradedCriterion`, `GradedCriterionTeacherTask`, `GradedCriterionTaskStudentMark` (task-based), `GradedCriterionStudentMark` (direct grid)

**Ops:** `Schedule`, `Attendance`, `WeeklySessionPlan`, `SessionMedia`, `Activity`, `Enrollment`, `Bus`, `BusMovementLog`, `ActivityLog`, `ErrorTicket`

**Video:** `OnlineVideoSession`, `OnlineSessionPresence`, `OnlineSessionStudentAttendance`, `MeetingRoom`, `MeetingRoomInvitee`

**Fees v2:** `PaymentChargeType`, `PaymentDiscountType`, `FeePackage` + charge/discount/installment/level/course amount tables, `InstallmentPlan` + entries, `GradeFeeLink` / `BusFeeLink` / `CourseFeeLink` (+ lines), `StudentChargeSheet` + lines/installments/discounts, `StudentFeePayment`, `FeeTransfer` + lines

**Comms:** `SchoolMessageLetter`, `DirectChatMessage` / `DirectChatThread`, `GroupChatMessage`, `NotificationTemplateDefinition`, `SchoolNotificationTemplate`, `SchoolNotificationLayout`, `PlatformNotificationLayout`, `SchoolLandingPage`, `SchoolSystemSetting`

**RBAC:** `RbacPage`, `RbacAction`, `RbacPageAction`, `RbacGroup`, `RbacGroupPermission`, `RbacUserGroupMember`, `RbacUserPermissionOverride`, plus older `RbacRole*` tables

**Platform billing:** under `platform-billing/entities/` — `PlatformPlan`, prices, modules, `SchoolPlatformSubscription`, addons, invoices

Recent migrations of note (names in `src/migrations/`): student fee payments, graded criterion student marks, course materials, fee transfers, installment due dates, notification event templates, payment rejected template, notification template school branding, error tickets (`1789800000000`), school pending payment + billing (`1790500000000`).

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
8. After a product change, update **this file**. Do not implement §19 roadmap items unless the user asked for that wave.

When implementing API:

1. Keep `/api` prefix and `{ success, data }` envelopes.
2. **School scope (mandatory):** never trust client `school_id`. Use `resolveActorSchoolId(req.user, requested?)` and/or `assertSameSchool` from `common/security/school-access.ts`. School staff are always bound to JWT `school_id` — do not send `school_id` on staff requests (the SPA axios client strips it). Platform may pass an explicit UUID filter. Query `school_id` is optional (`RequestedSchoolIdPipe`); leftover `1` / `NaN` is ignored.
3. Prefer `throw new HttpException` / Nest exceptions over catching and returning `{ success: false }` with HTTP 200 (so the global filter can set status + email 5xx).
4. **AuthZ (mandatory):** `ClaimGuard` is opt-in — routes without `@RequireClaim` / `@RequireAnyClaim` allow any authenticated JWT. Attach claims for staff surfaces (match `RBAC_PAGE_SEED`); `@Public()` only for intentionally open routes; `@Roles()` only where that pattern already exists. Parent/self routes: no staff claims; scope to `req.user.id` (+ linked students).
5. Notifications: declare only real variables; pass `locale` into `resolveForSend`.
6. New tables → TypeORM entity + migration (`synchronize` is false).
7. Do not add routes to `/debug`. Do not call unguarded legacy endpoints from new UI without adding auth.
8. Use Nest `Logger` in services you touch; HTTP traffic is already logged by `LoggingInterceptor`.
9. Cursor rule: `.cursor/rules/api-authz-school-scope.mdc` — follow on every new/changed endpoint.
10. **List paging:** use shared `FikrPagination` + `useClientPagination(filteredItemsRef)` (page size 20) for admin list pages; place the control after the list/table inside the list card. For heavy datasets, prefer server `page` + `limit` (+ optional `q`) returning `{ items, total, page, limit, pages }` in `data` and wire the same `FikrPagination` chrome (example: `/students/payments`). Do not fetch-all then slice for new heavy lists. Shared chrome: `FikrPagination.vue` (centered numbered pages); client lists may use `useClientPagination`.

---

## 15. Quick “where do I edit X?”

| Task | Start here |
|------|------------|
| Add a page | `src/router/index.ts` + view + `DashboardLayout` nav + optional RBAC seed |
| Change list chrome | `.cursor/rules/fikr-page-chrome.mdc` + `GradeLevelsView` / `UserManagementView` as reference |
| Change form fields | `.cursor/rules/fikr-form-fields.mdc` |
| Student register wizard | `StudentRegistrationView.vue` + `student-register-form.mdc` |
| Student edit tabs | `StudentEditView.vue` |
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
| `ErrorsModule` | Registers global filter + HTTP logger; exports `ErrorAlertService` + `ErrorTicketService` |
| `AllExceptionsFilter` | Catches every thrown exception; returns `{ success: false, message, error, statusCode, requestId?, ticket? }`; logs warn (4xx) / error (5xx) |
| `LoggingInterceptor` | Assigns `X-Request-Id`, logs `→` / `←` method, path, status, duration (skips health + static files) |
| `ErrorTicketService` | Issues `FIKR-YYMMDD-XXXXXX` tickets; writes `error_tickets`; logs `ticket=…`; emails ops |
| `ErrorAlertService` | Emails ops on API **5xx** and SPA crash reports with ticket + stack + request context; hourly cap |
| `POST /api/errors/report` | `@Public()` — SPA posts client crashes; response `{ data: { ticket } }` |

**SPA pages**

- `/unauthorized` (401) — expired/invalid session after refresh failed. Not used for wrong login password.
- `/error` — Vue crash, unhandled rejection, API timeout/network, or API 5xx. Shows the ticket so the user can quote it.

**SPA wiring:** `error-reporting.ts` (`reportClientError` returns the ticket), `error-pages.ts`, axios interceptor in `api.ts`, `main.ts` errorHandler. Axios interceptor reports network failures; API 5xx already open a ticket server-side.

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
| Access token sliding refresh (15 min early; 2h grace after `exp`) | `auth.controller` `POST /refresh`, `auth-token.ts`, `api.ts` interceptors |
| `User.password` `select: false` + sanitize on student/parent/user responses | `user.entity`, `school-access.sanitizeUserDeep` |
| School scoping from JWT (`resolveActorSchoolId` / `assertSameSchool`) | `common/security/school-access.ts`; required on new APIs (see §14 + `api-authz-school-scope.mdc`) |
| Graded assessment + criterion marks/tasks school bind + `graded_courses` claims | graded-assessment / graded-criterion-* controllers |
| Enrollments have `school_id` (migration `1785400000000`) | public create requires `school_id` |
| Register cannot create `admin`; school forced from actor | `auth.service.register` |
| Uploads **not** publicly static-mounted; `GET /api/files/:category/:filename` requires JWT | `main.ts`, `file-upload.controller` |
| Helmet + Throttler (login 10/min, reset 5/min) | `main.ts`, `AppModule`, `auth.controller` |
| CORS from `CORS_ORIGIN` allowlist (required in production) | `main.ts`, chat gateway |
| Crypto-strong temp passwords on reset (still email-based; token flow TBD) | `auth.service.resetPassword` |

**Still open / follow-up:** git history purge + rotate SMTP/Daily/DB in all environments; DOMPurify on template `v-html`; signed URL or blob-fetch for `<img>` of `/api/files` (browser won't send Bearer); file **download** is JWT-only (guessable filenames) — prefer ownership/signed URLs; chat remains membership-scoped (claims optional so parents keep access); `/debug` only if `ENABLE_DEBUG_ENDPOINTS=true`.

**New API rule:** `.cursor/rules/api-authz-school-scope.mdc` — every new/changed endpoint needs `@RequireClaim` (or explicit `@Public` / parent-self) + `resolveActorSchoolId` / `assertSameSchool`. See §14.

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

**Open because claims/scoping incomplete (legacy):** file download by filename (`GET /api/files/...`); chat relies on membership checks more than claims (parents). Prefer fees-v2 + `resolveActorSchoolId` patterns for anything new. `/debug` only if `ENABLE_DEBUG_ENDPOINTS=true`.

**Other caveats:**

- Global `APP_GUARD`: `JwtAuthGuard` + `ClaimGuard` + `ThrottlerGuard`. Use `@Public()` for open routes.
- `/debug` must stay off production.
- Dual fee systems (v1 + v2) and dual graded-mark tables — use the v2 / current UI paths above.
- Swagger is in package.json but not wired in `main.ts`.

---

## 19. School coverage roadmap (later work)

FIKR already runs a live kindergarten and a multi-school platform. This backlog is what a **full private school** in Oman still needs (KG through secondary), on top of what exists in §8–§10. **Do not implement these unless the user asks for that wave.** When a wave ships, move the item into the live sections above and mark it done here.

Priority is Oman private-school operations, Arabic-first, reuse of fees v2 / claims / notifications. Do not rebuild existing pages.

### Already in product (keep; do not duplicate)

Students & parents, class groups, grades, years/semesters, public + staff enrollment, daily/session attendance, fixed + flexible timetable, milestone / graded / standalone courses, progress, materials, weekly plans, live class (Daily.co), fees v2 + Thawani, buses + daily log, chat/letters/templates, landing CMS, RBAC groups, platform school signup + billing, reports hub (marks + due fees).

### Wave A — Finish and harden what schools already use

| Need | Why later | Notes |
|------|-----------|--------|
| Retire fees **v1** | Dual systems confuse staff | Keep v2 only; remove unrouted legacy payment views |
| Router + sidebar on **claims** (not only `role`) | Nav hiding is not security | Align with `ClaimGuard` |
| Password **reset link** (not only emailed temp password) | Safer for owners/parents | Token flow is TBD in §17 |
| Real **push** (FCM / APNs) | Push service is a stub | Parent attendance / bus / fee alerts |
| Real **SMS** provider | Default is log-only | Keep templates; swap `SmsService` |
| Official **report cards / transcripts** | Marks exist; no term report PDF the school can issue | Arabic + English; class + student |
| **Year promotion / graduation / alumni** | Students stay in one year until staff invent a process | Promote group, archive leavers |
| **Student file vault** | Enrollment has docs; no ongoing student folder | IDs, medical, contracts |
| **Re-enrollment** next year | New application every year is heavy | Returning family, sibling, same parents |
| Admissions **waitlist + document checklist + interview date** | Approve/reject exists; funnel is thin | Stay on `/enrollments`, don’t invent a second CRM |
| **Homework / teacher tasks** visible to parents | Weekly plans + graded tasks exist; no simple diary | Parent sign-off optional |
| Timetable **conflict checks** | Schedules exist | Teacher/room/group overlap |
| Force-language: **per-user locale** | `main.ts` forces Arabic | Keep RTL default |

### Wave B — Academic school (beyond kindergarten)

| Need | Why later |
|------|-----------|
| Subject catalog + **streams** (science / arts / general) for later grades | KG uses milestone courses; secondary needs subjects + GPA |
| **Exam seasons**, hall tickets, seating | Graded marks are continuous, not exam-session based |
| **Certificate** issue + public verify page | Landing CMS has no verify-by-code |
| **Library** (titles, loans, overdue) | Not started |
| **Substitution / cover** when a teacher is absent | Not started |
| MoE / ministry **export packs** (Oman) | Attendance, enrolment, nationality — schools ask for this |
| Kindergarten extras still missing: **meals, naps, pickup notes** | Optional module; don’t force on K-12 tenants |

### Wave C — People, safeguarding, daily ops

| Need | Why later |
|------|-----------|
| **HR**: contracts, leave, attendance of staff, documents | `/employees` is accounts + RBAC only |
| **Payroll** (or export to accountant) | Not started; don’t build a full GL unless asked |
| **Clinic / nurse**: visits, meds, allergies, vaccinations | Health fields on enrollment only |
| **Behaviour / incidents** + parent notify | Not started |
| **Safeguarding** log (restricted claims) | Separate from clinic |
| **Visitor / gate pass** + **authorised pickup** | Parent app later; staff desk first |
| **Inventory**: uniforms, assets, rooms as bookable | Rooms exist for timetable only |
| **Cafeteria / canteen** accounts | Optional; fee lines can wait |

### Wave D — Transport and campus safety

| Need | Why later |
|------|-----------|
| **Live GPS** on the trip + parent map ETA | Daily log is manual |
| **QR / NFC board and alight** | Not started |
| Driver **trip checklist** + incident on trip | Daily log is not a live trip |
| Multi-**campus / branch** under one school | Today one `school_id`, no campus switcher |
| Principal **campus KPI** home (enrolment, attendance, fees) | Admin dashboard is generic KPIs |

### Wave E — Money beyond student fees

| Need | Why later |
|------|-----------|
| School **expenses / petty cash** | Fees v2 is student-side only |
| Tax **invoice / receipt** numbering (Oman) | Thawani + internal receipts exist |
| Scholarships / **financial aid** as first-class (not only discount types) | Discount catalog exists |
| Platform: usage **seats**, invoices, dunning | Billing exists; reminders/dunning thin |

### Wave F — Surfaces and packaging

| Need | Why later |
|------|-----------|
| Native **parent / staff / driver** apps (Capacitor exists as a shell) | Parents today use the SPA |
| Public **news / events / calendar** on `/s/:slug` | Landing is static CMS sections |
| **Surveys** (parent satisfaction) | Not started |
| Module packs in `PLATFORM_MODULE_SEED` for new waves | HR, clinic, exams, GPS, library — add page keys when built |
| English UI actually usable (not forced AR) | Same as Wave A locale |

### How to pick up a wave

1. User names the wave (or one row).
2. Add RBAC page + module `page_keys` + Vue route + nav (don’t hide-as-security).
3. School-scope every API (`api-authz-school-scope.mdc`).
4. Notifications: variables + `locale` (`notification-templates.mdc`).
5. Update this §19 (move shipped rows up into §8–§10).

Default next slice when we resume product work: **Wave A report cards + year promotion + student file vault** — schools feel those gaps before HR or GPS.

