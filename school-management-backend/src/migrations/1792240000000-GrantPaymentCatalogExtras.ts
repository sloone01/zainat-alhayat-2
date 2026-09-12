import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Ensure extra-item grants exist for groups that already manage discounts, charges, or packages.
 * Also grant extras on School Admin groups so the catalog appears next to discount items.
 */
export class GrantPaymentCatalogExtras1792240000000 implements MigrationInterface {
  name = 'GrantPaymentCatalogExtras1792240000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "platform_modules"
      SET "page_keys" = "page_keys" || '["payment_catalog_extras"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'student_fees'
        AND NOT ("page_keys" @> '["payment_catalog_extras"]'::jsonb)
    `);

    const siblingKeys = [
      'payment_catalog_discounts',
      'payment_catalog_charges',
      'payment_packages',
    ];

    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT DISTINCT gp."groupId", dest."id", gp."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = ANY($1)
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = gp."actionId"
       ON CONFLICT DO NOTHING`,
      [siblingKeys, 'payment_catalog_extras'],
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
      [siblingKeys, 'payment_catalog_extras'],
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
      ['payment_catalog_extras'],
    );
  }

  public async down(): Promise<void> {
    // Grants are additive; leave extras permissions in place.
  }
}
