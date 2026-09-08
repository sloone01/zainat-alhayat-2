import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Retires the legacy parents.student_id column. It had no foreign key and could not
 * have one (students.id is a uuid), every row held the placeholder 1, and the real
 * parent-student link is the student_parents join table.
 */
export class DropParentsStudentId1789500000000 implements MigrationInterface {
  name = 'DropParentsStudentId1789500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "parents" DROP COLUMN IF EXISTS "student_id"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "parents" ADD COLUMN IF NOT EXISTS "student_id" integer NOT NULL DEFAULT 1`,
    );
  }
}
