-- Ticket FIKR-260919-D70439:
-- GET /api/parents/dashboard/activities -> 500
-- "column Activity.image_url does not exist".
--
-- Same root cause as FIKR-260919-09E1EF: migration
-- 1792450000000-ActivityImageUrl has never run in production. The live
-- deployment (98ba2c54, 2026-09-19 09:00 UTC) predates the migration-runner
-- fix, so the first failing migration in the chain
-- (1792420000000-BusArrivalEtaAlerts) blocked every later migration,
-- including this one.
--
-- This script applies exactly what that migration applies, and records it in
-- "migrations" so the startup runner skips it on the next deploy. It touches
-- nothing else (unlike apply-missing-migrations-1792420000000-1792450000000.sql,
-- which also rewrites grades/levels data). It is idempotent: running it more
-- than once, or running the migration afterwards, changes nothing.

BEGIN;

-- ActivityImageUrl1792450000000
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "image_url" text NULL;

INSERT INTO "migrations" ("timestamp", "name")
SELECT 1792450000000::bigint, 'ActivityImageUrl1792450000000'
WHERE NOT EXISTS (
  SELECT 1 FROM "migrations" m WHERE m.name = 'ActivityImageUrl1792450000000'
);

COMMIT;

-- Check afterwards (expect one row, data_type = text):
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'activities' AND column_name = 'image_url';
--
-- And which migrations are still missing:
-- SELECT name FROM "migrations" WHERE "timestamp" >= 1792420000000 ORDER BY "timestamp", name;
