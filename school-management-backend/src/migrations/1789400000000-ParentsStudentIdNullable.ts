import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * parents.student_id is a legacy column: no foreign key, no readers, and every existing
 * row holds the placeholder 1 (students.id is a uuid, so it references nothing). It was
 * NOT NULL with no default, so every parent insert failed. Made nullable rather than
 * dropped, so existing values survive until the column is retired deliberately.
 */
export class ParentsStudentIdNullable1789400000000 implements MigrationInterface {
  name = 'ParentsStudentIdNullable1789400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parents" ALTER COLUMN "student_id" DROP NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "parents" SET "student_id" = 1 WHERE "student_id" IS NULL`);
    await queryRunner.query(`ALTER TABLE "parents" ALTER COLUMN "student_id" SET NOT NULL`);
  }
}
