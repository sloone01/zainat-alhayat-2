# Points to check later

Running list of deferred items surfaced while working on the student/parent flows.
UI is kept working now; these are the follow-ups to revisit deliberately.

## Parent contact stored on User, not Parent (data-model cleanup)
Decision: email / phone / civil_id / name should live only on the **User** (the login
account). `Parent` should keep only the relationship + parent-specific fields
(tribe, workplace, work_phone, marital_status, org fields) + `user_id`.

`Parent.email` / `Parent.phone` are currently duplicated legacy columns. Phased plan:
1. Stop **writing** `Parent.email`/`Parent.phone`; put contact on the User.
2. Switch all **reads** to the linked user (or `COALESCE(u.*, p.*)`):
   - `services/parent.service.ts` — dedup/lookup by email/phone (~:124-139), search (~:435-436)
   - `notifications/notification-audience.service.ts` (~:161-162)
   - `services/fee-payment.service.ts` (~:891-892, :954-955)
   - `services/message-letter.service.ts` (already COALESCEs p then u)
   - frontend: edit parents-tab card reads `parent.phone`/`parent.email`
3. Backfill migration: copy any parent-only email/phone onto the linked user.
4. Final migration: drop `Parent.email` / `Parent.phone` columns.
Note: `Enrollment.fatherEmail/motherEmail/...` are a separate historical snapshot — leave them.

## No-login parent support (backend)
UI currently keeps **email + phone mandatory** even with the "Create login account"
checkbox. Real rule wanted: phone always required; email required only when a login is
created; a no-login parent should be allowed. Backend `user.service` create currently
requires civil_id/phone/email for a parent, so the no-login path would be rejected.
- Make backend honor `createLogin` (frontend already sends it on `parentService.create`).
- Allow parent record without email when `createLogin=false`.
- Then relax the UI (email conditional on createLogin) — see StudentEditView `canSubmitAdd`.

## Enrollment/register parity with the edit add-parent flow — DONE (2026-09-21)
`components/enrollment/GuardianInfoStep.vue` now has: both parents mandatory + guardian
checkbox, a grid of parent cards (article + blue/pink banner header, matching the edit
page's parents-tab card exactly) with a "+" that opens an add/edit pop-up — civil ID
first + mandatory + lookup-loads-details (`userService.lookupParent`), a "create login
account" checkbox, live mobile/email validation errors, plain (non-navy) dialog footer.

## Visual alignment: register + enrollment → edit page look — mostly DONE (2026-09-21)
`StudentDetailsStep` (photo centered on top + 2-col grid, was a 3-col layout with the
photo as a side column), `AcademicInfoStep` (grade+group dropdowns in one row, reloading
on school change), `HealthInfoStep` (drag-and-drop upload + file cards) all restyled to
match the edit page. Asterisks standardized to red-after-label across these components.
Remaining: a full sweep of any other enrollment-step field (only the touched components
above were redone; not every corner of the wizard was audited against edit).

## Railway: frontend `railway up` — FIXED 2026-09-22
Root cause: `zinat-frontend` had no Dockerfile override, so `railway up` fell back to
Railway's default builder (Railpack), which fails immediately ("No start command")
before touching our code. The earlier "fix" attempts (dashboard guess, IaC via
`railway config`) were never applied. The actual fix is **not** `builder: "DOCKERFILE"`
— that's not a valid enum value on the direct API (`Builder` is only
`HEROKU/NIXPACKS/PAKETO/RAILPACK`). Dockerfile builds are controlled by a **separate**
`dockerfilePath` field. Applied and verified working:
```
serviceInstanceUpdate(serviceId: zinat-frontend, environmentId: production,
  input: { dockerfilePath: "Dockerfile", rootDirectory: "/school-management-unified" })
```
Deploy succeeded right after; fikr.om served a fresh asset hash. This should be
permanent — future `railway up` for zinat-frontend should just work. (The earlier
`railway config`/IaC CLI-version-check bug and a classifier block on a different
mutation are no longer relevant — this was simply the wrong field name.)

## Server-side pagination migration — IN PROGRESS (2026-09-23)
Rule (user): every list paginates on the server; `useClientPagination` (fetch-all then
slice in the browser) is being retired. Contract: when the request has `page`, the
endpoint answers `{ items, total, page, limit, pages }` (helper
`backend/src/common/pagination.ts`), otherwise the legacy array — so nothing else breaks.
Frontend: `composables/useServerPagination.ts` (+ `fetchAllPages` for exports).

DONE: `/students` (+ `q`, `group_id`, `bus_id`, `age_group`), `/users` (+ `q`, `role`,
`status`, `created_within`, `audience`), `/enrollments` (+ `q`, `status`, `grade`) and
the three views StudentManagementView, UserManagementView, EnrollmentManagementView.

Known gap: the students "status" filter is not sent to the API — `students` has no
status column yet (draft/active/inactive feature pending); client-side it was a no-op too.

REMAINING (41 views, still on `useClientPagination`; each needs a paged branch in its
controller + the view swap): AttendanceManagementView, SessionAttendanceManagementView,
ParentAttendanceView (API already offset/limit — view re-paginates), CourseEnrollmentView,
TeacherProgressView, TeacherGradedMarksGridView, FeePendingReceiptsView,
PlatformFeePaymentsView, FeePendingTransfersView, PlatformFeeTransfersView,
DueInstallmentsReportView, ParentFeesView (x2), ParentProgressView,
ParentCourseEnrollmentView, ParentWeeklyActivitiesView, ParentAssignedActivitiesView,
ParentWeeklyPlansView, ActivityManagementView, AdminMessageLettersView, ApprovalInboxView,
CourseMaterialsView, CourseManagementView, GradedCoursesListView, GroupManagementView,
PaymentCourseFeesView, PaymentLevelFeesView, PaymentFeePackagesView, InstallmentPlansView,
PaymentChargeCatalogView, PaymentDiscountCatalogView, PaymentExtraCatalogView,
PaymentInclusionCatalogView, TransportationManagementView, GradeLevelsView,
RoleManagementView, AdminMeetingRoomsView, MyMeetingRoomsView, PlatformSchoolsView,
PlatformPlansView, PlatformCustomPlanRequestsView.
Suggested order: attendance (2) → course enrollment → fees lists (5) → parent dashboard
views (fed by one `/parents/dashboard/my-data` blob) → the small catalogs.
