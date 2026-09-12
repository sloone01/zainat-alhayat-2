import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnrollmentInstallmentPlanId1792230000000 implements MigrationInterface {
  name = 'EnrollmentInstallmentPlanId1792230000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments"
      ADD COLUMN IF NOT EXISTS "installment_plan_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "enrollments"
          ADD CONSTRAINT "FK_enrollments_installment_plan"
          FOREIGN KEY ("installment_plan_id") REFERENCES "installment_plans"("id")
          ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN NULL;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "FK_enrollments_installment_plan"
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP COLUMN IF EXISTS "installment_plan_id"
    `);
  }
}
