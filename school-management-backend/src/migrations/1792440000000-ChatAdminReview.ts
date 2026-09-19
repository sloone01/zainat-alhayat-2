import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * Per-message admin-review flag (default false so history stays hidden),
 * plus the school admin page that searches only flagged messages.
 */
export class ChatAdminReview1792440000000 implements MigrationInterface {
  name = 'ChatAdminReview1792440000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "group_chat_messages"
      ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "direct_chat_messages"
      ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_messages"
      ADD COLUMN IF NOT EXISTS "admin_review" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_group_chat_messages_admin_review"
      ON "group_chat_messages" ("group_id")
      WHERE "admin_review" = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_direct_chat_messages_admin_review"
      ON "direct_chat_messages" ("thread_id")
      WHERE "admin_review" = true
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_messages_admin_review"
      ON "adhoc_chat_messages" ("room_id")
      WHERE "admin_review" = true
    `);

    const pages = RBAC_PAGE_SEED.filter((p) => p.key === 'chat_audit');
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

    const actionRows: { id: string; code: string }[] = await queryRunner.query(
      `SELECT id, code FROM "rbac_actions"`,
    );
    const actionIdByCode = new Map(actionRows.map((r) => [r.code, r.id]));
    const pageRows: { id: string; key: string }[] = await queryRunner.query(
      `SELECT id, key FROM "rbac_pages" WHERE key = 'chat_audit'`,
    );
    const pageId = pageRows[0]?.id;
    if (pageId) {
      for (const code of pages[0]?.actions || []) {
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
      SET "page_keys" = "page_keys" || '["chat_audit"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'messaging'
        AND NOT ("page_keys" @> '["chat_audit"]'::jsonb)
    `);

    // School admins (holders of system settings) get the review page. Teachers do not.
    await queryRunner.query(`
      INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
      SELECT DISTINCT gp."groupId", dest.id, dest_action.id
      FROM "rbac_group_permissions" gp
      JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = 'system_settings'
      JOIN "rbac_actions" src_action ON src_action.id = gp."actionId" AND src_action.code = 'view'
      JOIN "rbac_pages" dest ON dest.key = 'chat_audit'
      JOIN "rbac_actions" dest_action ON dest_action.code IN ('view', 'search')
      JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id AND pa."actionId" = dest_action.id
      ON CONFLICT DO NOTHING
    `);
    await queryRunner.query(`
      INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
      SELECT DISTINCT rp."roleId", dest.id, dest_action.id
      FROM "rbac_role_permissions" rp
      JOIN "rbac_pages" src ON src.id = rp."pageId" AND src.key = 'system_settings'
      JOIN "rbac_actions" src_action ON src_action.id = rp."actionId" AND src_action.code = 'view'
      JOIN "rbac_pages" dest ON dest.key = 'chat_audit'
      JOIN "rbac_actions" dest_action ON dest_action.code IN ('view', 'search')
      JOIN "rbac_page_actions" pa ON pa."pageId" = dest.id AND pa."actionId" = dest_action.id
      ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "rbac_group_permissions"
      WHERE "pageId" IN (SELECT id FROM "rbac_pages" WHERE key = 'chat_audit')
    `);
    await queryRunner.query(`
      DELETE FROM "rbac_role_permissions"
      WHERE "pageId" IN (SELECT id FROM "rbac_pages" WHERE key = 'chat_audit')
    `);
    await queryRunner.query(`
      DELETE FROM "rbac_page_actions"
      WHERE "pageId" IN (SELECT id FROM "rbac_pages" WHERE key = 'chat_audit')
    `);
    await queryRunner.query(`DELETE FROM "rbac_pages" WHERE key = 'chat_audit'`);
    await queryRunner.query(`
      UPDATE "platform_modules"
      SET "page_keys" = "page_keys" - 'chat_audit'
      WHERE code = 'messaging'
    `);
    await queryRunner.query(`ALTER TABLE "group_chat_messages" DROP COLUMN IF EXISTS "admin_review"`);
    await queryRunner.query(`ALTER TABLE "direct_chat_messages" DROP COLUMN IF EXISTS "admin_review"`);
    await queryRunner.query(`ALTER TABLE "adhoc_chat_messages" DROP COLUMN IF EXISTS "admin_review"`);
  }
}
