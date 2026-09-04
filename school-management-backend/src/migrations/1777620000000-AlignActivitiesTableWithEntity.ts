import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Aligns `public.activities` with Activity entity / InitialMigration shape.
 * - Legacy table (student_id + data jsonb, or non-uuid id): archive then recreate.
 * - Otherwise: add any missing columns with IF NOT EXISTS and ensure FKs.
 */
export class AlignActivitiesTableWithEntity1777620000000 implements MigrationInterface {
  name = 'AlignActivitiesTableWithEntity1777620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    const tableExistsRows: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'activities'
      ) AS exists
    `);
    const tableExists = Boolean(tableExistsRows[0]?.exists);

    if (!tableExists) {
      await this.createActivitiesTable(queryRunner);
      await this.addActivitiesForeignKeys(queryRunner);
      return;
    }

    const legacyRows: Array<{ legacy: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'student_id'
      ) AS legacy
    `);
    const idTypeRows: Array<{ data_type: string }> = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = 'activities' AND column_name = 'id'
      LIMIT 1
    `);
    const idType = idTypeRows[0]?.data_type;
    const needsRebuild =
      Boolean(legacyRows[0]?.legacy) || (idType && idType !== 'uuid');

    if (needsRebuild) {
      await queryRunner.query(
        `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_school"`,
      );
      await queryRunner.query(
        `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_group"`,
      );
      await queryRunner.query(
        `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_created_by"`,
      );
      await queryRunner.query(
        `ALTER TABLE "activities" DROP CONSTRAINT IF EXISTS "FK_activities_student"`,
      );
      await queryRunner.query(
        `ALTER TABLE IF EXISTS "activities" RENAME TO "activities_legacy_pre_align_1777620000000"`,
      );
      await this.createActivitiesTable(queryRunner);
      await this.addActivitiesForeignKeys(queryRunner);
      return;
    }

    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "title" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "description" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "activity_date" date`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "start_time" TIME`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "end_time" TIME`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "location" character varying(200)`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "activity_type" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "is_active" boolean NOT NULL DEFAULT true`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "school_id" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "group_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "created_by" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );

    await queryRunner.query(`
      UPDATE "activities"
      SET
        "title" = COALESCE(NULLIF(TRIM("title"), ''), 'Activity'),
        "activity_date" = COALESCE("activity_date", CURRENT_DATE),
        "activity_type" = COALESCE(NULLIF(TRIM("activity_type"), ''), 'Class Activity'),
        "school_id" = COALESCE("school_id", (SELECT MIN("id") FROM "schools" LIMIT 1))
      WHERE "title" IS NULL OR TRIM(COALESCE("title", '')) = ''
         OR "activity_date" IS NULL
         OR "activity_type" IS NULL OR TRIM(COALESCE("activity_type", '')) = ''
         OR "school_id" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "activities" ALTER COLUMN "title" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "activities" ALTER COLUMN "activity_date" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "activities" ALTER COLUMN "activity_type" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "activities" ALTER COLUMN "school_id" SET NOT NULL
    `);

    await this.addActivitiesForeignKeys(queryRunner);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const legacyRows: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'activities_legacy_pre_align_1777620000000'
      ) AS exists
    `);
    if (legacyRows[0]?.exists) {
      await queryRunner.query(`DROP TABLE IF EXISTS "activities" CASCADE`);
      await queryRunner.query(
        `ALTER TABLE "activities_legacy_pre_align_1777620000000" RENAME TO "activities"`,
      );
      return;
    }

    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP CONSTRAINT IF EXISTS "FK_activities_group"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP CONSTRAINT IF EXISTS "FK_activities_created_by"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP CONSTRAINT IF EXISTS "FK_activities_school"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP COLUMN IF EXISTS "group_id"`,
    );
  }

  private async createActivitiesTable(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
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
            )
        `);
  }

  private async addActivitiesForeignKeys(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_school') THEN
          ALTER TABLE "activities"
            ADD CONSTRAINT "FK_activities_school"
            FOREIGN KEY ("school_id") REFERENCES "schools"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_group') THEN
          ALTER TABLE "activities"
            ADD CONSTRAINT "FK_activities_group"
            FOREIGN KEY ("group_id") REFERENCES "groups"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_created_by') THEN
          ALTER TABLE "activities"
            ADD CONSTRAINT "FK_activities_created_by"
            FOREIGN KEY ("created_by") REFERENCES "users"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }
}
