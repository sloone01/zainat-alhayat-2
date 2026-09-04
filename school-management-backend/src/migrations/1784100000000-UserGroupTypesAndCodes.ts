import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * - rbac_groups.groupType: system | staff | parent | student
 * - rbac_groups.code / rbac_roles.code (stable practical codes)
 * - Seed teacher_template staff group + role
 * - Ensure per-school Teacher groups for existing schools
 */
export class UserGroupTypesAndCodes1784100000000 implements MigrationInterface {
  name = 'UserGroupTypesAndCodes1784100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "rbac_group_type_enum" AS ENUM ('system', 'staff', 'parent', 'student');
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);

    await queryRunner.query(`
      ALTER TABLE "rbac_groups"
      ADD COLUMN IF NOT EXISTS "groupType" "rbac_group_type_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "rbac_groups"
      ADD COLUMN IF NOT EXISTS "code" varchar(64)
    `);
    await queryRunner.query(`
      ALTER TABLE "rbac_roles"
      ADD COLUMN IF NOT EXISTS "code" varchar(64)
    `);

    await queryRunner.query(`
      UPDATE "rbac_groups" SET "groupType" = CASE
        WHEN "systemKey" = 'student' THEN 'student'::"rbac_group_type_enum"
        WHEN "systemKey" = 'parent' THEN 'parent'::"rbac_group_type_enum"
        WHEN "systemKey" IN ('super_admin', 'school_manager', 'payment_manager')
          THEN 'system'::"rbac_group_type_enum"
        ELSE 'staff'::"rbac_group_type_enum"
      END
      WHERE "groupType" IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "rbac_groups"
      ALTER COLUMN "groupType" SET DEFAULT 'staff'::"rbac_group_type_enum"
    `);
    await queryRunner.query(`
      ALTER TABLE "rbac_groups"
      ALTER COLUMN "groupType" SET NOT NULL
    `);

    // Codes from systemKey or slug(name); non-Latin names fall back to id fragment
    await queryRunner.query(`
      UPDATE "rbac_groups" SET "code" = NULLIF(
        COALESCE(
          "systemKey",
          NULLIF(lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '_', 'g')), ''),
          'group_' || substr(replace(id::text, '-', ''), 1, 12)
        ),
        ''
      )
      WHERE "code" IS NULL OR "code" = ''
    `);
    await queryRunner.query(`
      UPDATE "rbac_roles" SET "code" = NULLIF(
        COALESCE(
          "systemKey",
          NULLIF(lower(regexp_replace(trim(name), '[^a-zA-Z0-9]+', '_', 'g')), ''),
          'role_' || substr(replace(id::text, '-', ''), 1, 12)
        ),
        ''
      )
      WHERE "code" IS NULL OR "code" = ''
    `);

    // Deduplicate codes within school scope before unique index
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE("schoolId", 0), "code" ORDER BY "createdAt"
          ) AS rn
        FROM "rbac_groups"
      )
      UPDATE "rbac_groups" g
      SET "code" = g."code" || '_' || substr(replace(g.id::text, '-', ''), 1, 6)
      FROM ranked r
      WHERE g.id = r.id AND r.rn > 1
    `);
    await queryRunner.query(`
      WITH ranked AS (
        SELECT id,
          ROW_NUMBER() OVER (
            PARTITION BY COALESCE("schoolId", 0), "code" ORDER BY "createdAt"
          ) AS rn
        FROM "rbac_roles"
      )
      UPDATE "rbac_roles" g
      SET "code" = g."code" || '_' || substr(replace(g.id::text, '-', ''), 1, 6)
      FROM ranked r
      WHERE g.id = r.id AND r.rn > 1
    `);

    await queryRunner.query(`
      ALTER TABLE "rbac_groups" ALTER COLUMN "code" SET NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "rbac_roles" ALTER COLUMN "code" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_rbac_groups_school_code"
      ON "rbac_groups" (COALESCE("schoolId", 0), "code")
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_rbac_roles_school_code"
      ON "rbac_roles" (COALESCE("schoolId", 0), "code")
    `);

    // Seed teacher template (platform staff)
    const teacherGroupId = randomUUID();
    const teacherRoleId = randomUUID();
    await queryRunner.query(
      `INSERT INTO "rbac_groups" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color", "groupType", "code")
       VALUES ($1, 'Teacher (template)', 'Default teacher claim pack; cloned per school', NULL, true, 'teacher_template', '#059669', 'staff', 'teacher_template')
       ON CONFLICT ("systemKey") DO NOTHING`,
      [teacherGroupId],
    );
    await queryRunner.query(
      `INSERT INTO "rbac_roles" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "isActive", "code")
       VALUES ($1, 'Teacher Role', 'Default teacher claims', NULL, true, 'role_teacher_template', true, 'role_teacher_template')
       ON CONFLICT ("systemKey") DO NOTHING`,
      [teacherRoleId],
    );

    const groups: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_groups" WHERE "systemKey" = 'teacher_template'`,
    );
    const roles: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_roles" WHERE "systemKey" = 'role_teacher_template'`,
    );
    const gid = groups[0]?.id;
    const rid = roles[0]?.id;
    if (gid && rid) {
      await queryRunner.query(
        `INSERT INTO "rbac_user_group_roles" ("groupId", "roleId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [gid, rid],
      );

      const teacherPages = [
        'dashboard',
        'groups',
        'students',
        'schedules',
        'attendance',
        'attendance_sessions',
        'progress',
        'activities',
        'chat',
        'messages',
        'weekly_session_plans',
        'teacher_weekly_sessions',
        'teacher_schedule',
        'teacher_graded_tasks',
        'teacher_graded_marks',
        'my_meeting_rooms',
      ];
      for (const pageKey of teacherPages) {
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
          // Teachers: no delete/manage on most pages; keep allowed catalog actions except manage
          if (a.code === 'manage') continue;
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
    }

    // Mark school_admin_template code/type
    await queryRunner.query(`
      UPDATE "rbac_groups"
      SET "groupType" = 'staff', "code" = 'school_admin_template'
      WHERE "systemKey" = 'school_admin_template'
    `);

    // Clone Teacher for each school that has School Admin but no Teacher
    const schools: { id: number }[] = await queryRunner.query(`SELECT id FROM "schools"`);
    const templateId = gid;
    if (templateId) {
      const templatePerms: { pageId: number; actionId: number }[] = await queryRunner.query(
        `SELECT "pageId", "actionId" FROM "rbac_group_permissions" WHERE "groupId" = $1`,
        [templateId],
      );
      for (const school of schools) {
        const existing: { id: string }[] = await queryRunner.query(
          `SELECT id FROM "rbac_groups" WHERE "schoolId" = $1 AND "code" = 'teacher'`,
          [school.id],
        );
        if (existing.length) continue;

        const cloneId = randomUUID();
        const cloneRoleId = randomUUID();
        await queryRunner.query(
          `INSERT INTO "rbac_groups" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color", "clonedFromId", "groupType", "code")
           VALUES ($1, 'Teacher', 'School teacher access', $2, false, NULL, '#059669', $3, 'staff', 'teacher')`,
          [cloneId, school.id, templateId],
        );
        await queryRunner.query(
          `INSERT INTO "rbac_roles" ("id", "name", "description", "schoolId", "isSystem", "systemKey", "isActive", "code")
           VALUES ($1, 'Teacher Role', 'School teacher claims', $2, false, NULL, true, 'teacher')`,
          [cloneRoleId, school.id],
        );
        await queryRunner.query(
          `INSERT INTO "rbac_user_group_roles" ("groupId", "roleId") VALUES ($1, $2) ON CONFLICT DO NOTHING`,
          [cloneId, cloneRoleId],
        );
        for (const perm of templatePerms) {
          await queryRunner.query(
            `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [cloneId, perm.pageId, perm.actionId],
          );
          await queryRunner.query(
            `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
             VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
            [cloneRoleId, perm.pageId, perm.actionId],
          );
        }
      }

      // Ensure School Admin school groups have code school_admin
      await queryRunner.query(`
        UPDATE "rbac_groups"
        SET "code" = 'school_admin', "groupType" = 'staff'
        WHERE "schoolId" IS NOT NULL AND name = 'School Admin'
          AND ("code" IS NULL OR "code" LIKE 'school_admin%' OR "code" = 'school_admin_template'
               OR "clonedFromId" IS NOT NULL)
      `);
      await queryRunner.query(`
        UPDATE "rbac_groups"
        SET "code" = 'school_admin', "groupType" = 'staff'
        WHERE "schoolId" IS NOT NULL AND name = 'School Admin'
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_rbac_groups_school_code"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_rbac_roles_school_code"`);
    await queryRunner.query(
      `DELETE FROM "rbac_groups" WHERE "systemKey" = 'teacher_template' OR ("code" = 'teacher' AND "schoolId" IS NOT NULL)`,
    );
    await queryRunner.query(
      `DELETE FROM "rbac_roles" WHERE "systemKey" = 'role_teacher_template' OR ("code" = 'teacher' AND "schoolId" IS NOT NULL)`,
    );
    await queryRunner.query(`ALTER TABLE "rbac_groups" DROP COLUMN IF EXISTS "code"`);
    await queryRunner.query(`ALTER TABLE "rbac_groups" DROP COLUMN IF EXISTS "groupType"`);
    await queryRunner.query(`ALTER TABLE "rbac_roles" DROP COLUMN IF EXISTS "code"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "rbac_group_type_enum"`);
  }
}
