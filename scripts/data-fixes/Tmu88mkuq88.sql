-- Ticket FIKR-260919-C18668 (also FIKR-260919-A4CE2D, FIKR-260919-1705F5):
-- GET /api/chat/admin-review -> 500 "column m.admin_review does not exist".
-- Migration 1792440000000-ChatAdminReview never ran in production (the
-- startup migration runner stopped at an earlier failing migration and
-- swallowed the error). This script applies the same changes that migration
-- makes. It is idempotent and safe to run more than once. When the migration
-- runs later, it is also idempotent, so the two do not conflict.

BEGIN;

ALTER TABLE "group_chat_messages"  ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;
ALTER TABLE "direct_chat_messages" ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;
ALTER TABLE "adhoc_chat_messages"  ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "IDX_group_chat_messages_admin_review"
  ON "group_chat_messages" ("group_id") WHERE "admin_review" = true;
CREATE INDEX IF NOT EXISTS "IDX_direct_chat_messages_admin_review"
  ON "direct_chat_messages" ("thread_id") WHERE "admin_review" = true;
CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_messages_admin_review"
  ON "adhoc_chat_messages" ("room_id") WHERE "admin_review" = true;

-- RBAC page for the admin chat-review screen (values from rbac-catalog.seed.ts)
INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
VALUES ('chat_audit', '/admin/chat-review', 'Conversation review', 'مراجعة المحادثات', 'school', 41, true)
ON CONFLICT ("key") DO UPDATE SET
  "route" = EXCLUDED."route", "nameEn" = EXCLUDED."nameEn", "nameAr" = EXCLUDED."nameAr",
  "scope" = EXCLUDED."scope", "sortOrder" = EXCLUDED."sortOrder", "isActive" = true;

INSERT INTO "rbac_page_actions" ("pageId", "actionId")
SELECT p.id, a.id
FROM "rbac_pages" p JOIN "rbac_actions" a ON a.code IN ('view', 'search')
WHERE p.key = 'chat_audit'
ON CONFLICT DO NOTHING;

UPDATE "platform_modules"
SET "page_keys" = "page_keys" || '["chat_audit"]'::jsonb, "updated_at" = now()
WHERE code = 'messaging' AND NOT ("page_keys" @> '["chat_audit"]'::jsonb);

INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
SELECT DISTINCT gp."groupId", dest.id, dest_action.id
FROM "rbac_group_permissions" gp
JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'system_settings'
JOIN "rbac_actions" src_action ON src_action.id = gp."actionId" AND src_action.code = 'view'
JOIN "rbac_pages" dest ON dest.key = 'chat_audit'
JOIN "rbac_actions" dest_action ON dest_action.code IN ('view', 'search')
JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id AND pa."actionId" = dest_action.id
ON CONFLICT DO NOTHING;

INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
SELECT DISTINCT rp."roleId", dest.id, dest_action.id
FROM "rbac_role_permissions" rp
JOIN "rbac_pages" src ON src.id = rp."pageId" AND src.key = 'system_settings'
JOIN "rbac_actions" src_action ON src_action.id = rp."actionId" AND src_action.code = 'view'
JOIN "rbac_pages" dest ON dest.key = 'chat_audit'
JOIN "rbac_actions" dest_action ON dest_action.code IN ('view', 'search')
JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id AND pa."actionId" = dest_action.id
ON CONFLICT DO NOTHING;

COMMIT;

-- Check afterwards:
-- SELECT table_name FROM information_schema.columns WHERE column_name = 'admin_review';
-- Then find the migration that blocks the chain:
-- SELECT name FROM migrations ORDER BY timestamp DESC LIMIT 10;
