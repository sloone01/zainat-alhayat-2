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

## Enrollment/register parity with the edit add-parent flow
Apply the same rules to the enrollment/register parent step (`components/enrollment/GuardianInfoStep.vue`):
- Civil ID first + mandatory + lookup-loads-details (uses `userService.lookupParent`).
- "Create login account" toggle gating.
Currently only the **edit page** (`StudentEditView.vue`) has civil-ID-first + lookup + createLogin.
GuardianInfoStep already has: both parents mandatory + guardian checkbox (done).

## Visual alignment: register + enrollment → edit page look
The "align same way" pass. Restyle the shared `components/enrollment/*` step components
(and the wizard chrome) to match the edit page: FikrPageHeader + white card
(`rounded-2xl border shadow-sm`), `md:grid-cols-2 gap-5` field grids, edit-style labels,
gender as dropdown, `fk-btn` buttons. Edit page is the reference.

## Railway: frontend `railway up` uses RAILPACK, not the Dockerfile
`zinat-frontend` service has builder=RAILPACK + rootDirectory=null, so `railway up` from
the subdir ignores its Dockerfile and fails ("No start command"). Fix: set the service
rootDirectory to `/school-management-unified` (Railway dashboard or serviceInstanceUpdate
API — was classifier-blocked). Backend deploy works (has its railway.json + rootDirectory).
