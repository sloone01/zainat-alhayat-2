import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeeTransferReceipt1792290000000 implements MigrationInterface {
  name = 'FeeTransferReceipt1792290000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      ADD COLUMN IF NOT EXISTS "proof_url" varchar(500)
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      ADD COLUMN IF NOT EXISTS "proof_original_name" varchar(255)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      DROP COLUMN IF EXISTS "proof_original_name"
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      DROP COLUMN IF EXISTS "proof_url"
    `);
  }
}
