import { MigrationInterface, QueryRunner } from 'typeorm';

export class AttendanceSessionNumber1792320000000 implements MigrationInterface {
  name = 'AttendanceSessionNumber1792320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "attendances"
      ADD COLUMN IF NOT EXISTS "session_number" integer NOT NULL DEFAULT 1
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_attendances_student_group_date_session"
      ON "attendances" ("student_id", "group_id", "attendance_date", "session_number")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_attendances_student_group_date_session"
    `);
    await queryRunner.query(`
      ALTER TABLE "attendances"
      DROP COLUMN IF EXISTS "session_number"
    `);
  }
}
