import { MigrationInterface, QueryRunner } from 'typeorm';

export class BackfillStudentCivilId1792540000000 implements MigrationInterface {
  name = 'BackfillStudentCivilId1792540000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Older students captured their civil id in "studentId" (the enrollment "Civil ID / Passport
    // Number" field mapped there). Seed civil_id from it where it looks like a civil id
    // (purely numeric, 7-12 digits) — so those students become loadable by civil id.
    // Idempotent: only fills rows still missing civil_id.
    await queryRunner.query(`
      UPDATE students
      SET civil_id = "studentId"
      WHERE civil_id IS NULL
        AND "studentId" ~ '^[0-9]{7,12}$'
    `);
  }

  public async down(): Promise<void> {
    // No-op: a data backfill is not safely reversible (can't tell backfilled rows from real ones).
  }
}
