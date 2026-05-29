import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentPaymentsAndLevel1782100000000 implements MigrationInterface {
  name = 'StudentPaymentsAndLevel1782100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "payment_allow_admin_adjust_student_total" boolean NOT NULL DEFAULT false
    `);

    await queryRunner.query(`
      ALTER TABLE "students"
      ADD COLUMN IF NOT EXISTS "payment_level_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "students"
        ADD CONSTRAINT "FK_students_payment_level"
        FOREIGN KEY ("payment_level_id") REFERENCES "school_payment_levels"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_payments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "school_id" integer NOT NULL,
        "level_id" uuid,
        "level_payment_profile_id" uuid,
        "base_total_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "admin_adjusted_total" numeric(12,2),
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_student_payments_student" UNIQUE ("student_id"),
        CONSTRAINT "FK_student_payments_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_payments_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_payments_level" FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_student_payments_profile" FOREIGN KEY ("level_payment_profile_id") REFERENCES "level_payment_profiles"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_payment_discount_lines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_payment_id" uuid NOT NULL,
        "discount_type_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "remarks" text NOT NULL DEFAULT '',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_payment_discount_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_spdl_payment" FOREIGN KEY ("student_payment_id") REFERENCES "student_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_spdl_discount_type" FOREIGN KEY ("discount_type_id") REFERENCES "payment_discount_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_spdl_student_payment_id" ON "student_payment_discount_lines" ("student_payment_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_payment_discount_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_payments"`);
    await queryRunner.query(`ALTER TABLE "students" DROP CONSTRAINT IF EXISTS "FK_students_payment_level"`);
    await queryRunner.query(`ALTER TABLE "students" DROP COLUMN IF EXISTS "payment_level_id"`);
    await queryRunner.query(
      `ALTER TABLE "schools" DROP COLUMN IF EXISTS "payment_allow_admin_adjust_student_total"`,
    );
  }
}
