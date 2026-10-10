import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';
import { PLATFORM_MODULE_SEED } from '../platform-billing/platform-modules.seed';

/**
 * Independent courses get their own page + module so a school's plan can leave them out.
 * Every plan, school and group that has `courses` today keeps independent courses.
 * Also adds pages that were missing from module page_keys, so gating a school by plan
 * does not hide grade levels, report exports or parent materials / weekly plans.
 */
export class StandaloneCoursesModule1792700000000 implements MigrationInterface {
  name = 'StandaloneCoursesModule1792700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const page = RBAC_PAGE_SEED.find((p) => p.key === 'standalone_courses');
    if (!page) throw new Error('standalone_courses page seed missing');

    await queryRunner.query(
      `INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
       VALUES ($1, $2, $3, $4, $5, $6, true)
       ON CONFLICT ("key") DO UPDATE SET
         "route" = EXCLUDED."route",
         "nameEn" = EXCLUDED."nameEn",
         "nameAr" = EXCLUDED."nameAr",
         "scope" = EXCLUDED."scope",
         "sortOrder" = EXCLUDED."sortOrder",
         "isActive" = true`,
      [page.key, page.route, page.nameEn, page.nameAr, page.scope, page.sortOrder],
    );
    await queryRunner.query(
      `INSERT INTO "rbac_page_actions" ("pageId", "actionId")
       SELECT p.id, a.id
       FROM "rbac_pages" p
       JOIN "rbac_actions" a ON a.code = ANY($2::text[])
       WHERE p.key = $1
       ON CONFLICT DO NOTHING`,
      [page.key, [...page.actions]],
    );

    // Same grants as the skill courses page.
    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT DISTINCT gp."groupId", dest.id, gp."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'courses'
       JOIN "rbac_pages" dest ON dest.key = $1
       JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id AND pa."actionId" = gp."actionId"
       ON CONFLICT DO NOTHING`,
      [page.key],
    );

    const mod = PLATFORM_MODULE_SEED.find((m) => m.code === 'standalone_courses');
    if (!mod) throw new Error('standalone_courses module seed missing');
    await queryRunner.query(
      `INSERT INTO "platform_modules"
         ("code", "name_en", "name_ar", "description_en", "description_ar",
          "amount_omr", "page_keys", "sort_order", "is_active")
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8, true)
       ON CONFLICT ("code") DO UPDATE SET
         "page_keys" = EXCLUDED."page_keys",
         "is_active" = true,
         "updated_at" = now()`,
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

    await queryRunner.query(`
      INSERT INTO "platform_plan_modules" ("plan_id", "module_id")
      SELECT pm.plan_id, dest.id
      FROM "platform_plan_modules" pm
      JOIN "platform_modules" src ON src.id = pm.module_id AND src.code = 'courses'
      JOIN "platform_modules" dest ON dest.code = 'standalone_courses'
      WHERE NOT EXISTS (
        SELECT 1 FROM "platform_plan_modules" x
        WHERE x.plan_id = pm.plan_id AND x.module_id = dest.id
      )
    `);
    await queryRunner.query(`
      INSERT INTO "school_modules" ("school_id", "module_id", "source", "is_active")
      SELECT sm.school_id, dest.id, sm.source, sm.is_active
      FROM "school_modules" sm
      JOIN "platform_modules" src ON src.id = sm.module_id AND src.code = 'courses'
      JOIN "platform_modules" dest ON dest.code = 'standalone_courses'
      WHERE NOT EXISTS (
        SELECT 1 FROM "school_modules" x
        WHERE x.school_id = sm.school_id AND x.module_id = dest.id
      )
    `);

    const missingPages: Record<string, string[]> = {
      reports: ['reports_fees_due', 'reports_exports', 'reports_export_templates', 'reports_student_export'],
      system_settings: ['grade_levels'],
      parent_portal: ['parent_course_materials', 'parent_weekly_plans'],
    };
    for (const [code, keys] of Object.entries(missingPages)) {
      for (const key of keys) {
        await queryRunner.query(
          `UPDATE "platform_modules"
           SET "page_keys" = "page_keys" || jsonb_build_array($2::text),
               "updated_at" = now()
           WHERE code = $1
             AND NOT ("page_keys" @> jsonb_build_array($2::text))`,
          [code, key],
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "platform_modules" WHERE code = 'standalone_courses'`);
    await queryRunner.query(`DELETE FROM "rbac_pages" WHERE key = 'standalone_courses'`);
  }
}
