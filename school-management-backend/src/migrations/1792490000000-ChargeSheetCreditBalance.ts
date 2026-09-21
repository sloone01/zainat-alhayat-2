import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChargeSheetCreditBalance1792490000000 implements MigrationInterface {
  name = 'ChargeSheetCreditBalance1792490000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Advance/credit left on the account when an approved payment exceeds the balance due.
    await queryRunner.query(`
      ALTER TABLE student_charge_sheets
      ADD COLUMN IF NOT EXISTS credit_balance decimal(12,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE student_charge_sheets
      DROP COLUMN IF EXISTS credit_balance
    `);
  }
}
