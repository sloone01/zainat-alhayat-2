import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentsTable1791400000000 implements MigrationInterface {
  name = 'PaymentsTable1791400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" uuid NOT NULL,
        "student_id" uuid,
        "payment_ref" character varying(32) NOT NULL,
        "amount" numeric(12,3) NOT NULL,
        "method" character varying(16) NOT NULL,
        "status" character varying(24) NOT NULL DEFAULT 'pending',
        "proof_url" character varying(500),
        "proof_original_name" character varying(255),
        "remarks" character varying(500),
        "submitted_by" uuid,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payments" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_payments_payment_ref" UNIQUE ("payment_ref"),
        CONSTRAINT "FK_payments_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_payments_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_payments_submitted_by" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_school_created" ON "payments" ("school_id", "created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_payments_student" ON "payments" ("student_id")`,
    );

    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
      ADD COLUMN IF NOT EXISTS "payment_id" uuid
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "student_fee_payments"
          ADD CONSTRAINT "FK_student_fee_payments_payment"
          FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$;
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_student_fee_payments_payment" ON "student_fee_payments" ("payment_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_student_fee_payments_payment"`,
    );
    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
      DROP CONSTRAINT IF EXISTS "FK_student_fee_payments_payment"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
      DROP COLUMN IF EXISTS "payment_id"
    `);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_student"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_payments_school_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payments"`);
  }
}
