import { MigrationInterface, QueryRunner } from 'typeorm';

export class InstallmentDueDates1784700000000 implements MigrationInterface {
  name = 'InstallmentDueDates1784700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "schools"
        ADD COLUMN IF NOT EXISTS "installment_due_day" smallint NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheet_installments"
        ADD COLUMN IF NOT EXISTS "due_date" date NULL
    `);
    await queryRunner.query(`
      UPDATE "student_charge_sheet_installments" AS i
      SET "due_date" = (
        make_date(
          CASE
            WHEN i.month_number >= EXTRACT(MONTH FROM y.start_date)::int
              THEN EXTRACT(YEAR FROM y.start_date)::int
            ELSE EXTRACT(YEAR FROM y.end_date)::int
          END,
          i.month_number,
          LEAST(
            COALESCE(sch.installment_due_day, 31),
            EXTRACT(
              DAY FROM (
                make_date(
                  CASE
                    WHEN i.month_number >= EXTRACT(MONTH FROM y.start_date)::int
                      THEN EXTRACT(YEAR FROM y.start_date)::int
                    ELSE EXTRACT(YEAR FROM y.end_date)::int
                  END,
                  i.month_number,
                  1
                ) + INTERVAL '1 month' - INTERVAL '1 day'
              )
            )::int
          )
        )
      )
      FROM "student_charge_sheets" s
      JOIN "academic_years" y ON y.id = s.academic_year_id
      JOIN "schools" sch ON sch.id = s.school_id
      WHERE i.sheet_id = s.id
        AND i.month_number IS NOT NULL
        AND i.month_number BETWEEN 1 AND 12
        AND i.due_date IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheet_installments"
        DROP COLUMN IF EXISTS "due_date"
    `);
    await queryRunner.query(`
      ALTER TABLE "schools"
        DROP COLUMN IF EXISTS "installment_due_day"
    `);
  }
}
