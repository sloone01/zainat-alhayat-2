import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeePackageLevelBillingPeriod1783000000000 implements MigrationInterface {
  name = 'FeePackageLevelBillingPeriod1783000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      ADD COLUMN IF NOT EXISTS "billing_period" character varying(16) NOT NULL DEFAULT 'yearly'
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      DROP CONSTRAINT IF EXISTS "UQ_fee_package_level_amounts"
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      ADD CONSTRAINT "UQ_fee_package_level_amounts"
      UNIQUE ("package_id", "level_id", "charge_type_id", "billing_period")
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      ADD CONSTRAINT "CHK_fee_package_level_amounts_billing_period"
      CHECK ("billing_period" IN ('monthly', 'semester', 'yearly'))
    `);

    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      ADD COLUMN IF NOT EXISTS "billing_period" character varying(16) NOT NULL DEFAULT 'yearly'
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      DROP CONSTRAINT IF EXISTS "UQ_level_payment_charge_lines_profile_type"
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      ADD CONSTRAINT "UQ_level_payment_charge_lines_profile_type_period"
      UNIQUE ("profile_id", "charge_type_id", "billing_period")
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      ADD CONSTRAINT "CHK_level_payment_charge_lines_billing_period"
      CHECK ("billing_period" IN ('monthly', 'semester', 'yearly'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      DROP CONSTRAINT IF EXISTS "CHK_level_payment_charge_lines_billing_period"
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      DROP CONSTRAINT IF EXISTS "UQ_level_payment_charge_lines_profile_type_period"
    `);
    await queryRunner.query(`
      DELETE FROM "level_payment_charge_lines" a
      USING "level_payment_charge_lines" b
      WHERE a.id > b.id
        AND a.profile_id = b.profile_id
        AND a.charge_type_id = b.charge_type_id
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines" DROP COLUMN IF EXISTS "billing_period"
    `);
    await queryRunner.query(`
      ALTER TABLE "level_payment_charge_lines"
      ADD CONSTRAINT "UQ_level_payment_charge_lines_profile_type"
      UNIQUE ("profile_id", "charge_type_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      DROP CONSTRAINT IF EXISTS "CHK_fee_package_level_amounts_billing_period"
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      DROP CONSTRAINT IF EXISTS "UQ_fee_package_level_amounts"
    `);
    await queryRunner.query(`
      DELETE FROM "fee_package_level_amounts" a
      USING "fee_package_level_amounts" b
      WHERE a.id > b.id
        AND a.package_id = b.package_id
        AND a.level_id = b.level_id
        AND a.charge_type_id = b.charge_type_id
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts" DROP COLUMN IF EXISTS "billing_period"
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_level_amounts"
      ADD CONSTRAINT "UQ_fee_package_level_amounts"
      UNIQUE ("package_id", "level_id", "charge_type_id")
    `);
  }
}
