import { MigrationInterface, QueryRunner } from 'typeorm';

export class SchoolMessageLetterFiles1792340000000 implements MigrationInterface {
  name = 'SchoolMessageLetterFiles1792340000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_message_letter_files" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "letter_id" uuid NOT NULL,
        "school_id" uuid NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "stored_path" character varying(500) NOT NULL,
        "mime_type" character varying(120) NOT NULL,
        "size_bytes" integer NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_message_letter_files" PRIMARY KEY ("id"),
        CONSTRAINT "FK_school_message_letter_files_letter"
          FOREIGN KEY ("letter_id") REFERENCES "school_message_letters"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_school_message_letter_files_letter" ON "school_message_letter_files" ("letter_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "school_message_letter_files"`);
  }
}
