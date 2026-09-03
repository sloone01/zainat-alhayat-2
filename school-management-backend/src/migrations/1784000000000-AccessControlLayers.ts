import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * Access-control layers:
 * - school_modules (entitlements from plan)
 * - users.user_type (staff | parent | student | platform)
 * - rbac_roles + role permissions + user_group ↔ role
 * - migrate group permissions → roles
 * - seed static student/parent system groups + roles
 * - backfill school_modules from subscriptions
 */
export class AccessControlLayers1784000000000 implements MigrationInterface {
  name = 'AccessControlLayers1784000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
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
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_school_modules_school" ON "school_modules" ("school_id")`,
    );

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "users_user_type_enum" AS ENUM ('staff', 'parent', 'student', 'platform');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD COLUMN IF NOT EXISTS "user_type" "users_user_type_enum"
    `);
    await queryRunner.query(`
      UPDATE "users" SET "user_type" = CASE
        WHEN COALESCE("is_super_admin", false) = true OR COALESCE("is_system_user", false) = true THEN 'platform'::"users_user_type_enum"
        WHEN role = 'parent' THEN 'parent'::"users_user_type_enum"
        WHEN role = 'student' THEN 'student'::"users_user_type_enum"
        ELSE 'staff'::"users_user_type_enum"
      END
      WHERE "user_type" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "user_type" SET DEFAULT 'student'::"users_user_type_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "user_type" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_roles" (
        "id" uuid PRIMARY KEY,
        "name" varchar(120) NOT NULL,
        "description" text NULL,
        "schoolId" int NULL REFERENCES "schools"("id") ON DELETE CASCADE,
        "isSystem" boolean NOT NULL DEFAULT false,
        "systemKey" varchar(64) NULL UNIQUE,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now()
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_role_permissions" (
        "roleId" uuid NOT NULL REFERENCES "rbac_roles"("id") ON DELETE CASCADE,
        "pageId" int NOT NULL REFERENCES "rbac_pages"("id") ON DELETE CASCADE,
        "actionId" int NOT NULL REFERENCES "rbac_actions"("id") ON DELETE CASCADE,
        PRIMARY KEY ("roleId", "pageId", "actionId")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "rbac_user_group_roles" (
        "groupId" uuid NOT NULL REFERENCES "rbac_groups"("id") ON DELETE CASCADE,
        "roleId" uuid NOT NULL REFERENCES "rbac_roles"("id") ON DELETE CASCADE,
        "assignedAt" TIMESTAMP NOT NULL DEFAULT now(),
        PRIMARY KEY ("groupId", "roleId")
      )
    `);

    // Migrate each group's permissions into a dedicated role and link it.
    const groups: { id: string; name: string; schoolId: number | null; systemKey: string | null }[] =
      await queryRunner.query(
        `SELECT id, name, "schoolId", "systemKey" FROM "rbac_groups"`,
      );

    for (const g of groups) {
      const roleId = randomUUID();
      const systemKey = g.systemKey ? `role_from_${g.systemKey}` : null;
      await queryRunner.query(
        `INSERT INTO "rbac_roles" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, true)
         ON CONFLICT DO NOTHING`,
        [
          roleId,
          `${g.name} Role`,
          `Claim pack for user group ${g.name}`,
          g.schoolId,
          !!g.systemKey,
          systemKey,
        ],
      );

      // If systemKey conflicted, fetch existing
      let finalRoleId: string = roleId;
      if (systemKey) {
        const existing: { id: string }[] = await queryRunner.query(
          `SELECT id FROM "rbac_roles" WHERE "systemKey" = $1`,
          [systemKey],
        );
        if (existing[0]?.id) finalRoleId = String(existing[0].id);
      }

      await queryRunner.query(
        `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
         SELECT $1, "pageId", "actionId" FROM "rbac_group_permissions" WHERE "groupId" = $2
         ON CONFLICT DO NOTHING`,
        [finalRoleId, g.id],
      );

      await queryRunner.query(
        `INSERT INTO "rbac_user_group_roles" ("groupId", "roleId")
         VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [g.id, finalRoleId],
      );
    }

    // Static student / parent system groups + roles
    await this.seedPersonaGroup(
      queryRunner,
      'student',
      'Student',
      'Static student portal access',
      ['dashboard'],
      ['view'],
    );
    await this.seedPersonaGroup(
      queryRunner,
      'parent',
      'Parent',
      'Static parent portal access',
      [
        'parent_dashboard',
        'parent_schedule',
        'parent_attendance',
        'parent_fees',
        'parent_progress',
        'parent_activities',
      ],
      null,
    );

    // Backfill school_modules from current subscriptions' plans
    await queryRunner.query(`
      INSERT INTO "school_modules" ("school_id", "module_id", "source", "is_active")
      SELECT s.school_id, pm.module_id, 'plan', true
      FROM school_platform_subscriptions s
      INNER JOIN platform_plan_modules pm ON pm.plan_id = s.plan_id
      ON CONFLICT ("school_id", "module_id") DO UPDATE
        SET is_active = true, source = 'plan', updated_at = now()
    `);
  }

  private async seedPersonaGroup(
    queryRunner: QueryRunner,
    systemKey: string,
    name: string,
    description: string,
    pageKeys: string[],
    onlyActions: string[] | null,
  ) {
    const groupId = randomUUID();
    const roleId = randomUUID();

    await queryRunner.query(
      `INSERT INTO "rbac_groups" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color")
       VALUES ($1, $2, $3, NULL, true, $4, $5)
       ON CONFLICT ("systemKey") DO NOTHING`,
      [groupId, name, description, systemKey, systemKey === 'student' ? '#64748b' : '#0ea5e9'],
    );

    const groups: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_groups" WHERE "systemKey" = $1`,
      [systemKey],
    );
    const gid = groups[0]?.id;
    if (!gid) return;

    await queryRunner.query(
      `INSERT INTO "rbac_roles" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "isActive")
       VALUES ($1, $2, $3, NULL, true, $4, true)
       ON CONFLICT ("systemKey") DO NOTHING`,
      [roleId, `${name} Role`, description, `role_${systemKey}`],
    );
    const roles: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_roles" WHERE "systemKey" = $1`,
      [`role_${systemKey}`],
    );
    const rid = roles[0]?.id;
    if (!rid) return;

    await queryRunner.query(
      `INSERT INTO "rbac_user_group_roles" ("groupId", "roleId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [gid, rid],
    );

    for (const pageKey of pageKeys) {
      const pages: { id: number }[] = await queryRunner.query(
        `SELECT id FROM "rbac_pages" WHERE key = $1`,
        [pageKey],
      );
      const pageId = pages[0]?.id;
      if (!pageId) continue;

      const actions: { id: number; code: string }[] = await queryRunner.query(
        `SELECT a.id, a.code FROM "rbac_actions" a
         INNER JOIN "rbac_page_actions" pa ON pa."actionId" = a.id
         WHERE pa."pageId" = $1`,
        [pageId],
      );
      for (const a of actions) {
        if (onlyActions && !onlyActions.includes(a.code)) continue;
        await queryRunner.query(
          `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [rid, pageId, a.id],
        );
        await queryRunner.query(
          `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [gid, pageId, a.id],
        );
      }
    }

    // Auto-assign existing users of this persona to the system group
    const roleFilter = systemKey === 'student' ? 'student' : 'parent';
    await queryRunner.query(
      `INSERT INTO "rbac_user_group_members" ("userId", "groupId")
       SELECT u.id, $1 FROM "users" u
       WHERE u.role = $2
         AND COALESCE(u."is_super_admin", false) = false
         AND COALESCE(u."is_system_user", false) = false
       ON CONFLICT DO NOTHING`,
      [gid, roleFilter],
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "rbac_user_group_members" WHERE "groupId" IN (
      SELECT id FROM "rbac_groups" WHERE "systemKey" IN ('student', 'parent')
    )`);
    await queryRunner.query(
      `DELETE FROM "rbac_groups" WHERE "systemKey" IN ('student', 'parent')`,
    );
    await queryRunner.query(
      `DELETE FROM "rbac_roles" WHERE "systemKey" IN ('role_student', 'role_parent')
        OR "systemKey" LIKE 'role_from_%'`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_user_group_roles"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_role_permissions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "rbac_roles"`);
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN IF EXISTS "user_type"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "users_user_type_enum"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_modules"`);
  }
}
