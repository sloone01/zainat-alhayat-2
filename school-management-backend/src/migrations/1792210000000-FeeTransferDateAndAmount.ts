import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeeTransferDateAndAmount1792210000000 implements MigrationInterface {
  name = 'FeeTransferDateAndAmount1792210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      ADD COLUMN IF NOT EXISTS "transferred_at" date
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_transfers"
      DROP COLUMN IF EXISTS "transferred_at"
    `);
  }
}
