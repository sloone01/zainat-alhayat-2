import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Marketing bullet lines on subscription plans (shown on public package cards).
 * Existing feature_key rows are backfilled into label_en / label_ar.
 */
export class PlatformPlanFeatureLabels1790100000000 implements MigrationInterface {
  name = 'PlatformPlanFeatureLabels1790100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_plan_features"
        ADD COLUMN IF NOT EXISTS "label_en" varchar(200) NULL,
        ADD COLUMN IF NOT EXISTS "label_ar" varchar(200) NULL,
        ADD COLUMN IF NOT EXISTS "sort_order" int NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_plan_features"
        ALTER COLUMN "feature_key" TYPE varchar(120)
    `);

    await queryRunner.query(`
      UPDATE "platform_plan_features"
      SET
        "label_en" = COALESCE(NULLIF(TRIM("label_en"), ''), REPLACE("feature_key", '_', ' ')),
        "label_ar" = COALESCE(NULLIF(TRIM("label_ar"), ''), REPLACE("feature_key", '_', ' '))
      WHERE "label_en" IS NULL OR "label_ar" IS NULL
         OR TRIM(COALESCE("label_en", '')) = ''
         OR TRIM(COALESCE("label_ar", '')) = ''
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_plan_features"
        DROP COLUMN IF EXISTS "sort_order",
        DROP COLUMN IF EXISTS "label_ar",
        DROP COLUMN IF EXISTS "label_en"
    `);
  }
}
