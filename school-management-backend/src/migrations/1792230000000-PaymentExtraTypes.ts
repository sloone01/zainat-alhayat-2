import { MigrationInterface, QueryRunner } from 'typeorm';
import { RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * Extra items catalog (like discounts), package links, and charge-sheet extra lines.
 * Also registers payment_catalog_extras and copies grants from discount items.
 */
export class PaymentExtraTypes1792230000000 implements MigrationInterface {
  name = 'PaymentExtraTypes1792230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_extra_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "code" character varying(64) NOT NULL,
        "label" character varying(255) NOT NULL,
        "value" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_extra_types" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_extra_types_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_payment_extra_types_school_code" UNIQUE ("school_id", "code")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_extra_types_school"
      ON "payment_extra_types" ("school_id", "is_active")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_extra_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "extra_type_id" uuid NOT NULL,
        CONSTRAINT "PK_fee_package_extra_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_extra_types" UNIQUE ("package_id", "extra_type_id"),
        CONSTRAINT "FK_fpet_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpet_extra_type" FOREIGN KEY ("extra_type_id") REFERENCES "payment_extra_types"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheet_extra_lines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sheet_id" uuid NOT NULL,
        "extra_type_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL DEFAULT 0,
        "remarks" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_charge_sheet_extra_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_scsel_sheet" FOREIGN KEY ("sheet_id") REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_scsel_extra_type" FOREIGN KEY ("extra_type_id") REFERENCES "payment_extra_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_scsel_sheet_id" ON "student_charge_sheet_extra_lines" ("sheet_id")`,
    );

    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets"
      ADD COLUMN IF NOT EXISTS "extra_total" decimal(12,2) NOT NULL DEFAULT 0
    `);

    const pages = RBAC_PAGE_SEED.filter((p) => p.key === 'payment_catalog_extras');
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
      ['payment_catalog_extras'],
    );
    const pageId = pageRows[0]?.id;
    const extrasPage = pages[0];
    if (pageId && extrasPage) {
      for (const code of extrasPage.actions) {
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
      SET "page_keys" = "page_keys" || '["payment_catalog_extras"]'::jsonb,
          "updated_at" = now()
      WHERE code = 'student_fees'
        AND NOT ("page_keys" @> '["payment_catalog_extras"]'::jsonb)
    `);

    await queryRunner.query(
      `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
       SELECT gp."groupId", dest."id", gp."actionId"
       FROM "rbac_group_permissions" gp
       JOIN "rbac_pages" src ON src.id = gp."pageId" AND src.key = $1
       JOIN "rbac_pages" dest ON dest.key = $2
       JOIN "rbac_page_actions" pa
         ON pa."pageId" = dest.id AND pa."actionId" = gp."actionId"
       ON CONFLICT DO NOTHING`,
      ['payment_catalog_discounts', 'payment_catalog_extras'],
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
      ['payment_catalog_discounts', 'payment_catalog_extras'],
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
      ['payment_catalog_discounts', 'payment_catalog_extras'],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_charge_sheets" DROP COLUMN IF EXISTS "extra_total"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheet_extra_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_extra_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_extra_types"`);
  }
}
