import { MigrationInterface, QueryRunner } from 'typeorm';

export class CoursePaymentProfiles1782400000000 implements MigrationInterface {
  name = 'CoursePaymentProfiles1782400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_payment_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "course_id" uuid NOT NULL,
        "course_pricing_basis" character varying(16) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_payment_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_course_payment_profiles_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_course_payment_profiles_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "CHK_course_payment_profiles_basis" CHECK ("course_pricing_basis" IN ('grade', 'phase')),
        CONSTRAINT "UQ_course_payment_profiles_school_course" UNIQUE ("school_id", "course_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_payment_charge_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profile_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_payment_charge_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_course_payment_charge_lines_profile" FOREIGN KEY ("profile_id") REFERENCES "course_payment_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_course_payment_charge_lines_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "UQ_course_payment_charge_lines_profile_type" UNIQUE ("profile_id", "charge_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_payment_profiles_school"
      ON "course_payment_profiles" ("school_id")
    `);

    // Legacy: per-course fees lived on level_payment_profiles; fold into per_year so level fees stay annual-only.
    await queryRunner.query(`
      UPDATE "level_payment_profiles" p
      SET
        "pricing_model" = 'per_year',
        "year_payment_mode" = COALESCE(p."year_payment_mode", 'one_time'),
        "year_total_amount" = COALESCE(
          (
            SELECT SUM(l."amount"::numeric)
            FROM "level_payment_charge_lines" l
            WHERE l."profile_id" = p."id"
          ),
          CASE
            WHEN p."year_total_amount" IS NOT NULL AND TRIM(p."year_total_amount"::text) <> ''
            THEN p."year_total_amount"::numeric
            ELSE 0::numeric
          END
        )
      WHERE p."pricing_model" = 'per_course'
    `);

    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles" DROP CONSTRAINT IF EXISTS "CHK_level_payment_profiles_pricing_model"
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles"
      ADD CONSTRAINT "CHK_level_payment_profiles_pricing_model" CHECK ("pricing_model" IN ('per_year'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles" DROP CONSTRAINT IF EXISTS "CHK_level_payment_profiles_pricing_model"
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles"
      ADD CONSTRAINT "CHK_level_payment_profiles_pricing_model" CHECK ("pricing_model" IN ('per_year', 'per_course'))
    `);

    await queryRunner.query(`DROP TABLE IF EXISTS "course_payment_charge_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_payment_profiles"`);
  }
}
