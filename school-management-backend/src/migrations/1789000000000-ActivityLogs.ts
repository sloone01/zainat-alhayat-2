import { MigrationInterface, QueryRunner } from 'typeorm';

export class ActivityLogs1789000000000 implements MigrationInterface {
  name = 'ActivityLogs1789000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "activity_logs" (
        "id" SERIAL NOT NULL,
        "user_id" uuid,
        "username" character varying(100),
        "user_role" character varying(50),
        "school_id" integer,
        "method" character varying(10) NOT NULL,
        "path" character varying(500) NOT NULL,
        "status_code" integer NOT NULL,
        "duration_ms" integer NOT NULL DEFAULT 0,
        "ip" character varying(64),
        "user_agent" character varying(500),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_logs" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_logs_created_at" ON "activity_logs" ("created_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_activity_logs_user_id" ON "activity_logs" ("user_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_logs_user_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_activity_logs_created_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_logs"`);
  }
}
