# Agent handoff — deploy FIKR / Zinat Al-Haya school platform

You are deploying a **monorepo** school-management platform (NestJS + Vue 3) with a **PostgreSQL** database dump included.

**Do not invent credentials.** Use the verified accounts below. Prefer restoring the included DB dump over seeding from scratch.

---

## 1. What this project is

| Piece | Path | Stack | Default port |
|-------|------|-------|--------------|
| Backend API | `school-management-backend/` | NestJS 11, TypeORM, JWT | `3002` |
| Frontend SPA | `school-management-unified/` | Vue 3, Vite, Tailwind, Pinia, i18n (AR/EN) | `5173` (dev) / `3000` (docker prod) |
| Database | PostgreSQL 15 | TypeORM migrations in `school-management-backend/src/migrations/` | `5432` (native) or host `5433` → container `5432` via `docker-compose.yml` |

**Product notes**
- Platform (FIKR) pages: `/`, `/login`, `/subscribe`, `/platform/schools`, `/platform/plans`
- School tenant demo: `/s/zinat-al-haya` (landing slug `zinat-al-haya`, school id `1`)
- School dashboard after school-admin login uses school-branded UI; platform super-admin lands on `/platform/schools`

---

## 2. Pack contents (what you should receive)

Minimum required:

```
zinat-al-haya-kindergarten/
  AGENT_DEPLOY_HANDOFF.md          ← this file
  backups/
    school_management_latest.dump  ← preferred restore (custom format)
    school_management_latest.sql   ← plain SQL fallback
  docker-compose.yml               ← Postgres (+ optional pgAdmin) for local DB
  docker-compose.prod.yml          ← full stack prod compose
  .env.prod.example
  school-management-backend/       ← includes .env for local (copy if missing)
  school-management-unified/       ← includes .env.local for local
```

**Exclude from transport if rebuilding:** `node_modules/`, `dist/`, `.git/`, `school-management-unified/.playwright-browsers/` (reinstall with npm).

Create a fresh archive on the source machine:

```bash
cd /path/to/zinat-al-haya-kindergarten
tar -czf ../zinat-al-haya-pack.tar.gz \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='dist' \
  --exclude='school-management-unified/.playwright-browsers' \
  --exclude='*.log' \
  .
```

---

## 3. Prerequisites

- Node.js **20.19+** or **22.12+** (frontend engines field)
- npm
- PostgreSQL client tools (`psql`, `pg_dump`, `pg_restore`) **or** Docker
- Docker optional but recommended for DB

---

## 4. Database — credentials & restore

### 4.1 Local DB connection (current / docker-compose defaults)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` if Postgres is native; **`5433`** if using root `docker-compose.yml` (maps `5433→5432`) |
| Database | `school_management` |
| User | `school_admin` |
| Password | `school_password_2024` |

Backend `.env` on the source machine uses port **5432** (native Postgres), not the compose mapped 5433.

### 4.2 Start Postgres with Docker (if you need a fresh container)

```bash
cd zinat-al-haya-kindergarten
docker compose up -d postgres
# wait until healthy
docker compose ps
```

If you use compose, set backend env to:

```
DATABASE_HOST=localhost
DATABASE_PORT=5433
DATABASE_USERNAME=school_admin
DATABASE_PASSWORD=school_password_2024
DATABASE_NAME=school_management
```

### 4.3 Restore the included backup (required for real data + logins)

**Preferred (custom format):**

```bash
# drop/recreate empty DB first if needed
export PGPASSWORD=school_password_2024
createdb -h localhost -p 5432 -U school_admin school_management   # or skip if exists
# if DB already has objects, recreate:
# dropdb -h localhost -p 5432 -U school_admin school_management && createdb ...

pg_restore -h localhost -p 5432 -U school_admin -d school_management \
  --clean --if-exists --no-owner --no-acl \
  backups/school_management_latest.dump
```

**Fallback (plain SQL):**

