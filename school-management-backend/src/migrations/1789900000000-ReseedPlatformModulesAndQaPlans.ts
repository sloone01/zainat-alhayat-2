import { MigrationInterface, QueryRunner } from 'typeorm';
import {
  expandModulePlanCodes,
  PLATFORM_MODULE_SEED } from '../platform-billing/platform-modules.seed';

/**
 * Production DBs often have zero `platform_modules` (migration skipped / empty)
 * and only QA plan codes (`qa-basic`, `qa-premium`). Re-seed modules, link them
 * to canonical + QA plans, then copy plan modules onto each school's subscription.
 */
export class ReseedPlatformModulesAndQaPlans1789900000000
  implements MigrationInterface
{
  name = 'ReseedPlatformModulesAndQaPlans1789900000000';

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

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "platform_plan_modules" (
        "id" SERIAL PRIMARY KEY,
        "plan_id" int NOT NULL REFERENCES "platform_plans"("id") ON DELETE CASCADE,
        "module_id" int NOT NULL REFERENCES "platform_modules"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_platform_plan_modules_plan_module" UNIQUE ("plan_id", "module_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_modules" (
        "id" SERIAL PRIMARY KEY,
        "school_id" int NOT NULL REFERENCES "schools"("id") ON DELETE CASCADE,
        "module_id" int NOT NULL REFERENCES "platform_modules"("id") ON DELETE CASCADE,
        "source" varchar(16) NOT NULL DEFAULT 'plan',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_school_modules_school_module" UNIQUE ("school_id", "module_id")
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
          "is_active" = true,
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

      for (const planCode of expandModulePlanCodes(mod.in_plans)) {
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

    // Sync plan-sourced entitlements for every school with a subscription.
    await queryRunner.query(`
      INSERT INTO "school_modules" ("school_id", "module_id", "source", "is_active")
      SELECT s.school_id, pm.module_id, 'plan', true
      FROM "school_platform_subscriptions" s
      INNER JOIN "platform_plan_modules" pm ON pm.plan_id = s.plan_id
      ON CONFLICT ("school_id", "module_id") DO UPDATE SET
        "is_active" = true,
        "source" = CASE
          WHEN "school_modules"."source" = 'manual' THEN 'manual'
          ELSE 'plan'
        END,
        "updated_at" = now()
    `);

    // Drop plan-sourced rows that are no longer on the school's plan (keep manual).
    await queryRunner.query(`
      DELETE FROM "school_modules" sm
      WHERE sm.source <> 'manual'
        AND NOT EXISTS (
          SELECT 1
          FROM "school_platform_subscriptions" s
          INNER JOIN "platform_plan_modules" pm
            ON pm.plan_id = s.plan_id AND pm.module_id = sm.module_id
          WHERE s.school_id = sm.school_id
        )
    `);
  }

  public async down(): Promise<void> {
    // Non-destructive: modules may already be in use by schools.
  }
}
