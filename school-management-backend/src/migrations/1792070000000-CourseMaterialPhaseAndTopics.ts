import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseMaterialPhaseAndTopics1792070000000 implements MigrationInterface {
  name = 'CourseMaterialPhaseAndTopics1792070000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_material_topics" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "school_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_course_material_topics_school"
          FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_material_topics_course"
          FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_material_topics_course"
        ON "course_material_topics" ("course_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_material_topics_school"
        ON "course_material_topics" ("school_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "course_materials"
        ADD COLUMN IF NOT EXISTS "phase_id" uuid NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "course_materials"
        ADD COLUMN IF NOT EXISTS "topic_id" uuid NULL
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "course_materials"
          ADD CONSTRAINT "FK_course_materials_phase"
          FOREIGN KEY ("phase_id") REFERENCES "phases"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "course_materials"
          ADD CONSTRAINT "FK_course_materials_topic"
          FOREIGN KEY ("topic_id") REFERENCES "course_material_topics"("id") ON DELETE SET NULL;
      EXCEPTION WHEN duplicate_object THEN NULL;
      END $$
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_materials_phase"
        ON "course_materials" ("phase_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_materials_topic"
        ON "course_materials" ("topic_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "course_materials" DROP CONSTRAINT IF EXISTS "FK_course_materials_topic"`);
    await queryRunner.query(`ALTER TABLE "course_materials" DROP CONSTRAINT IF EXISTS "FK_course_materials_phase"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_course_materials_topic"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_course_materials_phase"`);
    await queryRunner.query(`ALTER TABLE "course_materials" DROP COLUMN IF EXISTS "topic_id"`);
    await queryRunner.query(`ALTER TABLE "course_materials" DROP COLUMN IF EXISTS "phase_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_material_topics"`);
  }
}
