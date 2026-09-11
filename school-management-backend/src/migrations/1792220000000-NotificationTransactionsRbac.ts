import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * Register message-transaction log pages and grant them beside notification templates.
 * Additive only — never deletes existing group claims.
 */
export class NotificationTransactionsRbac1792220000000 implements MigrationInterface {
  name = 'NotificationTransactionsRbac1792220000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const newKeys = [
      'notification_transactions',
      'platform_notification_transactions',
    ] as const;

    const pages = RBAC_PAGE_SEED.filter((p) =>
      (newKeys as readonly string[]).includes(p.key),
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

    const pageRows: { id: number; key: string }[] = await queryRunner.query(
      `SELECT id, key FROM "rbac_pages" WHERE key = ANY($1)`,
      [pages.map((p) => p.key)],
    );
    const pageIdByKey = new Map(pageRows.map((r) => [r.key, r.id]));

    for (const p of pages) {
      const pageId = pageIdByKey.get(p.key);
      if (!pageId) continue;
      for (const code of p.actions) {
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
      SET "page_keys" = "page_keys" || '["notification_transactions"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'notifications'
        AND NOT ("page_keys" @> '["notification_transactions"]'::jsonb)
    `);

    await this.copySiblingGrants(
      queryRunner,
      'notification_templates',
      'notification_transactions',
    );
    await this.copySiblingGrants(
      queryRunner,
      'platform_notification_templates',
      'platform_notification_transactions',
    );
  }

  private async copySiblingGrants(
    queryRunner: QueryRunner,
    fromKey: string,
    toKey: string,
  ): Promise<void> {
    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT gp."groupId", dest."id", gp."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = $1
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = gp."actionId"
       ON CONFLICT DO NOTHING`,
      [fromKey, toKey],
    );

    await queryRunner.query(
      `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
       SELECT rp."roleId", dest."id", rp."actionId"
       FROM "rbac_role_permissions" rp
       JOIN "rbac_pages" src ON src.id = rp."pageId" AND src.key = $1
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = rp."actionId"
       ON CONFLICT DO NOTHING`,
      [fromKey, toKey],
    );

    await queryRunner.query(
      `INSERT INTO "rbac_user_permission_overrides"
         ("id", "userId", "pageId", "actionId", "effect", "createdAt")
       SELECT gen_random_uuid(), o."userId", dest."id", o."actionId", o.effect, now()
       FROM "rbac_user_permission_overrides" o
       JOIN "rbac_pages" src ON src.id = o."pageId" AND src.key = $1
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = o."actionId"
       ON CONFLICT ("userId", "pageId", "actionId") DO NOTHING`,
      [fromKey, toKey],
    );
  }

  public async down(): Promise<void> {
    // Additive only — do not drop pages or revoke copied grants.
  }
}
