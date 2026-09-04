import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusMovementTripTypeAndDate1780930000000 implements MigrationInterface {
  name = 'BusMovementTripTypeAndDate1780930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs"
      ADD COLUMN IF NOT EXISTS "trip_type" character varying(16) NOT NULL DEFAULT 'going'
    `);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs"
      DROP CONSTRAINT IF EXISTS "CHK_bus_movement_logs_trip_type"
    `);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs"
      ADD CONSTRAINT "CHK_bus_movement_logs_trip_type"
      CHECK ("trip_type" IN ('going', 'return'))
    `);

    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs"
      ADD COLUMN IF NOT EXISTS "trip_date" date
    `);
    await queryRunner.query(`
      UPDATE "bus_movement_logs"
      SET "trip_date" = ("logged_at" AT TIME ZONE 'UTC')::date
      WHERE "trip_date" IS NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs"
      ALTER COLUMN "trip_date" SET NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bus_movement_logs_bus_trip_day"
      ON "bus_movement_logs" ("bus_id", "trip_date", "trip_type", "student_id", "logged_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bus_movement_logs_bus_trip_day"`);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs" DROP CONSTRAINT IF EXISTS "CHK_bus_movement_logs_trip_type"
    `);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs" DROP COLUMN IF EXISTS "trip_date"
    `);
    await queryRunner.query(`
      ALTER TABLE "bus_movement_logs" DROP COLUMN IF EXISTS "trip_type"
    `);
  }
}
