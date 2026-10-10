import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Persist bilingual student/parent name parts on enrollments (not only fullName).
 */
export class EnrollmentBilingualNames1792630000000 implements MigrationInterface {
  name = 'EnrollmentBilingualNames1792630000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE enrollments
        ADD COLUMN IF NOT EXISTS first_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS first_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS last_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS last_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS second_name varchar(100),
        ADD COLUMN IF NOT EXISTS third_name varchar(100),
        ADD COLUMN IF NOT EXISTS second_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS third_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS father_first_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS father_first_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS father_last_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS father_last_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS father_civil_id varchar(40),
        ADD COLUMN IF NOT EXISTS mother_first_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS mother_first_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS mother_last_name_ar varchar(100),
        ADD COLUMN IF NOT EXISTS mother_last_name_en varchar(100),
        ADD COLUMN IF NOT EXISTS mother_civil_id varchar(40)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE enrollments
        DROP COLUMN IF EXISTS first_name_ar,
        DROP COLUMN IF EXISTS first_name_en,
        DROP COLUMN IF EXISTS last_name_ar,
        DROP COLUMN IF EXISTS last_name_en,
        DROP COLUMN IF EXISTS second_name,
        DROP COLUMN IF EXISTS third_name,
        DROP COLUMN IF EXISTS second_name_en,
        DROP COLUMN IF EXISTS third_name_en,
        DROP COLUMN IF EXISTS father_first_name_ar,
        DROP COLUMN IF EXISTS father_first_name_en,
        DROP COLUMN IF EXISTS father_last_name_ar,
        DROP COLUMN IF EXISTS father_last_name_en,
        DROP COLUMN IF EXISTS father_civil_id,
        DROP COLUMN IF EXISTS mother_first_name_ar,
        DROP COLUMN IF EXISTS mother_first_name_en,
        DROP COLUMN IF EXISTS mother_last_name_ar,
        DROP COLUMN IF EXISTS mother_last_name_en,
        DROP COLUMN IF EXISTS mother_civil_id
    `);
  }
}
