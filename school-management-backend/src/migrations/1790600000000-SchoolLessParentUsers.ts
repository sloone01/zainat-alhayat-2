import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Parent logins are school-less: one email across schools, tenancy via Parent rows
 * and student_parents links. Clear school_id / mistaken is_system_user on parent users.
 */
export class SchoolLessParentUsers1790600000000 implements MigrationInterface {
  name = 'SchoolLessParentUsers1790600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE "users"
      SET "school_id" = NULL,
          "is_system_user" = false
      WHERE (
          "user_type" = 'parent'
          OR "role" = 'parent'
        )
        AND COALESCE("is_super_admin", false) = false
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot safely restore prior school_id values.
    await queryRunner.query(`
      UPDATE "users" u
      SET "school_id" = p."school_id"
      FROM (
        SELECT DISTINCT ON ("user_id") "user_id", "school_id"
        FROM "parents"
        WHERE "user_id" IS NOT NULL AND "school_id" IS NOT NULL
        ORDER BY "user_id", "id" ASC
      ) p
      WHERE u.id = p."user_id"
        AND (u."user_type" = 'parent' OR u."role" = 'parent')
        AND u."school_id" IS NULL
    `);
  }
}
