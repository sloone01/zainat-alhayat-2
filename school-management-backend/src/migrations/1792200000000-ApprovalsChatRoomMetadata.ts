import { MigrationInterface, QueryRunner } from 'typeorm';

export class ApprovalsChatRoomMetadata1792200000000 implements MigrationInterface {
  name = 'ApprovalsChatRoomMetadata1792200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_messages"
      ADD COLUMN IF NOT EXISTS "metadata" jsonb
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_adhoc_chat_rooms_school_approvals"
      ON "adhoc_chat_rooms" ("school_id")
      WHERE "kind" = 'approvals'
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_messages_target_user"
      ON "adhoc_chat_messages" ((metadata->>'targetUserId'))
      WHERE metadata->>'kind' = 'message_letter'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_adhoc_chat_messages_target_user"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_adhoc_chat_rooms_school_approvals"`);
    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_messages"
      DROP COLUMN IF EXISTS "metadata"
    `);
  }
}
