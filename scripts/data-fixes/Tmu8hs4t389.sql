-- Ticket FIKR-260919-09E1EF:
-- GET /api/activities -> 500 "column activity.image_url does not exist".
-- The Activity entity maps image_url, but migration
-- 1792450000000-ActivityImageUrl has not run in production. The live
-- deployment (98ba2c54, 2026-09-19 09:00 UTC) predates the migration-runner
-- retry fix (e75ba2e0), so an earlier failing migration held back this one.
-- This script makes the same change as that migration. It is idempotent: you
-- can run it more than once, and the migration running later won't conflict.

BEGIN;

ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "image_url" text NULL;

COMMIT;
