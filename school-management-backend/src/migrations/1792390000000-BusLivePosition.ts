import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusLivePosition1792390000000 implements MigrationInterface {
  name = 'BusLivePosition1792390000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buses"
        ADD COLUMN IF NOT EXISTS "last_lat" double precision NULL,
        ADD COLUMN IF NOT EXISTS "last_lng" double precision NULL,
        ADD COLUMN IF NOT EXISTS "last_position_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "buses"
        DROP COLUMN IF EXISTS "last_position_at",
        DROP COLUMN IF EXISTS "last_lng",
        DROP COLUMN IF EXISTS "last_lat"
    `);
  }
}
