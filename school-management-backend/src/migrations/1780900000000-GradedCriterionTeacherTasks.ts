import { MigrationInterface, QueryRunner } from 'typeorm';

export class GradedCriterionTeacherTasks1780900000000 implements MigrationInterface {
  name = 'GradedCriterionTeacherTasks1780900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_criterion_teacher_tasks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "graded_criterion_id" uuid NOT NULL,
        "teacher_id" uuid NOT NULL,
        "group_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "description" text,
        "due_date" date,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_system_default" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graded_criterion_teacher_tasks" PRIMARY KEY ("id"),
        CONSTRAINT "FK_gctt_criterion" FOREIGN KEY ("graded_criterion_id") REFERENCES "graded_criteria"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gctt_teacher" FOREIGN KEY ("teacher_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gctt_group" FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gctt_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gctt_teacher_course"
      ON "graded_criterion_teacher_tasks" ("teacher_id", "course_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gctt_criterion_group"
      ON "graded_criterion_teacher_tasks" ("graded_criterion_id", "group_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "graded_criterion_teacher_tasks"`);
  }
}
