import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityImageUrl1792450000000 implements MigrationInterface {
  name = 'ActivityImageUrl1792450000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE activities
      ADD COLUMN IF NOT EXISTS image_url text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE activities DROP COLUMN IF EXISTS image_url
    `);
  }
}
