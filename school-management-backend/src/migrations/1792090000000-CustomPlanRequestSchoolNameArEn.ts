import { MigrationInterface, QueryRunner } from 'typeorm';

export class CustomPlanRequestSchoolNameArEn1792090000000 implements MigrationInterface {
  name = 'CustomPlanRequestSchoolNameArEn1792090000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_custom_plan_requests"
        ADD COLUMN IF NOT EXISTS "school_name_ar" character varying(200),
        ADD COLUMN IF NOT EXISTS "school_name_en" character varying(200)
    `);
    await queryRunner.query(`
      UPDATE "platform_custom_plan_requests"
      SET "school_name_ar" = COALESCE(NULLIF(TRIM("school_name_ar"), ''), "school_name")
      WHERE "school_name_ar" IS NULL OR TRIM(COALESCE("school_name_ar", '')) = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_custom_plan_requests"
        DROP COLUMN IF EXISTS "school_name_ar",
        DROP COLUMN IF EXISTS "school_name_en"
    `);
  }
}
