import { MigrationInterface, QueryRunner } from 'typeorm';

export class AdhocChatRooms1785800000000 implements MigrationInterface {
  name = 'AdhocChatRooms1785800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "adhoc_chat_rooms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" int NOT NULL,
        "name" varchar(255) NOT NULL,
        "description" text,
        "kind" varchar(16) NOT NULL DEFAULT 'adhoc',
        "bus_id" uuid,
        "created_by_user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_adhoc_chat_rooms" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "UQ_adhoc_chat_rooms_bus"
      ON "adhoc_chat_rooms" ("bus_id")
      WHERE "bus_id" IS NOT NULL
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_rooms_school"
      ON "adhoc_chat_rooms" ("school_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_rooms"
      ADD CONSTRAINT "FK_adhoc_chat_rooms_school"
      FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_rooms"
      ADD CONSTRAINT "FK_adhoc_chat_rooms_bus"
      FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_rooms"
      ADD CONSTRAINT "FK_adhoc_chat_rooms_creator"
      FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "adhoc_chat_room_members" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "room_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_adhoc_chat_room_members" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_adhoc_chat_room_members_room_user" UNIQUE ("room_id", "user_id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_room_members_room"
      ON "adhoc_chat_room_members" ("room_id")
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_room_members_user"
      ON "adhoc_chat_room_members" ("user_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_room_members"
      ADD CONSTRAINT "FK_adhoc_chat_room_members_room"
      FOREIGN KEY ("room_id") REFERENCES "adhoc_chat_rooms"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_room_members"
      ADD CONSTRAINT "FK_adhoc_chat_room_members_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "adhoc_chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "room_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "body" text NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_adhoc_chat_messages" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_adhoc_chat_messages_room_created"
      ON "adhoc_chat_messages" ("room_id", "created_at")
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_messages"
      ADD CONSTRAINT "FK_adhoc_chat_messages_room"
      FOREIGN KEY ("room_id") REFERENCES "adhoc_chat_rooms"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "adhoc_chat_messages"
      ADD CONSTRAINT "FK_adhoc_chat_messages_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "adhoc_chat_messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "adhoc_chat_room_members"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "adhoc_chat_rooms"`);
  }
}
