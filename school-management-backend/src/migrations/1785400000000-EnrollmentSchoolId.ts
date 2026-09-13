import { MigrationInterface, QueryRunner } from 'typeorm';

export class EnrollmentSchoolId1785400000000 implements MigrationInterface {
  name = 'EnrollmentSchoolId1785400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "enrollments"
      ADD COLUMN IF NOT EXISTS "school_id" integer
    `);
    // Existing rows: attach to first school (single-tenant historical data)
    await queryRunner.query(`
      UPDATE "enrollments" e
      SET "school_id" = (SELECT s.id FROM "schools" s ORDER BY s.id ASC LIMIT 1)
      WHERE e."school_id" IS NULL
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_enrollments_school_id" ON "enrollments" ("school_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_enrollments_school_id"`);
    await queryRunner.query(`ALTER TABLE "enrollments" DROP COLUMN IF EXISTS "school_id"`);
  }
}
