import { MigrationInterface, QueryRunner } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { RBAC_ACTION_SEED, RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

export class CreateRbacTables1783400000000 implements MigrationInterface {
  name = 'CreateRbacTables1783400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "is_system_user" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "is_super_admin" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_actions" (
        "id" SERIAL PRIMARY KEY,
        "code" varchar(32) NOT NULL UNIQUE,
        "name" varchar(100) NOT NULL,
        "sortOrder" int NOT NULL DEFAULT 0
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_pages" (
        "id" SERIAL PRIMARY KEY,
        "key" varchar(64) NOT NULL UNIQUE,
        "route" varchar(255) NOT NULL,
        "nameEn" varchar(120) NOT NULL,
        "nameAr" varchar(120) NOT NULL,
        "scope" varchar(16) NOT NULL DEFAULT 'school',
        "sortOrder" int NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_page_actions" (
        "pageId" int NOT NULL REFERENCES "rbac_pages"("id") ON DELETE CASCADE,
        "actionId" int NOT NULL REFERENCES "rbac_actions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("pageId", "actionId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_groups" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" varchar(120) NOT NULL,
        "description" text NULL,
        "schoolId" int NULL REFERENCES "schools"("id") ON DELETE CASCADE,
        "isSystem" boolean NOT NULL DEFAULT false,
        "systemKey" varchar(64) NULL UNIQUE,
        "color" varchar(32) NULL,
        "clonedFromId" uuid NULL REFERENCES "rbac_groups"("id") ON DELETE SET NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_rbac_groups_school"
      ON "rbac_groups" ("schoolId")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_group_permissions" (
        "groupId" uuid NOT NULL REFERENCES "rbac_groups"("id") ON DELETE CASCADE,
        "pageId" int NOT NULL REFERENCES "rbac_pages"("id") ON DELETE CASCADE,
        "actionId" int NOT NULL REFERENCES "rbac_actions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("groupId", "pageId", "actionId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_user_group_members" (
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "groupId" uuid NOT NULL REFERENCES "rbac_groups"("id") ON DELETE CASCADE,
        "assignedAt" TIMESTAMP NOT NULL DEFAULT now(),
        PRIMARY KEY ("userId", "groupId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_user_permission_overrides" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
        "pageId" int NOT NULL REFERENCES "rbac_pages"("id") ON DELETE CASCADE,
        "actionId" int NOT NULL REFERENCES "rbac_actions"("id") ON DELETE CASCADE,
        "effect" varchar(8) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_rbac_user_override" UNIQUE ("userId", "pageId", "actionId"),
        CONSTRAINT "CHK_rbac_override_effect" CHECK ("effect" IN ('grant', 'deny'))
      )
    `);

    // Seed actions
    for (const a of RBAC_ACTION_SEED) {
      await queryRunner.query(
        `INSERT INTO "rbac_actions" ("code", "name", "sortOrder")
         VALUES ($1, $2, $3)
         ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "sortOrder" = EXCLUDED."sortOrder"`,
        [a.code, a.name, a.sortOrder],
      );
    }

    const actionRows: { id: number; code: string }[] = await queryRunner.query(
      `SELECT id, code FROM "rbac_actions"`,
    );
    const actionIdByCode = new Map(actionRows.map((r) => [r.code, r.id]));

    for (const p of RBAC_PAGE_SEED) {
      await queryRunner.query(
        `INSERT INTO "rbac_pages" ("key", "route", "nameEn", "nameAr", "scope", "sortOrder", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT ("key") DO UPDATE SET
           "route" = EXCLUDED."route",
           "nameEn" = EXCLUDED."nameEn",
           "nameAr" = EXCLUDED."nameAr",
           "scope" = EXCLUDED."scope",
           "sortOrder" = EXCLUDED."sortOrder"`,
        [p.key, p.route, p.nameEn, p.nameAr, p.scope, p.sortOrder],
      );
    }

    const pageRows: { id: number; key: string }[] = await queryRunner.query(
      `SELECT id, key FROM "rbac_pages"`,
    );
    const pageIdByKey = new Map(pageRows.map((r) => [r.key, r.id]));

    for (const p of RBAC_PAGE_SEED) {
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

    // System groups
    const superAdminGroupId = randomUUID();
    const schoolManagerGroupId = randomUUID();
    const paymentManagerGroupId = randomUUID();
    const schoolAdminTemplateId = randomUUID();

    await queryRunner.query(
      `INSERT INTO "rbac_groups" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color")
       VALUES
         ($1, 'Super Admin', 'Full platform access', NULL, true, 'super_admin', '#7c3aed'),
         ($2, 'School Manager', 'Manage schools and subscriptions', NULL, true, 'school_manager', '#2563eb'),
         ($3, 'Payment Manager', 'Manage platform and school payment configs', NULL, true, 'payment_manager', '#059669'),
         ($4, 'School Admin (template)', 'Default full school admin; clone per school', NULL, true, 'school_admin_template', '#0f766e')
       ON CONFLICT ("systemKey") DO NOTHING`,
      [superAdminGroupId, schoolManagerGroupId, paymentManagerGroupId, schoolAdminTemplateId],
    );

    const groups: { id: string; systemKey: string }[] = await queryRunner.query(
      `SELECT id, "systemKey" FROM "rbac_groups" WHERE "systemKey" IS NOT NULL`,
    );
    const groupId = (key: string) => groups.find((g) => g.systemKey === key)?.id;

    const grantAllPageActions = async (gid: string, pageFilter?: (scope: string, key: string) => boolean) => {
      for (const p of RBAC_PAGE_SEED) {
        if (pageFilter && !pageFilter(p.scope, p.key)) continue;
        const pid = pageIdByKey.get(p.key);
        if (!pid) continue;
        for (const code of p.actions) {
          const aid = actionIdByCode.get(code);
          if (!aid) continue;
          await queryRunner.query(
            `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [gid, pid, aid],
          );
        }
      }
    };

    const sa = groupId('super_admin');
    if (sa) await grantAllPageActions(sa);

    const sm = groupId('school_manager');
    if (sm) {
      await grantAllPageActions(sm, (scope, key) =>
        scope === 'platform' || key.startsWith('platform_'),
      );
    }

    const pm = groupId('payment_manager');
    if (pm) {
      await grantAllPageActions(pm, (_s, key) =>
        key.includes('payment') || key === 'platform_payments' || key === 'student_payments',
      );
    }

    const sat = groupId('school_admin_template');
    if (sat) {
      await grantAllPageActions(sat, (scope) => scope === 'school' || scope === 'both');
    }

    // Super admin user
    const email = 'superadmin@zinat.platform';
    const existing = await queryRunner.query(`SELECT id FROM "users" WHERE email = $1`, [email]);
    let userId: string;
    if (existing?.length) {
      userId = existing[0].id;
      await queryRunner.query(
        `UPDATE "users" SET
           "is_system_user" = true,
           "is_super_admin" = true,
           "school_id" = NULL,
           "role" = 'admin',
           "isActive" = true
         WHERE id = $1`,
        [userId],
      );
    } else {
      userId = randomUUID();
      const hash = await bcrypt.hash('SuperAdmin123!', 10);
      await queryRunner.query(
        `INSERT INTO "users" (
           id, username, email, password, "firstName", "lastName",
           role, "isActive", "school_id", "is_system_user", "is_super_admin",
           "createdAt", "updatedAt"
         ) VALUES (
           $1, 'superadmin', $2, $3, 'Super', 'Admin',
           'admin', true, NULL, true, true, now(), now()
         )`,
        [userId, email, hash],
      );
    }

    if (sa) {
      await queryRunner.query(
        `INSERT INTO "rbac_user_group_members" ("userId", "groupId")
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [userId, sa],
      );
    }

    // Clone school admin template for each school and assign existing admin users
    const schools: { id: number }[] = await queryRunner.query(`SELECT id FROM "schools"`);
    const templateId = groupId('school_admin_template');
    if (templateId) {
      const templatePerms: { pageId: number; actionId: number }[] = await queryRunner.query(
        `SELECT "pageId", "actionId" FROM "rbac_group_permissions" WHERE "groupId" = $1`,
        [templateId],
      );

      for (const school of schools) {
        const cloneId = randomUUID();
        await queryRunner.query(
          `INSERT INTO "rbac_groups" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color", "clonedFromId")
           VALUES ($1, 'School Admin', 'Full school access', $2, false, NULL, '#0f766e', $3)`,
          [cloneId, school.id, templateId],
        );
        for (const perm of templatePerms) {
          await queryRunner.query(
            `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [cloneId, perm.pageId, perm.actionId],
          );
        }
        const admins: { id: string }[] = await queryRunner.query(
          `SELECT id FROM "users" WHERE role = 'admin' AND school_id = $1 AND COALESCE("is_super_admin", false) = false`,
          [school.id],
        );
        for (const admin of admins) {
          await queryRunner.query(
            `INSERT INTO "rbac_user_group_members" ("userId", "groupId")
             VALUES ($1, $2) ON CONFLICT DO NOTHING`,
            [admin.id, cloneId],
          );
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_user_permission_overrides"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_user_group_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_group_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_page_actions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_pages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_actions"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_super_admin"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "is_system_user"`);
  }
}
