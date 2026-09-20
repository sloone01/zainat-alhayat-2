import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupportRequestContext1792470000000 implements MigrationInterface {
  name = 'SupportRequestContext1792470000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE support_requests ADD COLUMN IF NOT EXISTS context jsonb NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE support_requests DROP COLUMN IF EXISTS context`);
  }
}
