import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Idempotent fix: production DBs may pre-date AlignActivitiesTableWithEntity
 * or never ran it, causing "column Activity.group_id does not exist".
 */
export class EnsureActivitiesGroupId1780300000000 implements MigrationInterface {
  name = 'EnsureActivitiesGroupId1780300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const exists: Array<{ exists: boolean }> = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'activities'
      ) AS exists
    `);
    if (!exists[0]?.exists) {
      return;
    }

    await queryRunner.query(`
      ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "group_id" uuid
    `);

    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'FK_activities_group') THEN
          ALTER TABLE "activities"
            ADD CONSTRAINT "FK_activities_group"
            FOREIGN KEY ("group_id") REFERENCES "groups"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION;
        END IF;
      END
      $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP CONSTRAINT IF EXISTS "FK_activities_group"`,
    );
    await queryRunner.query(
      `ALTER TABLE IF EXISTS "activities" DROP COLUMN IF EXISTS "group_id"`,
    );
  }
}
