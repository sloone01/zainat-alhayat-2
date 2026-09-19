# FIKR / Zinat Al-Haya — tester logins

**Environment:** Railway production  
**API:** https://divine-clarity-production-d359.up.railway.app/api  
**School site login:** `/s/zinat-al-haya/login`  
**Platform login:** `/login`

| Role | Email | Password | Where to sign in |
|------|-------|----------|------------------|
| Platform super admin | `superadmin@zinat.platform` | `SuperAdmin123!` | `/login` → platform (schools, plans) |
| School admin | `admin@zinatalhaykindergarten.com` | `Admin123!` | `/login` or `/s/zinat-al-haya/login` |
| School admin (alt) | `Zahra@gmail.com` | `ZahraAdmin123` | `/login` or `/s/zinat-al-haya/login` |
| Teacher | `moza@zinat.local` | `DemoPass123!` | `/login` or `/s/zinat-al-haya/login` |
| Parent | `parent_95064063@zinat.local` | `DemoPass123!` | `/login` or `/s/zinat-al-haya/login` |
| Parent | `parent.test@zinat.local` | `DemoPass123!` | `/login` or `/s/zinat-al-haya/login` |

Source: verified accounts in `AGENT_DEPLOY_HANDOFF.md` §8 (same dump as production).

---

## Local demo seed (module roles + 2 schools)

Re-seed anytime from `school-management-backend`:

```bash
node scripts/seed-demo-module-users.js --apply
```

**Password for all rows below:** `DemoPass123!`

### Schools

| School | Slug | Notes |
|--------|------|--------|
| Zinat Al-Haya (demo) | `zinat-al-haya` | School A — module users, 2 teachers, 3 students, driver + Demo Bus A |
| FIKR Demo School B | `fikr-demo-b` | School B — admin, 1 teacher, 3 students |

### Module users (School A — one group per module)

| Email | User group |
|-------|------------|
| `mod.dashboard@fikr-demo.com` | Module: Dashboard |
| `mod.users@fikr-demo.com` | Module: Users |
| `mod.students@fikr-demo.com` | Module: Students |
| `mod.settings@fikr-demo.com` | Module: Settings |
| `mod.schedules@fikr-demo.com` | Module: Schedules |
| `mod.attendance@fikr-demo.com` | Module: Attendance |
| `mod.activities@fikr-demo.com` | Module: Activities |
| `mod.courses@fikr-demo.com` | Module: Courses |
| `mod.fees@fikr-demo.com` | Module: Fees |
| `mod.transport@fikr-demo.com` | Module: Transportation |
| `mod.driver@fikr-demo.com` | Module: Driver |
| `mod.comms@fikr-demo.com` | Module: Communication |
| `mod.notifications@fikr-demo.com` | Module: Notifications |
| `mod.reports@fikr-demo.com` | Module: Reports |

### Teachers / driver / School B admin

| Email | School | Role |
|-------|--------|------|
| `teacher1@fikr-demo.com` | A | Teacher |
| `teacher2@fikr-demo.com` | A | Teacher |
| `teacher3@fikr-demo.com` | B | Teacher |
| `driver@fikr-demo.com` | A | Driver group + Demo Bus A |
| `admin.b@fikr-demo.com` | B | School Admin |

### Parents (linked children)

| Email | Children |
|-------|----------|
| `parent.s1@fikr-demo.com` | Yusuf, Maryam (School A) |
| `parent.s3@fikr-demo.com` | Hassan (School A) |
| `parent.s4@fikr-demo.com` | Noor, Khalid (School B) |
| `parent.s6@fikr-demo.com` | Aisha (School B) |
