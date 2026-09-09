import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Parents were scoped only through their linked user account, so a parent record created
 * from the student screen (which never creates a user) belonged to no school and was
 * invisible to every school-scoped list and search. Give parents their own school_id and
 * backfill it from the linked user, falling back to a linked student's school.
 */
export class ParentsSchoolId1789700000000 implements MigrationInterface {
  name = 'ParentsSchoolId1789700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "school_id" integer`);
    await queryRunner.query(`
      UPDATE "parents" p
         SET "school_id" = u."school_id"
        FROM "users" u
       WHERE u."id" = p."user_id"
         AND p."school_id" IS NULL
         AND u."school_id" IS NOT NULL
    `);
    await queryRunner.query(`
      UPDATE "parents" p
         SET "school_id" = s."school_id"
        FROM "student_parents" sp
        JOIN "students" s ON s."id" = sp."student_id"
       WHERE sp."parent_id" = p."id"
         AND p."school_id" IS NULL
         AND s."school_id" IS NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "parents"
        ADD CONSTRAINT "FK_parents_school"
        FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_parents_school_id" ON "parents" ("school_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_parents_school_id"`);
    await queryRunner.query(`ALTER TABLE "parents" DROP CONSTRAINT IF EXISTS "FK_parents_school"`);
    await queryRunner.query(`ALTER TABLE "parents" DROP COLUMN IF EXISTS "school_id"`);
  }
}
