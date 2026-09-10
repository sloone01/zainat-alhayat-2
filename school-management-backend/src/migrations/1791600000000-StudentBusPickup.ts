import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentBusPickup1791600000000 implements MigrationInterface {
  name = 'StudentBusPickup1791600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_buses"
        ADD COLUMN IF NOT EXISTS "pickup_lat" double precision NULL,
        ADD COLUMN IF NOT EXISTS "pickup_lng" double precision NULL,
        ADD COLUMN IF NOT EXISTS "pickup_source" character varying(32) NULL,
        ADD COLUMN IF NOT EXISTS "pickup_updated_at" TIMESTAMPTZ NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_buses"
        DROP COLUMN IF EXISTS "pickup_updated_at",
        DROP COLUMN IF EXISTS "pickup_source",
        DROP COLUMN IF EXISTS "pickup_lng",
        DROP COLUMN IF EXISTS "pickup_lat"
    `);
  }
}
