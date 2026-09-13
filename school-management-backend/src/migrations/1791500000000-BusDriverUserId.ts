import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusDriverUserId1791500000000 implements MigrationInterface {
  name = 'BusDriverUserId1791500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buses"
        ADD COLUMN IF NOT EXISTS "driver_user_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "buses"
          ADD CONSTRAINT "FK_buses_driver_user"
          FOREIGN KEY ("driver_user_id") REFERENCES "users"("id")
          ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_buses_driver_user_id"
        ON "buses" ("driver_user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_buses_driver_user_id"`);
    await queryRunner.query(`
      ALTER TABLE "buses" DROP CONSTRAINT IF EXISTS "FK_buses_driver_user"
    `);
    await queryRunner.query(`
      ALTER TABLE "buses" DROP COLUMN IF EXISTS "driver_user_id"
    `);
  }
}
