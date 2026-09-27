import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * session_media.file_type was CHECK (photo|video). PDF and Word are stored as `file`.
 */
export class SessionMediaDocumentType1792660000000 implements MigrationInterface {
  name = 'SessionMediaDocumentType1792660000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "session_media" DROP CONSTRAINT IF EXISTS "session_media_file_type_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "session_media"
        ADD CONSTRAINT "session_media_file_type_check"
        CHECK ((file_type)::text = ANY (ARRAY[
          'photo'::text,
          'video'::text,
          'file'::text
        ]))
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "session_media" WHERE "file_type" = 'file'
    `);
    await queryRunner.query(`
      ALTER TABLE "session_media" DROP CONSTRAINT IF EXISTS "session_media_file_type_check"
    `);
    await queryRunner.query(`
      ALTER TABLE "session_media"
        ADD CONSTRAINT "session_media_file_type_check"
        CHECK ((file_type)::text = ANY (ARRAY[
          'photo'::text,
          'video'::text
        ]))
    `);
  }
}
