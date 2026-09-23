import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachments1792520000000 implements MigrationInterface {
  name = 'CreateAttachments1792520000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachments (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        file_name varchar(255) NOT NULL,
        stored_name varchar(255) NOT NULL UNIQUE,
        mime_type varchar(100) NOT NULL,
        size_bytes bigint NOT NULL,
        url varchar(500) NOT NULL,
        checksum varchar(64) NULL,
        uploaded_by uuid NULL,
        school_id uuid NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        updated_at timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS attachment_links (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        attachment_id uuid NOT NULL REFERENCES attachments(id) ON DELETE CASCADE,
        entity_type varchar(40) NOT NULL,
        entity_id uuid NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT uq_attachment_links_attachment_entity UNIQUE (attachment_id, entity_type, entity_id)
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_attachment_links_entity
      ON attachment_links (entity_type, entity_id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS attachment_links`);
    await queryRunner.query(`DROP TABLE IF EXISTS attachments`);
  }
}
