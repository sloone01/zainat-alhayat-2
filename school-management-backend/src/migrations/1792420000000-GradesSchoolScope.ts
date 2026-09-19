import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Grades were global (`UQ_grades_code`), so every school saw the same list on
 * `/settings/grades`. Bind each row to a school and unique (school_id, code).
 */
export class GradesSchoolScope1792420000000 implements MigrationInterface {
  name = 'GradesSchoolScope1792420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE grades
        ADD COLUMN IF NOT EXISTS school_id uuid
    `);

    await queryRunner.query(`
      DO $fix$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_grades_code'
        ) THEN
          ALTER TABLE grades DROP CONSTRAINT "UQ_grades_code";
        END IF;
      END
      $fix$;
    `);

    // Prefer the demo Zinat school when present; otherwise any school.
    await queryRunner.query(`
      WITH owner AS (
        SELECT id
        FROM schools
        ORDER BY
          CASE WHEN id = '91d02698-72f9-45ac-9715-be10da76e8fa' THEN 0 ELSE 1 END,
          created_at NULLS LAST,
          id
        LIMIT 1
      )
      UPDATE grades g
      SET school_id = owner.id
      FROM owner
      WHERE g.school_id IS NULL
        AND EXISTS (SELECT 1 FROM owner)
    `);

    // Schools that already have payment levels but no grades: seed grades from levels.
    await queryRunner.query(`
      INSERT INTO grades (
        id, "nameEn", "nameAr", code, "displayOrder", "isActive",
        description, "createdAt", "updatedAt", school_id
      )
      SELECT
        uuid_generate_v4(),
        COALESCE(NULLIF(TRIM(spl.name), ''), spl.code),
        COALESCE(NULLIF(TRIM(spl.name), ''), spl.code),
        spl.code,
        COALESCE(spl.sort_order, 0),
        COALESCE(spl.is_active, true),
        NULL,
        NOW(),
        NOW(),
        spl.school_id
      FROM school_payment_levels spl
      WHERE NOT EXISTS (
        SELECT 1 FROM grades g WHERE g.school_id = spl.school_id
      )
      AND NOT EXISTS (
        SELECT 1
        FROM grades g2
        WHERE g2.school_id = spl.school_id
          AND LOWER(g2.code) = LOWER(spl.code)
      )
    `);

    // Clone the owner school's grades into schools that still have none.
    await queryRunner.query(`
      INSERT INTO grades (
        id, "nameEn", "nameAr", code, "displayOrder", "isActive",
        description, "createdAt", "updatedAt", school_id
      )
      SELECT
        uuid_generate_v4(),
        src."nameEn",
        src."nameAr",
        src.code,
        src."displayOrder",
        src."isActive",
        src.description,
        NOW(),
        NOW(),
        s.id
      FROM schools s
      CROSS JOIN grades src
      WHERE src.school_id IS NOT NULL
        AND s.id <> src.school_id
        AND NOT EXISTS (
          SELECT 1 FROM grades g WHERE g.school_id = s.id
        )
        AND src.school_id = (
          SELECT g3.school_id
          FROM grades g3
          WHERE g3.school_id IS NOT NULL
          ORDER BY CASE WHEN g3.school_id = '91d02698-72f9-45ac-9715-be10da76e8fa' THEN 0 ELSE 1 END, g3.school_id
          LIMIT 1
        )
    `);

    await queryRunner.query(`
      DELETE FROM grades WHERE school_id IS NULL
    `);

    await queryRunner.query(`
      ALTER TABLE grades
        ALTER COLUMN school_id SET NOT NULL
    `);

    await queryRunner.query(`
      DO $fix$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'FK_grades_school_id'
        ) THEN
          ALTER TABLE grades
            ADD CONSTRAINT "FK_grades_school_id"
            FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE;
        END IF;
      END
      $fix$;
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_grades_school_code"
      ON grades (school_id, LOWER(code))
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_grades_school_id"
      ON grades (school_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_grades_school_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_grades_school_code"`);
    await queryRunner.query(`
      ALTER TABLE grades DROP CONSTRAINT IF EXISTS "FK_grades_school_id"
    `);
    await queryRunner.query(`
      ALTER TABLE grades DROP COLUMN IF EXISTS school_id
    `);
    await queryRunner.query(`
      DO $fix$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_grades_code'
        ) THEN
          ALTER TABLE grades ADD CONSTRAINT "UQ_grades_code" UNIQUE (code);
        END IF;
      END
      $fix$;
    `);
  }
}
