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
