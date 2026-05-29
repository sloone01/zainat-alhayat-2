import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentPaymentLedger1783300000000 implements MigrationInterface {
  name = 'StudentPaymentLedger1783300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_fee_charges" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "school_id" integer NOT NULL,
        "student_payment_id" uuid NOT NULL,
        "academic_year_id" uuid,
        "charge_type_id" uuid NOT NULL,
        "billing_occurrence" character varying(32) NOT NULL DEFAULT 'per_year',
        "amount_due" numeric(12,2) NOT NULL DEFAULT 0,
        "amount_paid" numeric(12,2) NOT NULL DEFAULT 0,
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_fee_charges" PRIMARY KEY ("id"),
        CONSTRAINT "CHK_student_fee_charges_billing_occurrence"
          CHECK ("billing_occurrence" IN ('per_year', 'once_ever', 'other')),
        CONSTRAINT "FK_sfc_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfc_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfc_student_payment" FOREIGN KEY ("student_payment_id") REFERENCES "student_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sfc_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_sfc_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sfc_once_ever"
      ON "student_fee_charges" ("student_payment_id", "charge_type_id")
      WHERE "billing_occurrence" = 'once_ever'
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_sfc_per_year"
      ON "student_fee_charges" ("student_payment_id", "charge_type_id", "academic_year_id")
      WHERE "billing_occurrence" IN ('per_year', 'other')
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sfc_student_year"
      ON "student_fee_charges" ("student_id", "academic_year_id")
    `);

    // If a failed run left payment_transactions with integer recorded_by_user_id, drop and recreate.
    await queryRunner.query(`
      DO $$ BEGIN
        IF EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'payment_transactions'
            AND column_name = 'recorded_by_user_id'
            AND data_type IN ('integer', 'bigint')
        ) THEN
          DROP TABLE IF EXISTS "payment_transaction_allocations" CASCADE;
          DROP TABLE IF EXISTS "payment_transactions" CASCADE;
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_transactions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_id" uuid NOT NULL,
        "school_id" integer NOT NULL,
        "student_payment_id" uuid NOT NULL,
        "academic_year_id" uuid,
        "total_amount" numeric(12,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "paid_at" TIMESTAMPTZ NOT NULL,
        "recorded_by_user_id" uuid,
        "remarks" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pt_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pt_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pt_student_payment" FOREIGN KEY ("student_payment_id") REFERENCES "student_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pt_academic_year" FOREIGN KEY ("academic_year_id") REFERENCES "academic_years"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_pt_recorded_by" FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pt_student_paid_at"
      ON "payment_transactions" ("student_id", "paid_at" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_transaction_allocations" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "payment_transaction_id" uuid NOT NULL,
        "student_fee_charge_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "level_payment_installment_id" uuid,
        "amount" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_transaction_allocations" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pta_transaction" FOREIGN KEY ("payment_transaction_id") REFERENCES "payment_transactions"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_pta_fee_charge" FOREIGN KEY ("student_fee_charge_id") REFERENCES "student_fee_charges"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pta_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_pta_installment" FOREIGN KEY ("level_payment_installment_id") REFERENCES "level_payment_installments"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pta_transaction"
      ON "payment_transaction_allocations" ("payment_transaction_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_pta_fee_charge"
      ON "payment_transaction_allocations" ("student_fee_charge_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_transaction_allocations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_transactions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_fee_charges"`);
  }
}
