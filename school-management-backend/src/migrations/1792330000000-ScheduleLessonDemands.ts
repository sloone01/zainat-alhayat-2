import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleLessonDemands1792330000000 implements MigrationInterface {
  name = 'ScheduleLessonDemands1792330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "schedule_lesson_demands" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" uuid NOT NULL,
        "group_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "periods_per_week" integer NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_schedule_lesson_demands" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_schedule_lesson_demands_school_group_course" UNIQUE ("school_id", "group_id", "course_id"),
        CONSTRAINT "FK_schedule_lesson_demands_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schedule_lesson_demands_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schedule_lesson_demands_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_schedule_lesson_demands_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_schedule_lesson_demands_school_group"
      ON "schedule_lesson_demands" ("school_id", "group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_schedule_lesson_demands_school_group"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "schedule_lesson_demands"`);
  }
}
