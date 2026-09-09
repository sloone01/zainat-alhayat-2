import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Platform admin mark-paid records amount received and optional receipt URL
 * without overwriting invoice total_amount.
 */
export class PlatformInvoicePaidAmountReceipt1790800000000 implements MigrationInterface {
  name = 'PlatformInvoicePaidAmountReceipt1790800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      ADD COLUMN IF NOT EXISTS "paid_amount" numeric(12,3) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      ADD COLUMN IF NOT EXISTS "paid_receipt_url" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      DROP COLUMN IF EXISTS "paid_receipt_url"
    `);
    await queryRunner.query(`
      ALTER TABLE "platform_invoices"
      DROP COLUMN IF EXISTS "paid_amount"
    `);
  }
}
