import { MigrationInterface, QueryRunner } from 'typeorm';
import { PLATFORM_MODULE_SEED } from '../platform-billing/platform-modules.seed';

export class CreatePlatformModules1783800000000 implements MigrationInterface {
  name = 'CreatePlatformModules1783800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_modules" (
        "id" SERIAL PRIMARY KEY,
        "code" varchar(64) NOT NULL UNIQUE,
        "name_en" varchar(120) NOT NULL,
        "name_ar" varchar(120) NOT NULL,
        "description_en" text NULL,
        "description_ar" text NULL,
        "amount_omr" numeric(12,3) NOT NULL DEFAULT 0,
        "page_keys" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "sort_order" int NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    // Legacy table kept only so already-applied DBs that created it stay consistent
    // until SimplifyModulePricing drops it. Fresh installs skip creating it.
    const hasLegacy = await queryRunner.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'platform_module_prices' LIMIT 1
    `);
    if (!hasLegacy?.length) {
      // no-op: new shape uses amount_omr on platform_modules only
    }

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plan_modules" (
        "id" SERIAL PRIMARY KEY,
        "plan_id" int NOT NULL REFERENCES "platform_plans"("id") ON DELETE CASCADE,
        "module_id" int NOT NULL REFERENCES "platform_modules"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_platform_plan_modules_plan_module" UNIQUE ("plan_id", "module_id")
      )
    `);

    for (const mod of PLATFORM_MODULE_SEED) {
      await queryRunner.query(
        `
        INSERT INTO "platform_modules"
          ("code", "name_en", "name_ar", "description_en", "description_ar",
           "amount_omr", "page_keys", "sort_order", "is_active")
        VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, true)
        ON CONFLICT ("code") DO UPDATE SET
          "name_en" = EXCLUDED."name_en",
          "name_ar" = EXCLUDED."name_ar",
          "description_en" = EXCLUDED."description_en",
          "description_ar" = EXCLUDED."description_ar",
          "amount_omr" = EXCLUDED."amount_omr",
          "page_keys" = EXCLUDED."page_keys",
          "sort_order" = EXCLUDED."sort_order",
          "updated_at" = now()
        `,
        [
          mod.code,
          mod.name_en,
          mod.name_ar,
          mod.description_en,
          mod.description_ar,
          mod.amount_omr.toFixed(3),
          JSON.stringify(mod.page_keys),
          mod.sort_order,
        ],
      );

      for (const planCode of mod.in_plans) {
        await queryRunner.query(
          `
          INSERT INTO "platform_plan_modules" ("plan_id", "module_id")
          SELECT p.id, m.id
          FROM "platform_plans" p
          CROSS JOIN "platform_modules" m
          WHERE p.code = $1 AND m.code = $2
          ON CONFLICT ("plan_id", "module_id") DO NOTHING
          `,
          [planCode, mod.code],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_plan_modules"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_module_prices"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "platform_modules"`);
  }
}