```bash
export PGPASSWORD=school_password_2024
psql -h localhost -p 5432 -U school_admin -d school_management \
  -f backups/school_management_latest.sql
```

### 4.4 Take a new backup (ops)

```bash
export PGPASSWORD=school_password_2024
mkdir -p backups
STAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -p 5432 -U school_admin -d school_management -Fc \
  -f "backups/school_management_${STAMP}.dump"
pg_dump -h localhost -p 5432 -U school_admin -d school_management --no-owner --no-acl \
  -f "backups/school_management_${STAMP}.sql"
cp "backups/school_management_${STAMP}.dump" backups/school_management_latest.dump
cp "backups/school_management_${STAMP}.sql" backups/school_management_latest.sql
```

### 4.5 Migrations after restore

Dump already includes schema + data. Only run migrations if you deploy **newer code** than the dump:

```bash
cd school-management-backend
npm install --legacy-peer-deps
npm run migration:run
# or: npm run migrate:deploy
```

`synchronize` is **false** — never rely on TypeORM auto-sync in prod.

---

## 5. Application env

### Backend (`school-management-backend/.env`)

Copy from existing `.env` or `.env.example`, then ensure at least:

```env
NODE_ENV=development
PORT=3002
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_USERNAME=school_admin
DATABASE_PASSWORD=school_password_2024
DATABASE_NAME=school_management
JWT_SECRET=<copy from source .env or generate 32+ chars>
JWT_REFRESH_SECRET=<copy or generate>
CORS_ORIGIN=http://localhost:5173,http://localhost:5174,http://localhost:3000
CORS_CREDENTIALS=true
```

Optional: `SMTP_*`, `DAILY_API_KEY` (video rooms). Without them, email/video features fail gracefully or error on use.

### Frontend (`school-management-unified/.env.local`)

```env
VITE_API_BASE_URL=http://localhost:3002/api
VITE_NODE_ENV=development
VITE_APP_NAME="Zinat Al-Haya Kindergarten Management System"
VITE_DEFAULT_LOCALE=ar
```

---

## 6. Run locally (dev)

```bash
# Terminal 1 — API
cd school-management-backend
npm install --legacy-peer-deps
npm run start:dev
# Health: http://localhost:3002/api/health

# Terminal 2 — UI
cd school-management-unified
npm install
npm run dev
# UI: http://localhost:5173
```

**Smoke checks**

```bash
curl -s http://localhost:3002/api/health
curl -s -X POST http://localhost:3002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"superadmin@zinat.platform","password":"SuperAdmin123!"}'
```

---

## 7. Production-style Docker deploy

```bash
cp .env.prod.example .env.prod
# edit JWT secrets, POSTGRES_PASSWORD, VITE_API_BASE_URL, CORS_ORIGIN

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Then restore dump **into the compose Postgres** (adjust host/port/user/password to match `.env.prod`):

```bash
docker exec -i zinat_postgres_prod pg_restore -U school_admin -d school_management \
  --clean --if-exists --no-owner --no-acl < backups/school_management_latest.dump
