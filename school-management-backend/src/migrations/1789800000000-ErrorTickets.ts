import { MigrationInterface, QueryRunner } from 'typeorm';

export class ErrorTickets1789800000000 implements MigrationInterface {
  name = 'ErrorTickets1789800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "error_tickets" (
        "id" SERIAL NOT NULL,
        "ticket" character varying(32) NOT NULL,
        "source" character varying(20) NOT NULL,
        "status_code" integer,
        "message" character varying(2000) NOT NULL,
        "stack" text,
        "method" character varying(10),
        "path" character varying(2000),
        "url" character varying(2000),
        "user_id" character varying(64),
        "school_id" integer,
        "request_id" character varying(64),
        "user_agent" character varying(500),
        "component" character varying(200),
        "extra" jsonb,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_error_tickets" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_error_tickets_ticket" UNIQUE ("ticket")
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_error_tickets_created_at" ON "error_tickets" ("created_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_error_tickets_created_at"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "error_tickets"`);
  }
}
