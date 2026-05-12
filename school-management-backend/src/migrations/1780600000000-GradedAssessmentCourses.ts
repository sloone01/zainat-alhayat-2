import { MigrationInterface, QueryRunner } from 'typeorm';

export class GradedAssessmentCourses1780600000000 implements MigrationInterface {
  name = 'GradedAssessmentCourses1780600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      ALTER TABLE "courses"
      ADD COLUMN IF NOT EXISTS "course_kind" character varying(32) NOT NULL DEFAULT 'milestone'
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_assessment_schemes" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "course_id" uuid NOT NULL,
        "total_marks" numeric(10,2) NOT NULL,
        "aggregation_method" character varying(20) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graded_assessment_schemes" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_graded_assessment_schemes_course" UNIQUE ("course_id"),
        CONSTRAINT "FK_graded_scheme_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_semester_configs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "scheme_id" uuid NOT NULL,
        "semester_index" integer NOT NULL,
        "title" character varying(255),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graded_semester_configs" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_graded_semester_scheme_index" UNIQUE ("scheme_id", "semester_index"),
        CONSTRAINT "FK_graded_semester_scheme" FOREIGN KEY ("scheme_id") REFERENCES "graded_assessment_schemes"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "graded_criteria" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "semester_config_id" uuid NOT NULL,
        "label" character varying(255) NOT NULL,
        "max_marks" numeric(10,2) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_graded_criteria" PRIMARY KEY ("id"),
        CONSTRAINT "FK_graded_criterion_semester" FOREIGN KEY ("semester_config_id") REFERENCES "graded_semester_configs"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_graded_criteria_semester" ON "graded_criteria" ("semester_config_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "graded_criteria"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "graded_semester_configs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "graded_assessment_schemes"`);
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "course_kind"`);
  }
}
