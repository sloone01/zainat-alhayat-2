import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Production `/students` failed with:
 *   column Student__Student_parents.student_id does not exist
 *
 * TypeORM default join names (`studentsId` / `parentsId`) or camelCase
 * (`studentId`) leave the table without `student_id`. Rename if needed.
 * Same for `student_buses` pickup join.
 */
export class NormalizeStudentJoinTableColumns1792360000000 implements MigrationInterface {
  name = 'NormalizeStudentJoinTableColumns1792360000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $fix$
      BEGIN
        IF to_regclass('public.student_parents') IS NOT NULL THEN
          -- student_id
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'student_id'
          ) THEN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'studentsId'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN "studentsId" TO student_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'studentId'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN "studentId" TO student_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'students_id'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN students_id TO student_id;
            END IF;
          END IF;

          -- parent_id
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'parent_id'
          ) THEN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'parentsId'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN "parentsId" TO parent_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'parentId'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN "parentId" TO parent_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_parents' AND column_name = 'parents_id'
            ) THEN
              ALTER TABLE student_parents RENAME COLUMN parents_id TO parent_id;
            END IF;
          END IF;
        END IF;

        IF to_regclass('public.student_buses') IS NOT NULL THEN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'student_id'
          ) THEN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'studentsId'
            ) THEN
              ALTER TABLE student_buses RENAME COLUMN "studentsId" TO student_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'studentId'
            ) THEN
              ALTER TABLE student_buses RENAME COLUMN "studentId" TO student_id;
            END IF;
          END IF;

          IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'bus_id'
          ) THEN
            IF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'busesId'
            ) THEN
              ALTER TABLE student_buses RENAME COLUMN "busesId" TO bus_id;
            ELSIF EXISTS (
              SELECT 1 FROM information_schema.columns
              WHERE table_schema = 'public' AND table_name = 'student_buses' AND column_name = 'busId'
            ) THEN
              ALTER TABLE student_buses RENAME COLUMN "busId" TO bus_id;
            END IF;
          END IF;
        END IF;
      END
      $fix$;
    `);
  }

  public async down(): Promise<void> {
    // Irreversible rename-if-needed; local/prod already on student_id stay unchanged.
  }
}
