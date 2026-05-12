import { MigrationInterface, QueryRunner } from 'typeorm';

export class MeetingRooms1781000000000 implements MigrationInterface {
  name = 'MeetingRooms1781000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meeting_rooms" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "title" character varying(255) NOT NULL,
        "provider" character varying(32) NOT NULL DEFAULT 'daily',
        "room_name" character varying(128) NOT NULL,
        "room_url" text NOT NULL,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_meeting_rooms" PRIMARY KEY ("id"),
        CONSTRAINT "FK_meeting_rooms_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_meeting_rooms_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_meeting_rooms_school_created"
      ON "meeting_rooms" ("school_id", "created_at" DESC)
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "meeting_room_invitees" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "meeting_room_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        CONSTRAINT "PK_meeting_room_invitees" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_meeting_room_invitee_room_user" UNIQUE ("meeting_room_id", "user_id"),
        CONSTRAINT "FK_meeting_room_invitees_room" FOREIGN KEY ("meeting_room_id") REFERENCES "meeting_rooms"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_meeting_room_invitees_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_meeting_room_invitees_user"
      ON "meeting_room_invitees" ("user_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "meeting_room_invitees"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "meeting_rooms"`);
  }
}
