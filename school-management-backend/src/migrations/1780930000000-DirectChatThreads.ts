import { MigrationInterface, QueryRunner } from 'typeorm';

export class DirectChatThreads1780930000000 implements MigrationInterface {
  name = 'DirectChatThreads1780930000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "direct_chat_threads" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_low_id" uuid NOT NULL,
        "user_high_id" uuid NOT NULL,
        "school_id" integer,
        "last_message_at" TIMESTAMP WITH TIME ZONE,
        "last_message_preview" character varying(240),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_direct_chat_threads" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_direct_chat_threads_pair" UNIQUE ("user_low_id", "user_high_id"),
        CONSTRAINT "FK_dct_user_low" FOREIGN KEY ("user_low_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_dct_user_high" FOREIGN KEY ("user_high_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_direct_chat_threads_last_at"
      ON "direct_chat_threads" ("last_message_at" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "direct_chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "thread_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_direct_chat_messages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dcm_thread" FOREIGN KEY ("thread_id") REFERENCES "direct_chat_threads"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_dcm_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_direct_chat_messages_thread_created"
      ON "direct_chat_messages" ("thread_id", "created_at")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "direct_chat_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "direct_chat_threads"`);
  }
}
