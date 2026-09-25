import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnrollmentIdentityDocuments1792580000000 implements MigrationInterface {
  name = 'EnrollmentIdentityDocuments1792580000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD COLUMN IF NOT EXISTS "parent_id_documents" json NULL,
        ADD COLUMN IF NOT EXISTS "birth_certificate" text NULL,
        ADD COLUMN IF NOT EXISTS "child_id_document" text NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        DROP COLUMN IF EXISTS "parent_id_documents",
        DROP COLUMN IF EXISTS "birth_certificate",
        DROP COLUMN IF EXISTS "child_id_document"
    `);
  }
}
