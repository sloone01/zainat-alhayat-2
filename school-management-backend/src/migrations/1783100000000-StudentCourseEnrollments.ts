import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentCourseEnrollments1783100000000 implements MigrationInterface {
  name = 'StudentCourseEnrollments1783100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_payments"
      DROP CONSTRAINT IF EXISTS "UQ_student_payments_student"
    `);

    await queryRunner.query(`
      ALTER TABLE "student_payments"
      ADD COLUMN IF NOT EXISTS "course_id" uuid NULL,
      ADD COLUMN IF NOT EXISTS "course_payment_profile_id" uuid NULL
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "student_payments"
        ADD CONSTRAINT "FK_student_payments_course"
        FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "student_payments"
        ADD CONSTRAINT "FK_student_payments_course_profile"
        FOREIGN KEY ("course_payment_profile_id") REFERENCES "course_payment_profiles"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN null; END $$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_student_payments_level"
      ON "student_payments" ("student_id")
      WHERE "course_id" IS NULL
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_student_payments_course"
      ON "student_payments" ("student_id", "course_id")
      WHERE "course_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_course_enrollments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "school_id" integer NOT NULL,
        "status" character varying(24) NOT NULL DEFAULT 'active',
        "student_payment_id" uuid NULL,
        "enrolled_by_user_id" uuid NULL,
        "enrolled_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "dropped_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_course_enrollments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sce_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sce_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sce_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sce_payment" FOREIGN KEY ("student_payment_id") REFERENCES "student_payments"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sce_enrolled_by" FOREIGN KEY ("enrolled_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_student_course_enrollments_active"
      ON "student_course_enrollments" ("student_id", "course_id")
      WHERE "status" = 'active'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sce_course_status" ON "student_course_enrollments" ("course_id", "status")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sce_student_status" ON "student_course_enrollments" ("student_id", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_course_enrollments"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_student_payments_course"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_student_payments_level"`);
    await queryRunner.query(`ALTER TABLE "student_payments" DROP CONSTRAINT IF EXISTS "FK_student_payments_course_profile"`);
    await queryRunner.query(`ALTER TABLE "student_payments" DROP CONSTRAINT IF EXISTS "FK_student_payments_course"`);
    await queryRunner.query(`ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "course_payment_profile_id"`);
    await queryRunner.query(`ALTER TABLE "student_payments" DROP COLUMN IF EXISTS "course_id"`);
    await queryRunner.query(`
      ALTER TABLE "student_payments"
      ADD CONSTRAINT "UQ_student_payments_student" UNIQUE ("student_id")
    `);
  }
}
