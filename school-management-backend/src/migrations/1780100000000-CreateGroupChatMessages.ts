import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGroupChatMessages1780100000000 implements MigrationInterface {
  name = 'CreateGroupChatMessages1780100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "group_chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "group_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_group_chat_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_group_chat_messages_group_created"
      ON "group_chat_messages" ("group_id", "created_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "group_chat_messages"
      ADD CONSTRAINT "FK_group_chat_messages_group"
      FOREIGN KEY ("group_id") REFERENCES "groups"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "group_chat_messages"
      ADD CONSTRAINT "FK_group_chat_messages_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "group_chat_messages"`);
  }
}
