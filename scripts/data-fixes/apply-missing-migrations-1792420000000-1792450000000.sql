-- Railway is missing migrations 1792420000000 .. 1792450000000.
--
-- Cause: 1792420000000-BusArrivalEtaAlerts inserted into
-- notification_template_definitions using columns that do not exist ("key",
-- "name"). It failed on every deploy, and the startup migration runner stopped
-- at the first failure and swallowed the error. So every later migration was
-- also skipped:
--   BusArrivalEtaAlerts1792420000000              (bus ETA alerts table + template)
--   GradesSchoolScope1792420000000                (grades.school_id, per-school codes)
--   AbsenceExcuses1792430000000                   (absence_excuses table + RBAC pages)
--   DropParentCanViewOtherStudentsSetting1792430000000
--   ChatAdminReview1792440000000                  (chat admin_review columns + chat_audit page)
--   ActivityImageUrl1792450000000                 (activities.image_url)
-- The migration is fixed in code (1bebb911), and the runner now retries
-- failed migrations one at a time (e75ba2e0). Neither change is live yet.
--
-- This script makes the same changes as those six migrations and records each
-- in "migrations", so the runner won't run them again after the next deploy.
-- It is idempotent: you can run it more than once. It runs in one transaction,
-- so a failure changes nothing.
-- Supersedes Tmu88gmkk27.sql, Tmu88mkuq88.sql, Tmu8hs4t389.sql.

BEGIN;

-- ---------------------------------------------------------------------------
-- BusArrivalEtaAlerts1792420000000
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "bus_arrival_eta_alerts" (
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "bus_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "trip_date" date NOT NULL,
  "trip_type" character varying(16) NOT NULL,
  "eta_minutes" integer NOT NULL,
  "sent_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PK_bus_arrival_eta_alerts" PRIMARY KEY ("id"),
  CONSTRAINT "uq_bus_arrival_eta_alert" UNIQUE ("bus_id", "student_id", "trip_date", "trip_type")
);
CREATE INDEX IF NOT EXISTS "IDX_bus_arrival_eta_bus_date"
  ON "bus_arrival_eta_alerts" ("bus_id", "trip_date");

INSERT INTO notification_template_definitions (
  template_key, display_name, description, channel, audience,
  default_subject, default_body_html, default_body_sms,
  default_subject_ar, default_body_html_ar, default_body_sms_ar,
  factory_subject, factory_body_html, factory_body_sms,
  factory_subject_ar, factory_body_html_ar, factory_body_sms_ar,
  variable_hints
)
SELECT
  'bus.approaching',
  'Bus approaching stop',
  'Push/SMS when the bus is about 3–5 minutes from the child’s pickup/drop-off.',
  'both',
  'school',
  '{{studentName}} — bus arriving in ~{{etaMinutes}} min',
  $html$<p>Dear {{recipientName}},</p><p>The bus for <strong>{{studentName}}</strong> is about <strong>{{etaMinutes}}</strong> minutes away ({{busTitle}}).</p>$html$,
  '{{schoolName}}: {{studentName}} — bus ~{{etaMinutes}} min away.',
  'الحافلة تقترب من {{studentName}} خلال ~{{etaMinutes}} دقائق',
  $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>حافلة <strong>{{studentName}}</strong> على بعد حوالي <strong>{{etaMinutes}}</strong> دقائق ({{busTitle}}).</p>$html$,
  '{{schoolName}}: {{studentName}} — الحافلة خلال ~{{etaMinutes}} دقائق.',
  '{{studentName}} — bus arriving in ~{{etaMinutes}} min',
  $html$<p>Dear {{recipientName}},</p><p>The bus for <strong>{{studentName}}</strong> is about <strong>{{etaMinutes}}</strong> minutes away ({{busTitle}}).</p>$html$,
  '{{schoolName}}: {{studentName}} — bus ~{{etaMinutes}} min away.',
  'الحافلة تقترب من {{studentName}} خلال ~{{etaMinutes}} دقائق',
  $html$<p>عزيزي/عزيزتي {{recipientName}}،</p><p>حافلة <strong>{{studentName}}</strong> على بعد حوالي <strong>{{etaMinutes}}</strong> دقائق ({{busTitle}}).</p>$html$,
  '{{schoolName}}: {{studentName}} — الحافلة خلال ~{{etaMinutes}} دقائق.',
  '[{"name":"studentName","description":"Student name"},{"name":"recipientName","description":"Guardian name"},{"name":"etaMinutes","description":"ETA minutes"},{"name":"busTitle","description":"Bus title"},{"name":"schoolName","description":"School name"}]'::jsonb
WHERE NOT EXISTS (
  SELECT 1 FROM notification_template_definitions WHERE template_key = 'bus.approaching'
);

-- ---------------------------------------------------------------------------
-- GradesSchoolScope1792420000000
-- ---------------------------------------------------------------------------
ALTER TABLE grades ADD COLUMN IF NOT EXISTS school_id uuid;

DO $fix$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UQ_grades_code') THEN
    ALTER TABLE grades DROP CONSTRAINT "UQ_grades_code";
  END IF;
END
$fix$;

