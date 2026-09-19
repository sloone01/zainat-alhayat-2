import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSupportRequests1792460000000 implements MigrationInterface {
  name = 'CreateSupportRequests1792460000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS support_requests (
        id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        school_id uuid NULL,
        user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title varchar(200) NOT NULL,
        description_html text NOT NULL,
        status varchar(20) NOT NULL DEFAULT 'open',
        created_at timestamp NOT NULL DEFAULT now(),
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_support_requests_school_id ON support_requests (school_id)`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS idx_support_requests_user_id ON support_requests (user_id)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS support_requests`);
  }
}
