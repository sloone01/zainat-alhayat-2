import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Platform plans move from "flat price + included seats + overage" to
 * "max(minimum fee, rate × active students)" per billing period, with a
 * student-size band per plan and configurable discounts (package / school / promo).
 * Existing flat prices become the minimum fee; per-student rates start at 0.
 */
export class PerStudentPlatformPricing1792690000000 implements MigrationInterface {
  name = 'PerStudentPlatformPricing1792690000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_plans"
        ADD COLUMN IF NOT EXISTS "min_students" int NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "max_students" int NULL
    `);
    const hasSeats: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'platform_plans' AND column_name = 'included_student_seats'
      ) AS "exists"
    `);
    if (hasSeats[0]?.exists) {
      await queryRunner.query(`
        UPDATE "platform_plans"
        SET "max_students" = "included_student_seats"
        WHERE "max_students" IS NULL AND "included_student_seats" > 0
      `);
    }
    await queryRunner.query(`
      ALTER TABLE "platform_plans"
        DROP COLUMN IF EXISTS "included_student_seats",
        DROP COLUMN IF EXISTS "overage_per_student_omr"
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_plan_prices"
        ADD COLUMN IF NOT EXISTS "per_student_omr" numeric(12,3) NOT NULL DEFAULT 0
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_discounts" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "kind" varchar(16) NOT NULL,
        "name_en" varchar(120) NOT NULL,
        "name_ar" varchar(120) NOT NULL,
        "code" varchar(64) NULL,
        "discount_type" varchar(16) NOT NULL,
        "value" numeric(12,3) NOT NULL,
        "plan_id" uuid NULL REFERENCES "platform_plans"("id") ON DELETE CASCADE,
        "school_id" uuid NULL REFERENCES "schools"("id") ON DELETE CASCADE,
        "billing_periods" text[] NOT NULL DEFAULT '{}',
        "starts_on" date NULL,
        "ends_on" date NULL,
        "duration_periods" int NULL,
        "max_redemptions" int NULL,
        "redemption_count" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_platform_discounts_code"
        ON "platform_discounts" (UPPER("code")) WHERE "code" IS NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "school_platform_subscriptions"
        DROP COLUMN IF EXISTS "included_student_seats_override",
        ADD COLUMN IF NOT EXISTS "billed_students" int NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "promo_discount_id" uuid NULL
          REFERENCES "platform_discounts"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
        ADD COLUMN IF NOT EXISTS "kind" varchar(32) NOT NULL DEFAULT 'subscription',
        ADD COLUMN IF NOT EXISTS "minimum_omr" numeric(12,3) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "per_student_omr" numeric(12,3) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "discount_amount" numeric(12,3) NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "discount_id" uuid NULL
          REFERENCES "platform_discounts"("id") ON DELETE SET NULL,
        DROP COLUMN IF EXISTS "seats_included",
        DROP COLUMN IF EXISTS "overage_amount"
    `);
    const hasSeatsUsed: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'platform_invoices' AND column_name = 'seats_used'
      ) AS "exists"
    `);
    if (hasSeatsUsed[0]?.exists) {
      await queryRunner.query(
        `ALTER TABLE "platform_invoices" RENAME COLUMN "seats_used" TO "students_billed"`,
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_invoices" RENAME COLUMN "students_billed" TO "seats_used"
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
        DROP COLUMN IF EXISTS "kind",
        DROP COLUMN IF EXISTS "minimum_omr",
        DROP COLUMN IF EXISTS "per_student_omr",
        DROP COLUMN IF EXISTS "discount_amount",
        DROP COLUMN IF EXISTS "discount_id",
        ADD COLUMN IF NOT EXISTS "seats_included" int NOT NULL DEFAULT 0,
        ADD COLUMN IF NOT EXISTS "overage_amount" numeric(12,3) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      ALTER TABLE "school_platform_subscriptions"
        DROP COLUMN IF EXISTS "billed_students",
        DROP COLUMN IF EXISTS "promo_discount_id",
        ADD COLUMN IF NOT EXISTS "included_student_seats_override" int NULL
    `);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_discounts"`);
    await queryRunner.query(`
      ALTER TABLE "platform_plan_prices" DROP COLUMN IF EXISTS "per_student_omr"
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_plans"
        ADD COLUMN IF NOT EXISTS "included_student_seats" int NOT NULL DEFAULT 50,
        ADD COLUMN IF NOT EXISTS "overage_per_student_omr" numeric(10,3) NOT NULL DEFAULT 0
    `);
    await queryRunner.query(`
      UPDATE "platform_plans" SET "included_student_seats" = "max_students"
      WHERE "max_students" IS NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_plans"
        DROP COLUMN IF EXISTS "min_students",
        DROP COLUMN IF EXISTS "max_students"
    `);
  }
}
