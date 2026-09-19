import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';
import {
  DEFAULT_PARENT_ENROLLMENT_RESPONSIBILITIES,
  DEFAULT_SCHOOL_ENROLLMENT_RESPONSIBILITIES,
} from '../enrollment-responsibility.defaults';

/**
 * Per-school enrollment responsibility lists (school vs parent) for the public enrollment form.
 */
export class EnrollmentResponsibilityItems1792260000000 implements MigrationInterface {
  name = 'EnrollmentResponsibilityItems1792260000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "enrollment_responsibility_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "party" character varying(16) NOT NULL,
        "text_ar" text NOT NULL,
        "text_en" text NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_enrollment_responsibility_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_enrollment_resp_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollment_resp_school_party"
      ON "enrollment_responsibility_items" ("school_id", "party", "is_active")
    `);

    const schools: { id: string }[] = await queryRunner.query(`SELECT id FROM "schools"`);
    for (const school of schools) {
      let order = 0;
      for (const item of DEFAULT_SCHOOL_ENROLLMENT_RESPONSIBILITIES) {
        await queryRunner.query(
          `INSERT INTO "enrollment_responsibility_items"
            ("school_id", "party", "text_ar", "text_en", "sort_order", "is_active")
           VALUES ($1, 'school', $2, $3, $4, true)`,
          [school.id, item.text_ar, item.text_en, order++],
        );
      }
      order = 0;
      for (const item of DEFAULT_PARENT_ENROLLMENT_RESPONSIBILITIES) {
        await queryRunner.query(
          `INSERT INTO "enrollment_responsibility_items"
            ("school_id", "party", "text_ar", "text_en", "sort_order", "is_active")
           VALUES ($1, 'parent', $2, $3, $4, true)`,
          [school.id, item.text_ar, item.text_en, order++],
        );
      }
    }

    const pages = RBAC_PAGE_SEED.filter((p) => p.key === 'enrollment_responsibilities');
    for (const p of pages) {
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
        [p.key, p.route, p.nameEn, p.nameAr, p.scope, p.sortOrder],
      );
    }

    const actionRows: { id: number; code: string }[] = await queryRunner.query(
      `SELECT id, code FROM "rbac_actions"`,
    );
    const actionIdByCode = new Map(actionRows.map((r) => [r.code, r.id]));
    const pageRows: { id: number; key: string }[] = await queryRunner.query(
      `SELECT id, key FROM "rbac_pages" WHERE key = $1`,
      ['enrollment_responsibilities'],
    );
    const pageId = pageRows[0]?.id;
    const pageSeed = pages[0];
    if (pageId && pageSeed) {
      for (const code of pageSeed.actions) {
        const actionId = actionIdByCode.get(code);
        if (!actionId) continue;
        await queryRunner.query(
          `INSERT INTO "rbac_page_actions" ("pageId", "actionId")
           VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [pageId, actionId],
        );
      }
    }

    await queryRunner.query(`
      UPDATE "platform_modules"
      SET "page_keys" = "page_keys" || '["enrollment_responsibilities"]'::jsonb,
          "updated_at" = now()
      WHERE code IN ('enrollments', 'school_settings')
        AND NOT ("page_keys" @> '["enrollment_responsibilities"]'::jsonb)
    `);

    const siblingKeys = ['enrollments', 'settings', 'grade_levels'];
    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT DISTINCT gp."groupId", dest."id", gp."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = ANY($1)
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = gp."actionId"
       ON CONFLICT DO NOTHING`,
      [siblingKeys, 'enrollment_responsibilities'],
    );
    await queryRunner.query(
      `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
       SELECT DISTINCT rp."roleId", dest."id", rp."actionId"
       FROM "rbac_role_permissions" rp
       JOIN "rbac_pages" src ON src.id = rp."pageId" AND src.key = ANY($1)
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = rp."actionId"
       ON CONFLICT DO NOTHING`,
      [siblingKeys, 'enrollment_responsibilities'],
    );
    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT g.id, dest.id, pa."actionId"
       FROM "rbac_groups" g
       JOIN "rbac_pages" dest ON dest.key = $1
       JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id
       WHERE g.code = 'school_admin'
          OR g."systemKey" = 'school_admin_template'
       ON CONFLICT DO NOTHING`,
      ['enrollment_responsibilities'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "enrollment_responsibility_items"`);
  }
}
