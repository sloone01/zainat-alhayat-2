import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Per-user last-read cursor for group / ad-hoc / bus chat rooms.
 * Unread = last message after last_read_at (no per-message receipts).
 */
export class ChatRoomReadStates1792180000000 implements MigrationInterface {
  name = 'ChatRoomReadStates1792180000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_room_read_states" (
        "user_id" uuid NOT NULL,
        "room_id" uuid NOT NULL,
        "last_read_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_room_read_states" PRIMARY KEY ("user_id", "room_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_chat_room_read_states_user"
      ON "chat_room_read_states" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "chat_room_read_states"
      ADD CONSTRAINT "FK_chat_room_read_states_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_room_read_states"`);
  }
}
