import { MigrationInterface, QueryRunner } from 'typeorm';

export class GradedCriterionStudentMarks1784500000000
  implements MigrationInterface
{
  name = 'GradedCriterionStudentMarks1784500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_criterion_student_marks" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "graded_criterion_id" uuid NOT NULL,
        "student_id" uuid NOT NULL,
        "mark" numeric(10,2) NULL,
        "updated_by_user_id" uuid NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_graded_criterion_student_marks"
          UNIQUE ("graded_criterion_id", "student_id"),
        CONSTRAINT "FK_gcs_marks_criterion"
          FOREIGN KEY ("graded_criterion_id")
          REFERENCES "graded_criteria"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gcs_marks_student"
          FOREIGN KEY ("student_id")
          REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_gcs_marks_user"
          FOREIGN KEY ("updated_by_user_id")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gcs_marks_student"
        ON "graded_criterion_student_marks" ("student_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_gcs_marks_criterion"
        ON "graded_criterion_student_marks" ("graded_criterion_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "graded_criterion_student_marks"`,
    );
  }
}
