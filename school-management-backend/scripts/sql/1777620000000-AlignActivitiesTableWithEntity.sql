-- AlignActivitiesTableWithEntity1777620000000
-- Equivalent to: src/migrations/1777620000000-AlignActivitiesTableWithEntity.ts (up only)
-- Target: PostgreSQL (public schema). Requires schools, groups, users tables for FKs.
-- Review before running on production; legacy path renames old "activities" and creates an empty table.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$
DECLARE
  tbl_exists boolean;
  legacy boolean;
  id_typ text;
  needs_rebuild boolean;
BEGIN
  SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'activities'
  ) INTO tbl_exists;

  IF NOT tbl_exists THEN
    CREATE TABLE "activities" (
      "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
      "title" character varying(200) NOT NULL,
      "description" text,
      "activity_date" date NOT NULL,
      "start_time" TIME,
      "end_time" TIME,
      "location" character varying(200),
      "activity_type" character varying NOT NULL,
      "is_active" boolean NOT NULL DEFAULT true,
      "school_id" integer NOT NULL,
      "group_id" uuid,
      "created_by" uuid,
      "created_at" TIMESTAMP NOT NULL DEFAULT now(),
      "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
      CONSTRAINT "PK_d8d8d8d8d8d8d8d8d8d8d8d8d8d" PRIMARY KEY ("id")
    );
  ELSE
    SELECT EXISTS (
      SELECT FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'student_id'
    ) INTO legacy;

    SELECT c.data_type
    INTO id_typ
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.table_name = 'activities' AND c.column_name = 'id'
    LIMIT 1;

    needs_rebuild := COALESCE(legacy, false) OR (id_typ IS NOT NULL AND id_typ <> 'uuid');

    IF needs_rebuild THEN
      ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_school";
      ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_group";
      ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_created_by";
      ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_student";
      ALTER TABLE IF EXISTS "activities" RENAME TO "activities_legacy_pre_align_1777620000000";

      CREATE TABLE "activities" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(200) NOT NULL,
        "description" text,
        "activity_date" date NOT NULL,
        "start_time" TIME,
        "end_time" TIME,
        "location" character varying(200),
        "activity_type" character varying NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "school_id" integer NOT NULL,
        "group_id" uuid,
        "created_by" uuid,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_d8d8d8d8d8d8d8d8d8d8d8d8d" PRIMARY KEY ("id")
      );
    ELSE
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "title" character varying(200);
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "description" text;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "activity_date" date;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "start_time" TIME;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "end_time" TIME;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "location" character varying(200);
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "activity_type" character varying;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "school_id" integer;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "group_id" uuid;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "created_by" uuid;
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now();
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now();

      UPDATE "activities"
      SET
        "title" = COALESCE(NULLIF(TRIM("title"), ''), 'Activity'),
        "activity_date" = COALESCE("activity_date", CURRENT_DATE),
        "activity_type" = COALESCE(NULLIF(TRIM("activity_type"), ''), 'Class Activity'),
        "school_id" = COALESCE("school_id", (SELECT MIN("id") FROM "schools" LIMIT 1))
      WHERE "title" IS NULL OR TRIM(COALESCE("title", '')) = ''
         OR "activity_date" IS NULL
         OR "activity_type" IS NULL OR TRIM(COALESCE("activity_type", '')) = ''
         OR "school_id" IS NULL;

      ALTER TABLE "activities" ALTER COLUMN "title" SET NOT NULL;
      ALTER TABLE "activities" ALTER COLUMN "activity_date" SET NOT NULL;
      ALTER TABLE "activities" ALTER COLUMN "activity_type" SET NOT NULL;
      ALTER TABLE "activities" ALTER COLUMN "school_id" SET NOT NULL;
    END IF;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_school') THEN
    ALTER TABLE "activities"
      ADD CONSTRAINT "FK_activities_school"
      FOREIGN KEY ("school_id") REFERENCES "schools"("id")
      ON DELETE CASCADE ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_group') THEN
    ALTER TABLE "activities"
      ADD CONSTRAINT "FK_activities_group"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_created_by') THEN
    ALTER TABLE "activities"
      ADD CONSTRAINT "FK_activities_created_by"
      FOREIGN KEY ("created_by") REFERENCES "users"("id")
      ON DELETE SET NULL ON UPDATE NO ACTION;
  END IF;
END $$;
