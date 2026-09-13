import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';
import { RBAC_ACTION_SEED, RBAC_PAGE_SEED } from '../rbac/rbac-catalog.seed';

/**
 * Re-seed RBAC catalog + system groups when tables exist but were emptied
 * after the original CreateRbacTables migration already ran.
 */
export class ReseedRbacCatalogIfEmpty1785900000000 implements MigrationInterface {
  name = 'ReseedRbacCatalogIfEmpty1785900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const pages: { count: string }[] = await queryRunner.query(
      `SELECT COUNT(*)::text AS count FROM "rbac_pages"`,
    );
    if (Number(pages[0]?.count || 0) > 0) {
      // Still ensure school_admin_template exists even if pages are present
      await this.ensureSystemGroups(queryRunner);
      return;
    }

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
           "sortOrder" = EXCLUDED."sortOrder",
           "isActive" = true`,
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

    await this.ensureSystemGroups(queryRunner);
  }

  private async ensureSystemGroups(queryRunner: QueryRunner): Promise<void> {
    const defs: Array<{
      systemKey: string;
      name: string;
      code: string;
      groupType: string;
      description: string;
      color: string;
    }> = [
      {
        systemKey: 'super_admin',
        name: 'Super Admin',
        code: 'super_admin',
        groupType: 'system',
        description: 'Full platform access',
        color: '#7c3aed',
      },
      {
        systemKey: 'school_manager',
        name: 'School Manager',
        code: 'school_manager',
        groupType: 'system',
        description: 'Manage schools and subscriptions',
        color: '#2563eb',
      },
      {
        systemKey: 'payment_manager',
        name: 'Payment Manager',
        code: 'payment_manager',
        groupType: 'system',
        description: 'Manage platform and school payment configs',
        color: '#059669',
      },
      {
        systemKey: 'school_admin_template',
        name: 'School Admin (template)',
        code: 'school_admin_template',
        groupType: 'staff',
        description: 'Default full school admin; clone per school',
        color: '#0f766e',
      },
      {
        systemKey: 'teacher_template',
        name: 'Teacher (template)',
        code: 'teacher_template',
        groupType: 'staff',
        description: 'Default teacher access; clone per school',
        color: '#059669',
      },
    ];

    for (const def of defs) {
      const existing: { id: string }[] = await queryRunner.query(
        `SELECT id FROM "rbac_groups" WHERE "systemKey" = $1`,
        [def.systemKey],
      );
      if (!existing.length) {
        await queryRunner.query(
          `INSERT INTO "rbac_groups"
            ("id", "name", "code", "groupType", "description", "schoolId", "isSystem", "systemKey", "color", "isActive")
           VALUES ($1, $2, $3, $4, $5, NULL, true, $6, $7, true)`,
          [
            randomUUID(),
            def.name,
            def.code,
            def.groupType,
            def.description,
            def.systemKey,
            def.color,
          ],
        );
      }
    }

    const groups: { id: string; systemKey: string }[] = await queryRunner.query(
      `SELECT id, "systemKey" FROM "rbac_groups" WHERE "systemKey" IS NOT NULL`,
    );
    const groupId = (key: string) => groups.find((g) => g.systemKey === key)?.id;

    const pageActions: {
      page_id: number;
      action_id: number;
      page_key: string;
      action_code: string;
      scope: string;
    }[] = await queryRunner.query(`
      SELECT p.id AS page_id, a.id AS action_id, p.key AS page_key, a.code AS action_code, p.scope
      FROM "rbac_page_actions" pa
      JOIN "rbac_pages" p ON p.id = pa."pageId"
      JOIN "rbac_actions" a ON a.id = pa."actionId"
    `);

    const teacherPages = new Set([
      'dashboard',
      'mobile_dashboard',
      'groups',
      'students',
      'courses',
      'course_enrollments',
      'graded_courses',
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
    ]);

    const grant = async (
      systemKey: string,
      filter: (scope: string, key: string, code: string) => boolean,
    ) => {
      const gid = groupId(systemKey);
      if (!gid) return;
      for (const row of pageActions) {
        if (!filter(row.scope, row.page_key, row.action_code)) continue;
        await queryRunner.query(
          `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [gid, row.page_id, row.action_id],
        );
      }
    };

    await grant('super_admin', () => true);
    await grant(
      'school_manager',
      (scope, key) => scope === 'platform' || key.startsWith('platform_'),
    );
    await grant(
      'payment_manager',
      (_s, key) =>
        key.includes('payment') || key === 'platform_payments' || key === 'student_payments',
    );
    await grant('school_admin_template', (scope) => scope === 'school' || scope === 'both');
    await grant(
      'teacher_template',
      (_s, key, code) => teacherPages.has(key) && code !== 'manage',
    );
  }

  public async down(): Promise<void> {
    // no-op: do not wipe catalog
  }
}
