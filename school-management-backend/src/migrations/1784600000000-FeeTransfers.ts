import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeeTransfers1784600000000 implements MigrationInterface {
  name = 'FeeTransfers1784600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
        ADD COLUMN IF NOT EXISTS "transfer_id" uuid NULL
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_transfers" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "status" varchar(24) NOT NULL DEFAULT 'pending_school',
        "reference" varchar(120) NULL,
        "notes" varchar(500) NULL,
        "total_amount" decimal(12,3) NOT NULL DEFAULT 0,
        "created_by" uuid NULL,
        "reviewed_by" uuid NULL,
        "reviewed_at" TIMESTAMPTZ NULL,
        "review_notes" varchar(500) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fee_transfers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fee_transfers_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fee_transfers_created_by" FOREIGN KEY ("created_by")
          REFERENCES "users"("id") ON DELETE SET NULL,
        CONSTRAINT "FK_fee_transfers_reviewed_by" FOREIGN KEY ("reviewed_by")
          REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_transfer_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "transfer_id" uuid NOT NULL,
        "payment_id" uuid NOT NULL,
        CONSTRAINT "PK_fee_transfer_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_ftl_transfer" FOREIGN KEY ("transfer_id")
          REFERENCES "fee_transfers"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_ftl_payment" FOREIGN KEY ("payment_id")
          REFERENCES "student_fee_payments"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
        DROP CONSTRAINT IF EXISTS "FK_sfp_transfer"
    `);
    await queryRunner.query(`
      ALTER TABLE "student_fee_payments"
        ADD CONSTRAINT "FK_sfp_transfer" FOREIGN KEY ("transfer_id")
          REFERENCES "fee_transfers"("id") ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_fee_payments" DROP CONSTRAINT IF EXISTS "FK_sfp_transfer"`);
    await queryRunner.query(`ALTER TABLE "student_fee_payments" DROP COLUMN IF EXISTS "transfer_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_transfer_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_transfers"`);
  }
}
