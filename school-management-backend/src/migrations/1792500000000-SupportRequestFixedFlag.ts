import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupportRequestFixedFlag1792500000000 implements MigrationInterface {
  name = 'SupportRequestFixedFlag1792500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE support_requests
      ADD COLUMN IF NOT EXISTS fixed boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS fixed_at timestamptz NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE support_requests
      DROP COLUMN IF EXISTS fixed,
      DROP COLUMN IF EXISTS fixed_at
    `);
  }
}
