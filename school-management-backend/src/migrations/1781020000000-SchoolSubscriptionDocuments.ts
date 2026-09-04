import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolSubscriptionDocuments1781020000000 implements MigrationInterface {
  name = 'SchoolSubscriptionDocuments1781020000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "cr_document_url" text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "owner_id_document_url" text NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "schools"
      ADD COLUMN IF NOT EXISTS "owner_legal_name" character varying(255) NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN IF EXISTS "owner_legal_name"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN IF EXISTS "owner_id_document_url"`);
    await queryRunner.query(`ALTER TABLE "schools" DROP COLUMN IF EXISTS "cr_document_url"`);
  }
}
