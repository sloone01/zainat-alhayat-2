import { MigrationInterface, QueryRunner } from 'typeorm';

export class CourseMaterials1784600000000 implements MigrationInterface {
  name = 'CourseMaterials1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_materials" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "school_id" integer NOT NULL,
        "course_id" uuid NOT NULL,
        "title" character varying(255) NOT NULL,
        "description" text NULL,
        "original_filename" character varying(500) NOT NULL,
        "stored_filename" character varying(500) NOT NULL,
        "mime_type" character varying(150) NOT NULL,
        "file_size" integer NOT NULL,
        "file_ext" character varying(20) NOT NULL,
        "uploaded_by_user_id" uuid NULL,
        "is_visible" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "FK_course_materials_school"
          FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_materials_course"
          FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_materials_user"
          FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_materials_course"
        ON "course_materials" ("course_id")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_course_materials_school"
        ON "course_materials" ("school_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "course_materials"`);
  }
}
