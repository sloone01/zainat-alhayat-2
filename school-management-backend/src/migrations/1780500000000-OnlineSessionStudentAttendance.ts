import { MigrationInterface, QueryRunner } from 'typeorm';

export class OnlineSessionStudentAttendance1780500000000 implements MigrationInterface {
  name = 'OnlineSessionStudentAttendance1780500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "online_session_student_attendance" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "online_session_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "status" character varying(20) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_online_session_student_attendance" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_online_session_student_attendance_session_student" UNIQUE ("online_session_id", "student_id"),
        CONSTRAINT "FK_ossa_session" FOREIGN KEY ("online_session_id") REFERENCES "online_video_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_ossa_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_ossa_session"
      ON "online_session_student_attendance" ("online_session_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "online_video_sessions"
      ADD COLUMN IF NOT EXISTS "attendance_finalized_at" TIMESTAMP WITH TIME ZONE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "online_session_student_attendance"`);
    await queryRunner.query(
      `ALTER TABLE "online_video_sessions" DROP COLUMN IF EXISTS "attendance_finalized_at"`,
    );
  }
}
