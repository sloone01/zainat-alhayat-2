import { MigrationInterface, QueryRunner } from 'typeorm';

/** Remove unused milestone type (assessment/project/…); UI no longer collects it. */
export class DropMilestoneType1792060000000 implements MigrationInterface {
  name = 'DropMilestoneType1792060000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "milestones" DROP COLUMN IF EXISTS "type"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "milestones" ADD COLUMN IF NOT EXISTS "type" character varying(50)`,
    );
  }
}
