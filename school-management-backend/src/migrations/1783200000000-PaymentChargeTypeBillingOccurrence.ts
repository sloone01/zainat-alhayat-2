import { MigrationInterface, QueryRunner } from 'typeorm';

export class PaymentChargeTypeBillingOccurrence1783200000000 implements MigrationInterface {
  name = 'PaymentChargeTypeBillingOccurrence1783200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_charge_types"
      ADD COLUMN IF NOT EXISTS "billing_occurrence" character varying(32) NOT NULL DEFAULT 'per_year'
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_charge_types"
      ADD CONSTRAINT "CHK_payment_charge_types_billing_occurrence"
      CHECK ("billing_occurrence" IN ('per_year', 'once_ever', 'other'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "payment_charge_types"
      DROP CONSTRAINT IF EXISTS "CHK_payment_charge_types_billing_occurrence"
    `);
    await queryRunner.query(`
      ALTER TABLE "payment_charge_types"
      DROP COLUMN IF EXISTS "billing_occurrence"
    `);
  }
}
