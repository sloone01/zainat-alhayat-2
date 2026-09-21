import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentCivilId1792530000000 implements MigrationInterface {
  name = 'StudentCivilId1792530000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Civil/national ID on the student record — drives the student login (create & sign-in by civil id).
    await queryRunner.query(`
      ALTER TABLE students
      ADD COLUMN IF NOT EXISTS civil_id varchar(20)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE students
      DROP COLUMN IF EXISTS civil_id
    `);
  }
}
