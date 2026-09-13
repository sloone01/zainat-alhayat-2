import { MigrationInterface, QueryRunner } from 'typeorm';
import { randomUUID } from 'crypto';

/**
 * Recreate static parent/student RBAC packs when missing, grant chat + meeting
 * claims, and assign existing parent/student users.
 */
export class EnsureParentStudentPersonaGroups1792130000000 implements MigrationInterface {
  name = 'EnsureParentStudentPersonaGroups1792130000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.ensurePersona(
      queryRunner,
      'parent',
      'Parent',
      'Static parent portal access',
      '#0ea5e9',
      [
        'parent_dashboard',
        'parent_schedule',
        'parent_attendance',
        'parent_fees',
        'parent_progress',
        'parent_activities',
        'chat',
        'messages',
        'my_meeting_rooms',
      ],
    );
    await this.ensurePersona(
      queryRunner,
      'student',
      'Student',
      'Static student portal access',
      '#64748b',
      ['dashboard', 'chat', 'messages', 'my_meeting_rooms'],
    );
  }

  public async down(): Promise<void> {
    // Keep persona packs.
  }

  private async ensurePersona(
    queryRunner: QueryRunner,
    systemKey: 'parent' | 'student',
    name: string,
    description: string,
    color: string,
    pageKeys: string[],
  ): Promise<void> {
    const groupId = randomUUID();
    const roleId = randomUUID();

    await queryRunner.query(
      `INSERT INTO "rbac_groups"
        ("id", "name", "description", "schoolId", "isSystem", "systemKey", "color", "groupType", "code", "isActive")
       VALUES ($1, $2, $3, NULL, true, $4, $5, $6::"rbac_group_type_enum", $4, true)
       ON CONFLICT ("systemKey") DO NOTHING`,
      [groupId, name, description, systemKey, color, systemKey],
    );

    const groups: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_groups" WHERE "systemKey" = $1 LIMIT 1`,
      [systemKey],
    );
    const gid = groups[0]?.id;
    if (!gid) return;

    await queryRunner.query(
      `UPDATE "rbac_groups"
       SET "groupType" = $2::"rbac_group_type_enum",
           "code" = COALESCE("code", $1),
           "isActive" = true
       WHERE id = $3`,
      [systemKey, systemKey, gid],
    );

    await queryRunner.query(
      `INSERT INTO "rbac_roles"
        ("id", "name", "description", "schoolId", "isSystem", "systemKey", "isActive", "code")
       VALUES ($1, $2, $3, NULL, true, $4, true, $4)
       ON CONFLICT ("systemKey") DO NOTHING`,
      [roleId, `${name} Role`, description, `role_${systemKey}`],
    );

    const roles: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_roles" WHERE "systemKey" = $1 LIMIT 1`,
      [`role_${systemKey}`],
    );
    const rid = roles[0]?.id;
    if (!rid) return;

    await queryRunner.query(
      `INSERT INTO "rbac_user_group_roles" ("groupId", "roleId")
       VALUES ($1, $2) ON CONFLICT DO NOTHING`,
      [gid, rid],
    );

    for (const pageKey of pageKeys) {
      const pages: { id: number }[] = await queryRunner.query(
        `SELECT id FROM "rbac_pages" WHERE key = $1 LIMIT 1`,
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
        // Parents/students: view (+ create on chat/messages where catalog allows).
        if (pageKey === 'my_meeting_rooms' && a.code !== 'view') continue;
        if (
          (pageKey === 'chat' || pageKey === 'messages') &&
          a.code !== 'view' &&
          a.code !== 'create'
        ) {
          continue;
        }
        if (
          pageKey.startsWith('parent_') &&
          a.code !== 'view' &&
          a.code !== 'create' &&
          a.code !== 'approve'
        ) {
          continue;
        }
        if (pageKey === 'dashboard' && a.code !== 'view') continue;

        await queryRunner.query(
          `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [gid, pageId, a.id],
        );
        await queryRunner.query(
          `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [rid, pageId, a.id],
        );
      }
    }

    const roleFilter = systemKey === 'student' ? 'student' : 'parent';
    await queryRunner.query(
      `INSERT INTO "rbac_user_group_members" ("userId", "groupId")
       SELECT u.id, $1 FROM "users" u
       WHERE (u.role::text = $2 OR u.user_type::text = $2)
         AND COALESCE(u."is_super_admin", false) = false
         AND COALESCE(u."is_system_user", false) = false
       ON CONFLICT DO NOTHING`,
      [gid, roleFilter],
    );
  }
}
