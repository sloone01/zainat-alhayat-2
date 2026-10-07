# FIKR / Zinat Al-Haya — tester logins

**Environment:** Railway production  
**API:** https://divine-clarity-production-d359.up.railway.app/api  
**Demo school login:** `/s/zinat-al-haya/login` (shown as FIKR Demo School)  
**Platform login:** `/login`

## Public demo logins (share freely, give to App Store / Play review)

Password for all four: `DemoPass1`

| Role | Email |
|------|-------|
| School admin | `admin@fikr-demo.com` |
| Teacher | `teacher@fikr-demo.com` |
| Driver | `driver@fikr-demo.com` |
| Parent | `parent@fikr-demo.com` |

These cannot change their password or profile. Nothing is emailed, texted, or sent on WhatsApp from the demo school. Logins and the school name reset every night at 03:00 Muscat time.

## Internal logins

| Role | Email | Password | Where to sign in |
|------|-------|----------|------------------|
| Platform super admin | `superadmin@zinat.platform` | `SuperAdmin123!` | `/login` → platform (schools, plans) |
| School admin (demo) | `admin@zinatalhaykindergarten.com` | `Admin123!` | `/login` or `/s/zinat-al-haya/login` |
| School admin (live) | `Zahra@gmail.com` | `ZahraAdmin123` | `/login` |
| Parent (demo) | `parent_95064063@zinat.local` | `DemoPass123!` | `/login` |

`moza@zinat.local` and `parent.test@zinat.local` may no longer work: the first demo reset can take over the demo teacher with the most classes and `parent.test@zinat.local` as `teacher@fikr-demo.com` / `parent@fikr-demo.com`.

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
| FIKR Demo School | `zinat-al-haya` | School A — module users, 2 teachers, 3 students, driver + Demo Bus A |
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

### Teachers / School B admin

| Email | School | Role |
|-------|--------|------|
| `teacher1@fikr-demo.com` | A | Teacher |
| `teacher2@fikr-demo.com` | A | Teacher |
| `teacher3@fikr-demo.com` | B | Teacher |
| `admin.b@fikr-demo.com` | B | School Admin |

`driver@fikr-demo.com` is a public demo login (password `DemoPass1`), not `DemoPass123!`.

### Parents (linked children)

| Email | Children |
|-------|----------|
| `parent.s1@fikr-demo.com` | Yusuf, Maryam (School A) |
| `parent.s3@fikr-demo.com` | Hassan (School A) |
| `parent.s4@fikr-demo.com` | Noor, Khalid (School B) |
| `parent.s6@fikr-demo.com` | Aisha (School B) |
