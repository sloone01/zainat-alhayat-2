import { MigrationInterface, QueryRunner } from 'typeorm';

export class OutboundMessageTransactions1792210000000 implements MigrationInterface {
  name = 'OutboundMessageTransactions1792210000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "outbound_message_transactions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" uuid,
        "channel" character varying(16) NOT NULL,
        "status" character varying(16) NOT NULL,
        "to_address" character varying(320) NOT NULL,
        "subject" character varying(500),
        "body_html" text,
        "body_text" text,
        "template_key" character varying(120),
        "recipient_user_id" uuid,
        "error_message" text,
        "provider_message_id" character varying(255),
        "source" character varying(64),
        "resent_from_id" uuid,
        "sent_at" TIMESTAMPTZ,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_outbound_message_transactions" PRIMARY KEY ("id"),
        CONSTRAINT "FK_outbound_msg_tx_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_outbound_msg_tx_recipient" FOREIGN KEY ("recipient_user_id") REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_outbound_msg_tx_resent_from" FOREIGN KEY ("resent_from_id") REFERENCES "outbound_message_transactions"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_outbound_msg_tx_school_created"
      ON "outbound_message_transactions" ("school_id", "created_at")
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_outbound_msg_tx_channel_status"
      ON "outbound_message_transactions" ("channel", "status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_outbound_msg_tx_channel_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_outbound_msg_tx_school_created"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "outbound_message_transactions"`);
  }
}
