import { MigrationInterface, QueryRunner } from 'typeorm';

export class SignupEmailOtps1792300000000 implements MigrationInterface {
  name = 'SignupEmailOtps1792300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "signup_email_otps" (
        "email" varchar(255) PRIMARY KEY,
        "code_hash" varchar(64) NOT NULL,
        "expires_at" timestamptz NOT NULL,
        "last_sent_at" timestamptz NOT NULL,
        "attempts" int NOT NULL DEFAULT 0,
        "verification_token" varchar(64),
        "verification_expires_at" timestamptz
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "signup_email_otps"`);
  }
}