-- Assign existing global grades to the demo Zinat school (or any school).
WITH owner AS (
  SELECT id
  FROM schools
  ORDER BY
    CASE WHEN id = '91d02698-72f9-45ac-9715-be10da76e8fa' THEN 0 ELSE 1 END,
    created_at NULLS LAST,
    id
  LIMIT 1
)
UPDATE grades g
SET school_id = owner.id
FROM owner
WHERE g.school_id IS NULL;

-- Schools with payment levels but no grades: seed grades from levels.
INSERT INTO grades (
  id, "nameEn", "nameAr", code, "displayOrder", "isActive",
  description, "createdAt", "updatedAt", school_id
)
SELECT
  uuid_generate_v4(),
  LEFT(COALESCE(NULLIF(TRIM(lv.name), ''), lv.code), 100),
  LEFT(COALESCE(NULLIF(TRIM(lv.name), ''), lv.code), 100),
  LEFT(lv.code, 50),
  COALESCE(lv.sort_order, 0),
  COALESCE(lv.is_active, true),
  NULL,
  NOW(),
  NOW(),
  lv.school_id
FROM (
  SELECT DISTINCT ON (spl.school_id, LOWER(LEFT(spl.code, 50))) spl.*
  FROM school_payment_levels spl
  ORDER BY spl.school_id, LOWER(LEFT(spl.code, 50)), spl.sort_order NULLS LAST, spl.id
) lv
WHERE NOT EXISTS (SELECT 1 FROM grades g WHERE g.school_id = lv.school_id);

-- Clone the owner school's grades into schools that still have none.
INSERT INTO grades (
  id, "nameEn", "nameAr", code, "displayOrder", "isActive",
  description, "createdAt", "updatedAt", school_id
)
SELECT
  uuid_generate_v4(),
  src."nameEn", src."nameAr", src.code, src."displayOrder", src."isActive",
  src.description, NOW(), NOW(), s.id
FROM schools s
CROSS JOIN grades src
WHERE src.school_id IS NOT NULL
  AND s.id <> src.school_id
  AND NOT EXISTS (SELECT 1 FROM grades g WHERE g.school_id = s.id)
  AND src.school_id = (
    SELECT g3.school_id
    FROM grades g3
    WHERE g3.school_id IS NOT NULL
    ORDER BY CASE WHEN g3.school_id = '91d02698-72f9-45ac-9715-be10da76e8fa' THEN 0 ELSE 1 END, g3.school_id
    LIMIT 1
  );

DELETE FROM grades WHERE school_id IS NULL;

ALTER TABLE grades ALTER COLUMN school_id SET NOT NULL;

DO $fix$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_grades_school_id') THEN
    ALTER TABLE grades
      ADD CONSTRAINT "FK_grades_school_id"
      FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
  END IF;
END
$fix$;

CREATE UNIQUE INDEX IF NOT EXISTS "UQ_grades_school_code" ON grades (school_id, LOWER(code));
CREATE INDEX IF NOT EXISTS "IDX_grades_school_id" ON grades (school_id);

