import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes columns that only duplicate another column and are no longer read by the app:
 *  - students.first_name / family_name / date_of_birth / medical_conditions / allergies / emergency_contact
 *  - parents.school_id (a parent belongs to a school only through linked students)
 * The old values are kept in bak_20260921_* tables.
 */
export class DropLegacyDuplicateColumns1792570000000 implements MigrationInterface {
  name = 'DropLegacyDuplicateColumns1792570000000';

  public async up(q: QueryRunner): Promise<void> {
    await q.query(`CREATE TABLE IF NOT EXISTS bak_20260921_students AS SELECT * FROM students`);
    // parents backup is also created by the previous migration; keep this one self-contained
    await q.query(`CREATE TABLE IF NOT EXISTS bak_20260921_parents AS SELECT * FROM parents`);

    for (const col of [
      'first_name',
      'family_name',
      'date_of_birth',
      'medical_conditions',
      'allergies',
      'emergency_contact',
    ]) {
      await q.query(`ALTER TABLE students DROP COLUMN IF EXISTS ${col}`);
    }
    await q.query(`DROP INDEX IF EXISTS idx_parents_school_id`);
    await q.query(`ALTER TABLE parents DROP COLUMN IF EXISTS school_id`);
  }

  public async down(q: QueryRunner): Promise<void> {
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS first_name varchar(100) NULL`);
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS family_name varchar(100) NULL`);
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS date_of_birth date NULL`);
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS medical_conditions varchar(255) NULL`);
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS allergies varchar(255) NULL`);
    await q.query(`ALTER TABLE students ADD COLUMN IF NOT EXISTS emergency_contact varchar(255) NULL`);
    await q.query(`ALTER TABLE parents ADD COLUMN IF NOT EXISTS school_id uuid NULL`);
  }
}
