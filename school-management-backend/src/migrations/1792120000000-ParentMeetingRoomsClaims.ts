import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Parents (and students) can open /my-meeting-rooms and join invites.
 * Static persona packs were seeded without these chat/meeting pages.
 */
export class ParentMeetingRoomsClaims1792120000000 implements MigrationInterface {
  name = 'ParentMeetingRoomsClaims1792120000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await this.grantPersonaPages(queryRunner, 'parent', [
      { pageKey: 'my_meeting_rooms', actions: ['view'] },
      { pageKey: 'chat', actions: ['view', 'create'] },
      { pageKey: 'messages', actions: ['view', 'create'] },
    ]);
    await this.grantPersonaPages(queryRunner, 'student', [
      { pageKey: 'my_meeting_rooms', actions: ['view'] },
      { pageKey: 'chat', actions: ['view', 'create'] },
      { pageKey: 'messages', actions: ['view', 'create'] },
    ]);
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Keep grants; removing could lock parents out of chat again.
  }

  private async grantPersonaPages(
    queryRunner: QueryRunner,
    systemKey: 'parent' | 'student',
    pages: Array<{ pageKey: string; actions: string[] }>,
  ): Promise<void> {
    const groups: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_groups" WHERE "systemKey" = $1 LIMIT 1`,
      [systemKey],
    );
    const gid = groups[0]?.id;
    if (!gid) return;

    const roles: { id: string }[] = await queryRunner.query(
      `SELECT id FROM "rbac_roles" WHERE "systemKey" = $1 LIMIT 1`,
      [`role_${systemKey}`],
    );
    let rid = roles[0]?.id;
    if (!rid) {
      const linked: { roleId: string }[] = await queryRunner.query(
        `SELECT "roleId" FROM "rbac_user_group_roles" WHERE "groupId" = $1 LIMIT 1`,
        [gid],
      );
      rid = linked[0]?.roleId;
    }
    if (!rid) return;

    for (const { pageKey, actions } of pages) {
      const pagesRows: { id: number }[] = await queryRunner.query(
        `SELECT id FROM "rbac_pages" WHERE key = $1 LIMIT 1`,
        [pageKey],
      );
      const pageId = pagesRows[0]?.id;
      if (!pageId) continue;

      for (const code of actions) {
        const acts: { id: number }[] = await queryRunner.query(
          `SELECT a.id FROM "rbac_actions" a
           INNER JOIN "rbac_page_actions" pa ON pa."actionId" = a.id
           WHERE pa."pageId" = $1 AND a.code = $2
           LIMIT 1`,
          [pageId, code],
        );
        const actionId = acts[0]?.id;
        if (!actionId) continue;

        await queryRunner.query(
          `INSERT INTO "rbac_group_permissions" ("groupId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [gid, pageId, actionId],
        );
        await queryRunner.query(
          `INSERT INTO "rbac_role_permissions" ("roleId", "pageId", "actionId")
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [rid, pageId, actionId],
        );
      }
    }
  }
}
