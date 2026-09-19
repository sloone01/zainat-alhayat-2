import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

export class AbsenceExcuses1792430000000 implements MigrationInterface {
  name = 'AbsenceExcuses1792430000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "absence_excuses" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "submitted_by_user_id" uuid NOT NULL,
        "absence_date" date NOT NULL,
        "explanation" text NOT NULL,
        "original_filename" character varying(255),
        "stored_filename" character varying(255),
        "mime_type" character varying(128),
        "status" character varying(16) NOT NULL DEFAULT 'pending',
        "reviewed_by_user_id" uuid,
        "reviewed_at" TIMESTAMPTZ,
        "rejection_reason" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_absence_excuses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_absence_excuses_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_absence_excuses_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_absence_excuses_submitter" FOREIGN KEY ("submitted_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_absence_excuses_reviewer" FOREIGN KEY ("reviewed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_absence_excuses_school_status"
      ON "absence_excuses" ("school_id", "status", "created_at")
    `);

    const pages = RBAC_PAGE_SEED.filter((p) =>
      p.key === 'absence_excuses' || p.key === 'parent_absence_excuses',
    );
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
    for (const pageSeed of pages) {
      const pageRows: { id: number }[] = await queryRunner.query(
        `SELECT id FROM "rbac_pages" WHERE key = $1`,
        [pageSeed.key],
      );
      const pageId = pageRows[0]?.id;
      if (!pageId) continue;
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
      SET "page_keys" = "page_keys" || '["absence_excuses"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'attendance'
        AND NOT ("page_keys" @> '["absence_excuses"]'::jsonb)
    `);
    await queryRunner.query(`
      UPDATE "platform_modules"
      SET "page_keys" = "page_keys" || '["parent_absence_excuses"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'parent_portal'
        AND NOT ("page_keys" @> '["parent_absence_excuses"]'::jsonb)
    `);

    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT DISTINCT gp."groupId", dest.id,
         CASE WHEN src_action.code IN ('edit', 'create') THEN approve_action.id ELSE view_action.id END
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'attendance'
       JOIN "rbac_actions" src_action ON src_action.id = gp."actionId" AND src_action.code IN ('view', 'edit', 'create')
       JOIN "rbac_pages" dest ON dest.key = 'absence_excuses'
       JOIN "rbac_actions" view_action ON view_action.code = 'view'
       JOIN "rbac_actions" approve_action ON approve_action.code = 'approve'
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id
        AND pa."actionId" = CASE WHEN src_action.code IN ('edit', 'create') THEN approve_action.id ELSE view_action.id END
       ON CONFLICT DO NOTHING`,
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
      ['absence_excuses'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "absence_excuses"`);
  }
}
