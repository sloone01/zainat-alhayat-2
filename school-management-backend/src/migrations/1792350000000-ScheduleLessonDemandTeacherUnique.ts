import { MigrationInterface, QueryRunner } from 'typeorm';

export class ScheduleLessonDemandTeacherUnique1792350000000 implements MigrationInterface {
  name = 'ScheduleLessonDemandTeacherUnique1792350000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedule_lesson_demands"
      DROP CONSTRAINT IF EXISTS "UQ_schedule_lesson_demands_school_group_course"
    `);
    await queryRunner.query(`
      DROP INDEX IF EXISTS "UQ_schedule_lesson_demands_school_group_course"
    `);
    await queryRunner.query(`
      ALTER TABLE "schedule_lesson_demands"
      ADD CONSTRAINT "UQ_schedule_lesson_demands_school_group_course_teacher"
      UNIQUE ("school_id", "group_id", "course_id", "teacher_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schedule_lesson_demands"
      DROP CONSTRAINT IF EXISTS "UQ_schedule_lesson_demands_school_group_course_teacher"
    `);
    await queryRunner.query(`
      ALTER TABLE "schedule_lesson_demands"
      ADD CONSTRAINT "UQ_schedule_lesson_demands_school_group_course"
      UNIQUE ("school_id", "group_id", "course_id")
    `);
  }
}
