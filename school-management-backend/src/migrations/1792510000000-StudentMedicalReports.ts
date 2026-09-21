import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentMedicalReports1792510000000 implements MigrationInterface {
  name = 'StudentMedicalReports1792510000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Stored in the database (not on disk): the API container has no persistent uploads volume.
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS student_medical_reports (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        student_id uuid NOT NULL REFERENCES students(id) ON DELETE CASCADE,
        school_id uuid NULL,
        filename varchar(255) NOT NULL,
        mime_type varchar(100) NOT NULL,
        size_bytes integer NOT NULL,
        data bytea NOT NULL,
        uploaded_by uuid NULL,
        created_at timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_student_medical_reports_student ON student_medical_reports (student_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS student_medical_reports`);
  }
}