-- ---------------------------------------------------------------------------
-- AbsenceExcuses1792430000000
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS "absence_excuses" (
  "id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "school_id" uuid NOT NULL,
  "student_id" uuid NOT NULL,
  "submitted_by_user_id" uuid NOT NULL,
  "absence_date" date NOT NULL,
  "explanation" text NOT NULL,
  "original_filename" character varying(255),
  "stored_filename" character varying(255),
  "mime_type" character varying(128),
  "status" character varying(16) NOT NULL DEFAULT 'pending',
  "reviewed_by_user_id" uuid,
  "reviewed_at" TIMESTAMPTZ,
  "rejection_reason" text,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT "PK_absence_excuses" PRIMARY KEY ("id"),
  CONSTRAINT "FK_absence_excuses_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_absence_excuses_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_absence_excuses_submitter" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
  CONSTRAINT "FK_absence_excuses_reviewer" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS "IDX_absence_excuses_school_status"
  ON "absence_excuses" ("school_id", "status", "created_at");

-- RBAC pages (values match RBAC_PAGE_SEED in src/rbac/rbac-catalog.seed.ts)
INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
VALUES
  ('absence_excuses',        '/attendance/excuses', 'Absence excuses',        'أعذار الغياب',    'school', 34, true),
  ('parent_absence_excuses', '/parent/excuses',     'Parent absence excuses', 'أعذار ولي الأمر', 'school', 72, true)
ON CONFLICT ("key") DO UPDATE SET
  "route" = EXCLUDED."route",
  "nameEn" = EXCLUDED."nameEn",
  "nameAr" = EXCLUDED."nameAr",
  "scope" = EXCLUDED."scope",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = true;

INSERT INTO "rbac_page_actions" ("pageId", "actionId")
SELECT p.id, a.id
FROM (VALUES
  ('absence_excuses', 'view'),
  ('absence_excuses', 'approve'),
  ('parent_absence_excuses', 'view'),
  ('parent_absence_excuses', 'create')
) AS v(page_key, action_code)
JOIN "rbac_pages" p ON p.key = v.page_key
JOIN "rbac_actions" a ON a.code = v.action_code
ON CONFLICT DO NOTHING;

UPDATE "platform_modules"
SET "page_keys" = "page_keys" || '["absence_excuses"]'::jsonb, "updated_at" = now()
WHERE code = 'attendance'
  AND NOT ("page_keys" @> '["absence_excuses"]'::jsonb);
UPDATE "platform_modules"
SET "page_keys" = "page_keys" || '["parent_absence_excuses"]'::jsonb, "updated_at" = now()
WHERE code = 'parent_portal'
  AND NOT ("page_keys" @> '["parent_absence_excuses"]'::jsonb);

INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
SELECT DISTINCT gp."groupId", dest.id,
  CASE WHEN src_action.code IN ('edit', 'create') THEN approve_action.id ELSE view_action.id END
FROM "rbac_group_permissions" gp
JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'attendance'
JOIN "rbac_actions" src_action ON src_action.id = gp."actionId" AND src_action.code IN ('view', 'edit', 'create')
JOIN "rbac_pages" dest ON dest.key = 'absence_excuses'
JOIN "rbac_actions" view_action ON view_action.code = 'view'
JOIN "rbac_actions" approve_action ON approve_action.code = 'approve'
JOIN "rbac_page_actions" pa
  ON pa."pageId" = dest.id
 AND pa."actionId" = CASE WHEN src_action.code IN ('edit', 'create') THEN approve_action.id ELSE view_action.id END
ON CONFLICT DO NOTHING;

INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
SELECT g.id, dest.id, pa."actionId"
FROM "rbac_groups" g
JOIN "rbac_pages" dest ON dest.key = 'absence_excuses'
JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id
WHERE g.code = 'school_admin'
   OR g."systemKey" = 'school_admin_template'
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------------
-- DropParentCanViewOtherStudentsSetting1792430000000
-- ---------------------------------------------------------------------------
DELETE FROM school_system_settings
WHERE setting_key = 'userPermissions.parentCanViewOtherStudents';

-- ---------------------------------------------------------------------------
-- ChatAdminReview1792440000000
-- ---------------------------------------------------------------------------
ALTER TABLE "group_chat_messages"  ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;
ALTER TABLE "direct_chat_messages" ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;
ALTER TABLE "adhoc_chat_messages"  ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false;

CREATE INDEX IF NOT EXISTS "IDX_group_chat_messages_admin_review"
  ON "group_chat_messages" ("group_id") WHERE "admin_review" = true;
CREATE INDEX IF NOT EXISTS "IDX_direct_chat_messages_admin_review"
  ON "direct_chat_messages" ("thread_id") WHERE "admin_review" = true;
CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_messages_admin_review"
  ON "adhoc_chat_messages" ("room_id") WHERE "admin_review" = true;

INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
VALUES ('chat_audit', '/admin/chat-review', 'Conversation review', 'مراجعة المحادثات', 'school', 41, true)
ON CONFLICT ("key") DO UPDATE SET
  "route" = EXCLUDED."route",
  "nameEn" = EXCLUDED."nameEn",
  "nameAr" = EXCLUDED."nameAr",
  "scope" = EXCLUDED."scope",
  "sortOrder" = EXCLUDED."sortOrder",
  "isActive" = true;

INSERT INTO "rbac_page_actions" ("pageId", "actionId")
SELECT p.id, a.id
FROM "rbac_pages" p
JOIN "rbac_actions" a ON a.code IN ('view', 'search')
WHERE p.key = 'chat_audit'
ON CONFLICT DO NOTHING;

UPDATE "platform_modules"
SET "page_keys" = "page_keys" || '["chat_audit"]'::jsonb, "updated_at" = now()
WHERE code = 'messaging'
  AND NOT ("page_keys" @> '["chat_audit"]'::jsonb);

-- School admins (holders of system_settings:view) get the review page.
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

-- ---------------------------------------------------------------------------
-- ActivityImageUrl1792450000000
-- ---------------------------------------------------------------------------
ALTER TABLE activities ADD COLUMN IF NOT EXISTS image_url text NULL;

-- ---------------------------------------------------------------------------
-- Record the migrations so the startup runner won't run them again.
-- ---------------------------------------------------------------------------
INSERT INTO "migrations" ("timestamp", "name")
SELECT v.ts, v.name
FROM (VALUES
  (1792420000000::bigint, 'BusArrivalEtaAlerts1792420000000'),
  (1792420000000::bigint, 'GradesSchoolScope1792420000000'),
  (1792430000000::bigint, 'AbsenceExcuses1792430000000'),
  (1792430000000::bigint, 'DropParentCanViewOtherStudentsSetting1792430000000'),
  (1792440000000::bigint, 'ChatAdminReview1792440000000'),
  (1792450000000::bigint, 'ActivityImageUrl1792450000000')
) AS v(ts, name)
WHERE NOT EXISTS (SELECT 1 FROM "migrations" m WHERE m.name = v.name);

COMMIT;

-- Check afterwards (expect 6 rows):
-- SELECT name FROM "migrations" WHERE "timestamp" >= 1792420000000 ORDER BY "timestamp", name;
