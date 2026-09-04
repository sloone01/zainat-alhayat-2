import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Modules keep a single price; the 4 billing periods stay on the plan package only.
 * Plan ↔ module linking is unchanged (which modules each plan includes).
 */
export class SimplifyModulePricing1783900000000 implements MigrationInterface {
  name = 'SimplifyModulePricing1783900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_modules"
      ADD COLUMN IF NOT EXISTS "amount_omr" numeric(12,3) NOT NULL DEFAULT 0
    `);

    const hasLegacy = await queryRunner.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'platform_module_prices' LIMIT 1
    `);
    if (hasLegacy?.length) {
      await queryRunner.query(`
        UPDATE "platform_modules" m
        SET "amount_omr" = COALESCE((
          SELECT mp."amount_omr"
          FROM "platform_module_prices" mp
          WHERE mp."module_id" = m."id" AND mp."billing_period" = 'monthly'
          LIMIT 1
        ), m."amount_omr")
      `);
      await queryRunner.query(`DROP TABLE IF EXISTS "platform_module_prices"`);
    }

    // Restore original plan package prices (not summed from modules)
    await queryRunner.query(`
      INSERT INTO "platform_plan_prices" ("plan_id", "billing_period", "amount_omr")
      SELECT p.id, v.period, v.amount
      FROM "platform_plans" p
      CROSS JOIN (VALUES
        ('essential', 'monthly', 45.000),
        ('essential', 'semester', 225.000),
        ('essential', 'yearly', 450.000),
        ('essential', 'summer', 135.000),
        ('standard', 'monthly', 80.000),
        ('standard', 'semester', 400.000),
        ('standard', 'yearly', 800.000),
        ('standard', 'summer', 240.000),
        ('complete', 'monthly', 125.000),
        ('complete', 'semester', 625.000),
        ('complete', 'yearly', 1250.000),
        ('complete', 'summer', 375.000)
      ) AS v(code, period, amount)
      WHERE p.code = v.code
      ON CONFLICT ("plan_id", "billing_period") DO UPDATE SET
        "amount_omr" = EXCLUDED."amount_omr"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_module_prices" (
        "id" SERIAL PRIMARY KEY,
        "module_id" int NOT NULL REFERENCES "platform_modules"("id") ON DELETE CASCADE,
        "billing_period" varchar(32) NOT NULL,
        "amount_omr" numeric(12,3) NOT NULL,
        CONSTRAINT "UQ_platform_module_prices_module_period" UNIQUE ("module_id", "billing_period"),
        CONSTRAINT "CHK_platform_module_prices_period" CHECK (
          "billing_period" IN ('monthly', 'semester', 'yearly', 'summer')
        )
      )
    `);

    await queryRunner.query(`
      INSERT INTO "platform_module_prices" ("module_id", "billing_period", "amount_omr")
      SELECT m.id, v.period, m.amount_omr
      FROM "platform_modules" m
      CROSS JOIN (VALUES ('monthly'), ('semester'), ('yearly'), ('summer')) AS v(period)
      ON CONFLICT DO NOTHING
    `);

    await queryRunner.query(`
      ALTER TABLE "platform_modules" DROP COLUMN IF EXISTS "amount_omr"
    `);
  }
}
