import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolMessageLetters1781060000000 implements MigrationInterface {
  name = 'SchoolMessageLetters1781060000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_message_letters" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "title" character varying(200) NOT NULL,
        "audience" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "subject_en" text NOT NULL,
        "subject_ar" text NOT NULL,
        "body_html_en" text NOT NULL,
        "body_html_ar" text NOT NULL,
        "body_sms_en" text,
        "body_sms_ar" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_message_letters" PRIMARY KEY ("id"),
        CONSTRAINT "FK_school_message_letters_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_school_message_letters_school" ON "school_message_letters" ("school_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_message_letters"`);
  }
}
