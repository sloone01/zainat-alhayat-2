import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Each student may be linked to at most one bus (single-bus policy).
 */
export class OneBusPerStudent1780920000000 implements MigrationInterface {
  name = 'OneBusPerStudent1780920000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      WITH ranked AS (
        SELECT "student_id", "bus_id",
          ROW_NUMBER() OVER (PARTITION BY "student_id" ORDER BY "bus_id") AS rn
        FROM "student_buses"
      )
      DELETE FROM "student_buses" sb
      USING ranked r
      WHERE sb."student_id" = r."student_id"
        AND sb."bus_id" = r."bus_id"
        AND r.rn > 1
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_student_buses_student_id"
      ON "student_buses" ("student_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_student_buses_student_id"`);
  }
}
