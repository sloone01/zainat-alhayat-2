import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeePackageLevelPeriodSettings1782820000000 implements MigrationInterface {
  name = 'FeePackageLevelPeriodSettings1782820000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_level_period_settings" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "level_id" uuid NOT NULL,
        "billing_period" character varying(16) NOT NULL,
        "downpayment_amount" numeric(12,2) NOT NULL DEFAULT 0,
        "installment_schedule_months" jsonb,
        CONSTRAINT "PK_fee_package_level_period_settings" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_level_period_settings" UNIQUE ("package_id", "level_id", "billing_period"),
        CONSTRAINT "FK_fplps_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fplps_level" FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fplps_package_level" ON "fee_package_level_period_settings" ("package_id", "level_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_level_period_settings"`);
  }
}
