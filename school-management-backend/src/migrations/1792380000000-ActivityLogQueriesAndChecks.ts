import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLogQueriesAndChecks1792380000000 implements MigrationInterface {
  name = 'ActivityLogQueriesAndChecks1792380000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "checks" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "queries" jsonb`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "queries"`);
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "checks"`);
  }
}
