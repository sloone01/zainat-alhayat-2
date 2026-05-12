import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateOnlineVideoSessions1780400000000 implements MigrationInterface {
  name = 'CreateOnlineVideoSessions1780400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "online_video_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "schedule_id" uuid NOT NULL,
        "week_start_date" date NOT NULL,
        "session_date" date NOT NULL,
        "provider" character varying(32) NOT NULL DEFAULT 'daily',
        "room_name" character varying(128) NOT NULL,
        "room_url" text NOT NULL,
        "recording_id" character varying(255),
        "recording_url" text,
        "created_by" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_online_video_sessions" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_online_video_sessions_schedule_session_date" UNIQUE ("schedule_id", "session_date"),
        CONSTRAINT "FK_online_video_sessions_schedule" FOREIGN KEY ("schedule_id") REFERENCES "schedules"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_online_video_sessions_created_by" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_online_video_sessions_session_date"
      ON "online_video_sessions" ("session_date")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "online_session_presence" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "online_session_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "display_name" character varying(255),
        "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "left_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_online_session_presence" PRIMARY KEY ("id"),
        CONSTRAINT "FK_online_session_presence_session" FOREIGN KEY ("online_session_id") REFERENCES "online_video_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_online_session_presence_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_online_session_presence_session"
      ON "online_session_presence" ("online_session_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "online_session_presence"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "online_video_sessions"`);
  }
}
