import { MigrationInterface, QueryRunner } from 'typeorm';

export class GroupSupervisorId1792140000000 implements MigrationInterface {
  name = 'GroupSupervisorId1792140000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "groups"
        ADD COLUMN IF NOT EXISTS "supervisor_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "groups"
          ADD CONSTRAINT "FK_groups_supervisor_user"
          FOREIGN KEY ("supervisor_id") REFERENCES "users"("id")
          ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_groups_supervisor_id"
        ON "groups" ("supervisor_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_groups_supervisor_id"`);
    await queryRunner.query(`
      ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "FK_groups_supervisor_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "groups" DROP COLUMN IF EXISTS "supervisor_id"
    `);
  }
}
