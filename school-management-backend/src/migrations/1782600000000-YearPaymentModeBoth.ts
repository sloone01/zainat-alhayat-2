import { MigrationInterface, QueryRunner } from 'typeorm';

export class YearPaymentModeBoth1782600000000 implements MigrationInterface {
  name = 'YearPaymentModeBoth1782600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "level_payment_profiles" DROP CONSTRAINT IF EXISTS "CHK_level_payment_profiles_year_mode"`,
    );
    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles"
      ADD CONSTRAINT "CHK_level_payment_profiles_year_mode"
      CHECK ("year_payment_mode" IS NULL OR "year_payment_mode" IN ('one_time', 'installments', 'both'))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE "level_payment_profiles" SET "year_payment_mode" = 'installments' WHERE "year_payment_mode" = 'both'`,
    );
    await queryRunner.query(
      `ALTER TABLE "level_payment_profiles" DROP CONSTRAINT IF EXISTS "CHK_level_payment_profiles_year_mode"`,
    );
    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles"
      ADD CONSTRAINT "CHK_level_payment_profiles_year_mode"
      CHECK ("year_payment_mode" IS NULL OR "year_payment_mode" IN ('one_time', 'installments'))
    `);
  }
}
