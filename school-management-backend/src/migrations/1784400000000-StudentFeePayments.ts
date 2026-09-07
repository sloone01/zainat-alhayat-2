import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Parent/admin fee payments: offline proof (approval) + Thawani checkout.
 */
export class StudentFeePayments1784400000000 implements MigrationInterface {
  name = 'StudentFeePayments1784400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_fee_payments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "student_id" uuid NOT NULL,
        "sheet_id" uuid NOT NULL,
        "target_type" varchar(16) NOT NULL,
        "installment_id" uuid NULL,
        "amount" decimal(12,3) NOT NULL,
        "method" varchar(16) NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'pending',
        "proof_url" varchar(500) NULL,
        "proof_original_name" varchar(255) NULL,
        "remarks" varchar(500) NULL,
        "thawani_session_id" varchar(128) NULL,
        "thawani_invoice" varchar(64) NULL,
        "receipt_locale" varchar(8) NOT NULL DEFAULT 'ar',
        "submitted_by" uuid NULL,
        "reviewed_by" uuid NULL,
        "reviewed_at" TIMESTAMPTZ NULL,
        "review_notes" varchar(500) NULL,
        "receipt_sent_at" TIMESTAMPTZ NULL,
        "paid_at" TIMESTAMPTZ NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_fee_payments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_sfp_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfp_student" FOREIGN KEY ("student_id")
          REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfp_sheet" FOREIGN KEY ("sheet_id")
          REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfp_installment" FOREIGN KEY ("installment_id")
          REFERENCES "student_charge_sheet_installments"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sfp_submitted_by" FOREIGN KEY ("submitted_by")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sfp_reviewed_by" FOREIGN KEY ("reviewed_by")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_student_fee_payments_school_status"
        ON "student_fee_payments" ("school_id", "status")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_student_fee_payments_student"
        ON "student_fee_payments" ("student_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_student_fee_payments_thawani_session"
        ON "student_fee_payments" ("thawani_session_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_fee_payments"`);
  }
}
