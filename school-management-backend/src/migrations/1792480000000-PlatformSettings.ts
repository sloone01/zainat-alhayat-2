import { MigrationInterface, QueryRunner } from 'typeorm';

export class PlatformSettings1792480000000 implements MigrationInterface {
  name = 'PlatformSettings1792480000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS platform_settings (
        key varchar(100) PRIMARY KEY,
        value jsonb NOT NULL,
        updated_by uuid NULL,
        updated_at timestamp NOT NULL DEFAULT now()
      )
    `);
    // Online payments (Thawani) start enabled; super admin can switch them off.
    await queryRunner.query(`
      INSERT INTO platform_settings (key, value)
      VALUES ('thawani_enabled', 'true'::jsonb)
      ON CONFLICT (key) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS platform_settings`);
  }
}
