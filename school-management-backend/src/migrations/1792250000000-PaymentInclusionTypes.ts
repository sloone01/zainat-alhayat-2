import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * Included items catalog (uniform, books, …) attached to fee packages.
 * Display-only — does not change charge-sheet due.
 */
export class PaymentInclusionTypes1792250000000 implements MigrationInterface {
  name = 'PaymentInclusionTypes1792250000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_inclusion_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "label" character varying(255) NOT NULL,
        "value" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_inclusion_types" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_inclusion_types_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_payment_inclusion_types_school_code" UNIQUE ("school_id", "code")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_inclusion_types_school"
      ON "payment_inclusion_types" ("school_id", "is_active")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_inclusion_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "inclusion_type_id" uuid NOT NULL,
        CONSTRAINT "PK_fee_package_inclusion_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_inclusion_types" UNIQUE ("package_id", "inclusion_type_id"),
        CONSTRAINT "FK_fpit_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpit_inclusion_type" FOREIGN KEY ("inclusion_type_id") REFERENCES "payment_inclusion_types"("id") ON DELETE RESTRICT
      )
    `);

    const pages = RBAC_PAGE_SEED.filter((p) => p.key === 'payment_catalog_inclusions');
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
      ['payment_catalog_inclusions'],
    );
    const pageId = pageRows[0]?.id;
    const inclusionsPage = pages[0];
    if (pageId && inclusionsPage) {
      for (const code of inclusionsPage.actions) {
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
      SET "page_keys" = "page_keys" || '["payment_catalog_inclusions"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'student_fees'
        AND NOT ("page_keys" @> '["payment_catalog_inclusions"]'::jsonb)
    `);

    const siblingKeys = [
      'payment_catalog_extras',
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
      [siblingKeys, 'payment_catalog_inclusions'],
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
      [siblingKeys, 'payment_catalog_inclusions'],
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
      ['payment_catalog_inclusions'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_inclusion_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_inclusion_types"`);
  }
}
