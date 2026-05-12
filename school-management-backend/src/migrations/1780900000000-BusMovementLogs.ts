import { MigrationInterface, QueryRunner } from 'typeorm';

export class BusMovementLogs1780900000000 implements MigrationInterface {
  name = 'BusMovementLogs1780900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bus_movement_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bus_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "event_type" character varying(32) NOT NULL,
        "logged_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "logged_by_user_id" uuid,
        CONSTRAINT "PK_bus_movement_logs" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bus_movement_logs_bus" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_bus_movement_logs_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_bus_movement_logs_user" FOREIGN KEY ("logged_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION,
        CONSTRAINT "CHK_bus_movement_logs_event_type" CHECK ("event_type" IN ('boarded', 'dropped_off'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_bus_movement_logs_bus_logged_at"
      ON "bus_movement_logs" ("bus_id", "logged_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bus_movement_logs"`);
  }
}
