# Agent handoff — deploy FIKR / Zinat Al-Haya school platform

You are deploying a **monorepo** school-management platform (NestJS + Vue 3) with a **PostgreSQL** dump included.

**Do not invent credentials.** Use the verified accounts below. Prefer restoring the included DB dump over seeding from scratch.

**Pack date:** 2026-09-04  
**Dump files:** `backups/school_management_latest.dump` (preferred) and `.sql` (fallback)

---

## 1. What this project is

| Piece | Path | Stack | Default port |
|-------|------|-------|--------------|
| Backend API | `school-management-backend/` | NestJS 11, TypeORM, JWT | `3002` |
| Frontend SPA | `school-management-unified/` | Vue 3, Vite, Tailwind, Pinia, i18n (AR/EN) | `5173` (dev) |
| Database | PostgreSQL 15 | Migrations in `school-management-backend/src/migrations/` | `5432` native, or `5433→5432` via `docker-compose.yml` |

**Useful routes**
- Platform hub: `/`, `/login`, `/subscribe`
- Platform admin: `/platform/schools`, `/platform/plans` (super admin)
- Demo school site: `/s/zinat-al-haya` (landing_slug `zinat-al-haya`, school id `1`)

---

## 2. Pack contents

```
zinat-al-haya-deploy-pack/   (or project root)
  AGENT_DEPLOY_HANDOFF.md
  backups/
    school_management_latest.dump
    school_management_latest.sql
  docker-compose.yml
  docker-compose.prod.yml
  .env.prod.example
  school-management-backend/   ← keep .env if present
  school-management-unified/   ← keep .env.local if present
```

Exclude when packing: `node_modules/`, `.git/`, `dist/`, `.playwright-browsers/`, `*.log`

---

## 3. Prerequisites

- Node.js **20.19+** or **22.12+**
- npm
- `psql` / `pg_dump` / `pg_restore` **or** Docker

---

## 4. Database

### Connection (local / docker-compose defaults)

| Setting | Value |
|---------|-------|
| Host | `localhost` |
| Port | `5432` (native) or **`5433`** (docker-compose maps host→container) |
| Database | `school_management` |
| User | `school_admin` |
| Password | `school_password_2024` |

Backend `.env` on the source machine uses port **5432**.

### Start Postgres (Docker)

```bash
docker compose up -d postgres
# If using compose, set DATABASE_PORT=5433 in backend .env
```

### Restore dump (required)

```bash
export PGPASSWORD=school_password_2024

# Preferred
pg_restore -h localhost -p 5432 -U school_admin -d school_management \
  --clean --if-exists --no-owner --no-acl \
  backups/school_management_latest.dump

# Fallback
# psql -h localhost -p 5432 -U school_admin -d school_management \
#   -f backups/school_management_latest.sql
```

If the DB does not exist yet:

```bash
createdb -h localhost -p 5432 -U school_admin school_management
```

### Fresh backup later

```bash
export PGPASSWORD=school_password_2024
mkdir -p backups
STAMP=$(date +%Y%m%d_%H%M%S)
pg_dump -h localhost -p 5432 -U school_admin -d school_management -Fc \
  -f "backups/school_management_${STAMP}.dump"
cp "backups/school_management_${STAMP}.dump" backups/school_management_latest.dump
```

### Migrations

Dump already has schema + data. Only run if code is newer than the dump:

```bash
cd school-management-backend
npm install --legacy-peer-deps
npm run migration:run
```

`synchronize` is **false**.

---

## 5. Environment

### Backend `school-management-backend/.env`

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

### Frontend `school-management-unified/.env.local`

```env
VITE_API_BASE_URL=http://localhost:3002/api
VITE_NODE_ENV=development
VITE_APP_NAME="Zinat Al-Haya Kindergarten Management System"
VITE_DEFAULT_LOCALE=ar
```

---

## 6. Run locally

```bash
# Terminal 1
cd school-management-backend
npm install --legacy-peer-deps
npm run start:dev
# http://localhost:3002/api/health

# Terminal 2
cd school-management-unified
npm install
npm run dev
# http://localhost:5173
```

Smoke login:

```bash
curl -s -X POST http://localhost:3002/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"superadmin@zinat.platform","password":"SuperAdmin123!"}'
```

---

## 7. Production Docker (optional)

```bash
cp .env.prod.example .env.prod
# edit JWT, POSTGRES_PASSWORD, VITE_API_BASE_URL, CORS_ORIGIN
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker exec -i zinat_postgres_prod pg_restore -U school_admin -d school_management \
  --clean --if-exists --no-owner --no-acl < backups/school_management_latest.dump
```

---

## 8. Verified login credentials (from this dump)

| Type | Email | Password | Notes |
|------|-------|----------|-------|
| **Platform super admin** | `superadmin@zinat.platform` | `SuperAdmin123!` | No school; `/platform/schools`, `/platform/plans`. Login at `/login` |
| **School admin** | `admin@zinatalhaykindergarten.com` | `Admin123!` | School id `1` — primary QA admin |
| **School admin (alt)** | `Zahra@gmail.com` | `ZahraAdmin123` | School id `1` |
| **Teacher** | `moza@zinat.local` | `DemoPass123!` | School id `1` |
| **Parent** | `parent_95064063@zinat.local` | `DemoPass123!` | School id `1` |
| **Parent** | `parent.test@zinat.local` | `DemoPass123!` | School id `1` |

School login also works at `/s/zinat-al-haya/login`.

### Reset another user’s password (admin API)

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

### Optional pgAdmin (compose)

| | |
|--|--|
| URL | `http://localhost:8080` |
| Email | `admin@zinat.local` |
| Password | `admin123` |

---

## 9. Data snapshot (dump time)

- Schools: 1 — `Zinat Al-Haya Kindergarten` (`landing_slug`: `zinat-al-haya`)
- Users: 3 admin (1 super), 7 teachers, ~248 parents
- Dump ≈ 433KB custom / 926KB SQL

---

## 10. Checklist

1. [ ] Unpack; confirm `backups/school_management_latest.dump`
2. [ ] Start Postgres; match backend `.env`
3. [ ] Restore dump
4. [ ] `npm install` backend + frontend
5. [ ] API health OK
6. [ ] UI at `http://localhost:5173`
7. [ ] Super admin → `/platform/schools`
8. [ ] School admin → dashboard
9. [ ] Teacher + parent logins
10. [ ] Re-backup after changes

---

## 11. Security

Treat dump + passwords as **staging/demo**. Rotate JWT, DB password, and user passwords before any public deploy. Do not publish `.env` or backups to a public remote.
