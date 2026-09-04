import { MigrationInterface, QueryRunner } from 'typeorm';

export class DirectChatMessageMetadata1782700000000 implements MigrationInterface {
  name = 'DirectChatMessageMetadata1782700000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "direct_chat_messages"
      ADD COLUMN IF NOT EXISTS "metadata" jsonb NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "direct_chat_messages"
      DROP COLUMN IF EXISTS "metadata"
    `);
  }
}
