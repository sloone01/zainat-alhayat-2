import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * People names are stored in Arabic + English (same idea as schools.name_ar/name_en).
 * Optional civil_id on parents for global match. Parents are not school-owned;
 * school tenancy is via linked students only.
 */
export class BilingualNamesCivilIdSchoolLessParents1792100000000 implements MigrationInterface {
  name = 'BilingualNamesCivilIdSchoolLessParents1792100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
        ADD COLUMN IF NOT EXISTS "first_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "first_name_en" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_en" character varying(100),
        ADD COLUMN IF NOT EXISTS "civil_id" character varying(20)
    `);
    await queryRunner.query(`
      UPDATE "users"
      SET
        "first_name_ar" = COALESCE(NULLIF(TRIM("first_name_ar"), ''), "firstName"),
        "first_name_en" = COALESCE(NULLIF(TRIM("first_name_en"), ''), "firstName"),
        "last_name_ar" = COALESCE(NULLIF(TRIM("last_name_ar"), ''), "lastName"),
        "last_name_en" = COALESCE(NULLIF(TRIM("last_name_en"), ''), "lastName")
    `);

    await queryRunner.query(`
      ALTER TABLE "parents"
        ADD COLUMN IF NOT EXISTS "first_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "first_name_en" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_en" character varying(100),
        ADD COLUMN IF NOT EXISTS "civil_id" character varying(20)
    `);
    await queryRunner.query(`
      UPDATE "parents"
      SET
        "first_name_ar" = COALESCE(NULLIF(TRIM("first_name_ar"), ''), "firstName"),
        "first_name_en" = COALESCE(NULLIF(TRIM("first_name_en"), ''), "firstName"),
        "last_name_ar" = COALESCE(NULLIF(TRIM("last_name_ar"), ''), "lastName"),
        "last_name_en" = COALESCE(NULLIF(TRIM("last_name_en"), ''), "lastName")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_parents_civil_id"
        ON "parents" ("civil_id")
        WHERE "civil_id" IS NOT NULL AND TRIM("civil_id") <> ''
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
        ADD COLUMN IF NOT EXISTS "first_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "first_name_en" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_ar" character varying(100),
        ADD COLUMN IF NOT EXISTS "last_name_en" character varying(100)
    `);
    await queryRunner.query(`
      UPDATE "students"
      SET
        "first_name_ar" = COALESCE(NULLIF(TRIM("first_name_ar"), ''), "firstName"),
        "first_name_en" = COALESCE(NULLIF(TRIM("first_name_en"), ''), "firstName"),
        "last_name_ar" = COALESCE(NULLIF(TRIM("last_name_ar"), ''), "lastName"),
        "last_name_en" = COALESCE(NULLIF(TRIM("last_name_en"), ''), "lastName")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_parents_civil_id"`);
    await queryRunner.query(`
      ALTER TABLE "students"
        DROP COLUMN IF EXISTS "first_name_ar",
        DROP COLUMN IF EXISTS "first_name_en",
        DROP COLUMN IF EXISTS "last_name_ar",
        DROP COLUMN IF EXISTS "last_name_en"
    `);
    await queryRunner.query(`
      ALTER TABLE "parents"
        DROP COLUMN IF EXISTS "first_name_ar",
        DROP COLUMN IF EXISTS "first_name_en",
        DROP COLUMN IF EXISTS "last_name_ar",
        DROP COLUMN IF EXISTS "last_name_en",
        DROP COLUMN IF EXISTS "civil_id"
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
        DROP COLUMN IF EXISTS "first_name_ar",
        DROP COLUMN IF EXISTS "first_name_en",
        DROP COLUMN IF EXISTS "last_name_ar",
        DROP COLUMN IF EXISTS "last_name_en",
        DROP COLUMN IF EXISTS "civil_id"
    `);
  }
}
