import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentPaymentInstallmentReceipts1782110000000 implements MigrationInterface {
  name = 'StudentPaymentInstallmentReceipts1782110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_payment_installment_receipts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "student_payment_id" uuid NOT NULL,
        "level_payment_installment_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "paid_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "remarks" text,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_payment_installment_receipts" PRIMARY KEY ("id"),
        CONSTRAINT "FK_spir_payment" FOREIGN KEY ("student_payment_id") REFERENCES "student_payments"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_spir_installment" FOREIGN KEY ("level_payment_installment_id") REFERENCES "level_payment_installments"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_spir_payment_installment" UNIQUE ("student_payment_id", "level_payment_installment_id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_spir_student_payment_id" ON "student_payment_installment_receipts" ("student_payment_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_payment_installment_receipts"`);
  }
}
