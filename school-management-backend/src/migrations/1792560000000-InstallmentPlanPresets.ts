import { MigrationInterface, QueryRunner } from 'typeorm';

export class InstallmentPlanPresets1792560000000 implements MigrationInterface {
  name = 'InstallmentPlanPresets1792560000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "installment_plans"
      ADD COLUMN IF NOT EXISTS "is_preset" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "installment_plans"
      ADD COLUMN IF NOT EXISTS "inclusion_type_ids" jsonb NULL
    `);
    await queryRunner.query(`
      UPDATE "installment_plans" p
      SET "is_preset" = true
      WHERE EXISTS (SELECT 1 FROM "installment_plan_entries" e WHERE e.plan_id = p.id)
        AND NOT EXISTS (
          SELECT 1 FROM "installment_plan_entries" e WHERE e.plan_id = p.id AND e.amount IS NULL
        )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "installment_plans" DROP COLUMN IF EXISTS "inclusion_type_ids"
    `);
    await queryRunner.query(`
      ALTER TABLE "installment_plans" DROP COLUMN IF EXISTS "is_preset"
    `);
  }
}
