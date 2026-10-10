import { MigrationInterface, QueryRunner } from 'typeorm';

export class InstallmentFixedAmounts1792550000000 implements MigrationInterface {
  name = 'InstallmentFixedAmounts1792550000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "installment_plans"
      ADD COLUMN IF NOT EXISTS "advance_amount" decimal(12,2) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "installment_plan_entries"
      ADD COLUMN IF NOT EXISTS "amount" decimal(12,2) NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets"
      ADD COLUMN IF NOT EXISTS "installment_amounts" jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets" DROP COLUMN IF EXISTS "installment_amounts"
    `);
    await queryRunner.query(`
      ALTER TABLE "installment_plan_entries" DROP COLUMN IF EXISTS "amount"
    `);
    await queryRunner.query(`
      ALTER TABLE "installment_plans" DROP COLUMN IF EXISTS "advance_amount"
    `);
  }
}
