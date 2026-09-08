import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Status code alone does not say why a request failed. Recording the error name and
 * message turns "POST /api/groups 500" into something diagnosable from the log page.
 */
export class ActivityLogError1789300000000 implements MigrationInterface {
  name = 'ActivityLogError1789300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "error_code" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "activity_logs" ADD COLUMN IF NOT EXISTS "error_message" character varying(1000)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "error_message"`);
    await queryRunner.query(`ALTER TABLE "activity_logs" DROP COLUMN IF EXISTS "error_code"`);
  }
}
