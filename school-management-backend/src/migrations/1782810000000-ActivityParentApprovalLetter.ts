import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityParentApprovalLetter1782810000000 implements MigrationInterface {
  name = 'ActivityParentApprovalLetter1782810000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "activities"
      ADD COLUMN IF NOT EXISTS "requires_parent_approval" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      ALTER TABLE "activities"
      ADD COLUMN IF NOT EXISTS "parent_approval_letter" jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "parent_approval_letter"`);
    await queryRunner.query(`ALTER TABLE "activities" DROP COLUMN IF EXISTS "requires_parent_approval"`);
  }
}
