import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Public /student-enrollment: save-in-progress applications as status=draft
 * plus a JSON snapshot so civil-ID lookup can restore the wizard.
 */
export class EnrollmentDraftStatus1792610000000 implements MigrationInterface {
  name = 'EnrollmentDraftStatus1792610000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Normalize status to varchar so we can add `draft` without fighting PG enum names.
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "enrollments"
          ALTER COLUMN "status" DROP DEFAULT;
      EXCEPTION WHEN OTHERS THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ALTER COLUMN "status" TYPE character varying(24)
        USING ("status"::text)
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ALTER COLUMN "status" SET DEFAULT 'pending'
    `);
    await queryRunner.query(`
      UPDATE "enrollments"
      SET "status" = 'pending'
      WHERE "status" IS NULL OR "status" = ''
    `);
    await queryRunner.query(`
      ALTER TABLE "enrollments"
        ADD COLUMN IF NOT EXISTS "draft_payload" jsonb NULL
    `);
    // Column type change keeps the old CHECK; reopen it for `draft`.
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
      ALTER TABLE "enrollments" DROP COLUMN IF EXISTS "draft_payload"
    `);
  }
}
