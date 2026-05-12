import { MigrationInterface, QueryRunner } from 'typeorm';

export class GradedCriterionTaskStudentMarks1780910000000 implements MigrationInterface {
  name = 'GradedCriterionTaskStudentMarks1780910000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_criterion_task_student_marks" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "graded_criterion_teacher_task_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "mark" numeric(10,2),
        "updated_by_teacher_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graded_criterion_task_student_marks" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_gctsm_task_student" UNIQUE ("graded_criterion_teacher_task_id", "student_id"),
        CONSTRAINT "FK_gctsm_task" FOREIGN KEY ("graded_criterion_teacher_task_id") REFERENCES "graded_criterion_teacher_tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gctsm_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_gctsm_teacher" FOREIGN KEY ("updated_by_teacher_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gctsm_task" ON "graded_criterion_task_student_marks" ("graded_criterion_teacher_task_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gctsm_student" ON "graded_criterion_task_student_marks" ("student_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "graded_criterion_task_student_marks"`);
  }
}
