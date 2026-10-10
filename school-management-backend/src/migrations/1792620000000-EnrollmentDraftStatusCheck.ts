import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * 179261 converted status to varchar + draft_payload but left enrollments_status_check
 * without `draft`, so public draft saves 500'd. Reopen the CHECK for already-migrated DBs.
 */
export class EnrollmentDraftStatusCheck1792620000000 implements MigrationInterface {
  name = 'EnrollmentDraftStatusCheck1792620000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_status_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "enrollments_status_check"
        CHECK ((status)::text = ANY (ARRAY[
          'draft'::text,
          'pending'::text,
          'approved'::text,
          'rejected'::text,
          'enrolled'::text
        ]))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "enrollments" WHERE "status" = 'draft'
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments" DROP CONSTRAINT IF EXISTS "enrollments_status_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD CONSTRAINT "enrollments_status_check"
        CHECK ((status)::text = ANY (ARRAY[
          'pending'::text,
          'approved'::text,
          'rejected'::text,
          'enrolled'::text
        ]))
    `);
  }
}
