import { MigrationInterface, QueryRunner } from 'typeorm';

export class AttachmentLinkPurpose1792530000000 implements MigrationInterface {
  name = 'AttachmentLinkPurpose1792530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE attachment_links
      ADD COLUMN IF NOT EXISTS purpose varchar(40) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE attachment_links
      DROP COLUMN IF EXISTS purpose
    `);
  }
}
