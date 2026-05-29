import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Repairs payment_transactions if 178330 created recorded_by_user_id as integer
 * (users.id is uuid). Safe to run on fresh DBs (no-op).
 */
export class FixPaymentTransactionRecordedByUuid1783310000000 implements MigrationInterface {
  name = 'FixPaymentTransactionRecordedByUuid1783310000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const hasTable = await queryRunner.query(`
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public' AND table_name = 'payment_transactions'
    `);
    if (!hasTable?.length) return;

    const col = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'payment_transactions'
        AND column_name = 'recorded_by_user_id'
    `);
    const dataType = col?.[0]?.data_type as string | undefined;
    if (dataType !== 'integer' && dataType !== 'bigint') return;

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      DROP CONSTRAINT IF EXISTS "FK_pt_recorded_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      ALTER COLUMN "recorded_by_user_id" DROP DEFAULT
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      ALTER COLUMN "recorded_by_user_id" TYPE uuid USING NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      ADD CONSTRAINT "FK_pt_recorded_by"
      FOREIGN KEY ("recorded_by_user_id") REFERENCES "users"("id")
      ON DELETE SET NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const col = await queryRunner.query(`
      SELECT data_type FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'payment_transactions'
        AND column_name = 'recorded_by_user_id'
    `);
    if (col?.[0]?.data_type !== 'uuid') return;

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      DROP CONSTRAINT IF EXISTS "FK_pt_recorded_by"
    `);

    await queryRunner.query(`
      ALTER TABLE "payment_transactions"
      ALTER COLUMN "recorded_by_user_id" TYPE integer USING NULL
    `);
  }
}
