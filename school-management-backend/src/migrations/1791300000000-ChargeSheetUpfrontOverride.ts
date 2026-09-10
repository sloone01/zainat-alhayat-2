import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChargeSheetUpfrontOverride1791300000000 implements MigrationInterface {
  name = 'ChargeSheetUpfrontOverride1791300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets"
        ADD COLUMN IF NOT EXISTS "upfront_override" decimal(12,2) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets"
        DROP COLUMN IF EXISTS "upfront_override"
    `);
  }
}