```

Frontend container expects `VITE_API_BASE_URL` ending with `/api`.

---

## 8. Verified login credentials (all user types)

Passwords below were **verified against the live DB that was dumped** into `backups/school_management_latest.*` (after resetting demo teacher/parent passwords).

### Platform (FIKR) — no school

| Type | Email | Password | Notes |
|------|-------|----------|-------|
| **Super admin** | `superadmin@zinat.platform` | `SuperAdmin123!` | `is_super_admin` + `is_system_user`; school_id NULL. Use for `/platform/schools`, `/platform/plans`. Login via `/login` (not school login). |

### School admins — school id `1` (Zinat Al-Haya)

| Type | Email | Password | Notes |
|------|-------|----------|-------|
| **School admin (primary)** | `admin@zinatalhaykindergarten.com` | `Admin123!` | Full school admin; most used in QA |
| **School admin (alt)** | `Zahra@gmail.com` | `ZahraAdmin123` | Also admin role, school 1 |

School-branded login: `/s/zinat-al-haya/login` or platform `/login` with these emails.

### Teacher

| Type | Email | Password | Notes |
|------|-------|----------|-------|
| **Teacher** | `moza@zinat.local` | `DemoPass123!` | School 1. Other teachers exist (Arabic local emails) — passwords unknown unless reset |

### Parents

| Type | Email | Password | Notes |
|------|-------|----------|-------|
| **Parent** | `parent_95064063@zinat.local` | `DemoPass123!` | School 1 |
| **Parent** | `parent_95464181@zinat.local` | `DemoPass123!` | School 1 |
| **Parent** | `parent.test@zinat.local` | `DemoPass123!` | School 1 |

~248 parents exist; most passwords are unknown. Reset via admin API:

```bash
TOKEN=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@zinatalhaykindergarten.com","password":"Admin123!"}' \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['data']['access_token'])")

curl -s -X PATCH "http://localhost:3002/api/users/<USER_UUID>/password" \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"newPassword":"DemoPass123!"}'
```

### Import defaults (only if creating users via Excel import code paths)

- New parents from import: default hash in code is `parent123`
- New teachers from import: default hash in code is `teacher123`  
These do **not** apply to existing dumped users unless re-imported.

### pgAdmin (optional compose service)

| | |
|--|--|
| URL | `http://localhost:8080` |
| Email | `admin@zinat.local` |
| Password | `admin123` |

---

## 9. Useful URLs after deploy

| URL | Purpose |
|-----|---------|
| `http://localhost:5173/` | FIKR marketing / platform hub |
| `http://localhost:5173/login` | Platform login |
| `http://localhost:5173/subscribe` | School subscription signup |
| `http://localhost:5173/s/zinat-al-haya` | Demo school public site |
| `http://localhost:5173/s/zinat-al-haya/login` | School login |
| `http://localhost:5173/platform/schools` | Registered schools (super admin) |
| `http://localhost:5173/platform/plans` | Platform plans (super admin) |
| `http://localhost:5173/dashboard` | School dashboard (school staff) |
| `http://localhost:5173/users` | User management |
| `http://localhost:5173/roles` | RBAC groups |
| `http://localhost:3002/api/health` | API health |

---

## 10. Data snapshot (at dump time)

- Schools: 1 (`Zinat Al-Haya Kindergarten`, landing_slug `zinat-al-haya`)
- Users: 3 admin (incl. 1 super), 7 teachers, ~248 parents
- ~102 public tables
- Dump sizes ≈ 433KB (custom) / 926KB (SQL)

---

## 11. Agent checklist

1. [ ] Unpack archive; confirm `backups/school_management_latest.dump` exists  
2. [ ] Start Postgres; match host/port/user/password to backend `.env`  
3. [ ] Restore dump with `pg_restore`  
4. [ ] `npm install` backend + frontend  
5. [ ] Start API → health OK  
6. [ ] Start UI → open `/login`  
7. [ ] Login as `superadmin@zinat.platform` / `SuperAdmin123!` → `/platform/schools`  
8. [ ] Login as `admin@zinatalhaykindergarten.com` / `Admin123!` → school dashboard  
9. [ ] Login as `moza@zinat.local` / `DemoPass123!` → teacher routes  
10. [ ] Login as `parent_95064063@zinat.local` / `DemoPass123!` → parent routes  
11. [ ] Take a fresh backup after any password/env changes  

---

## 12. Security notes for the deploying agent

- Treat this dump + credentials as **staging/demo secrets**, not production.
- Rotate `JWT_SECRET`, DB password, and all user passwords before any public deploy.
- Do not commit `.env`, `.env.local`, or `backups/*.sql` to a public remote.
- SMTP / Daily keys may appear in `.env.example` on the source machine — replace them; do not reuse shared keys in production.
