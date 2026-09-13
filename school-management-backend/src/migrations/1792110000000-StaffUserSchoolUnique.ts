import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Staff membership is (user, school). One login can work at several schools.
 * Backfill from users.school_id so existing staff get a membership row.
 */
export class StaffUserSchoolUnique1792110000000 implements MigrationInterface {
  name = 'StaffUserSchoolUnique1792110000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "staff" ("id", "user_id", "school_id", "created_at", "updated_at")
      SELECT gen_random_uuid(), u.id, u.school_id, NOW(), NOW()
      FROM "users" u
      WHERE u.school_id IS NOT NULL
        AND COALESCE(u.user_type::text, '') NOT IN ('parent', 'student')
        AND NOT EXISTS (
          SELECT 1 FROM "staff" s
          WHERE s.user_id = u.id AND s.school_id = u.school_id
        )
    `);

    await queryRunner.query(`
      DELETE FROM "staff" a
      USING "staff" b
      WHERE a.ctid < b.ctid
        AND a.user_id = b.user_id
        AND a.school_id = b.school_id
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_staff_user_school"
        ON "staff" ("user_id", "school_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_staff_user_school"`);
  }
}
