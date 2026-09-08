import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * rbac_roles.id was created as a bare `uuid PRIMARY KEY` with no default, but the
 * entity declares @PrimaryGeneratedColumn('uuid') and leaves generation to Postgres.
 * Every insert that did not set an id explicitly failed with a not-null violation,
 * which broke school approval (ensureSchoolStaffDefaults).
 */
export class RbacRolesIdDefault1789100000000 implements MigrationInterface {
  name = 'RbacRolesIdDefault1789100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(
      `ALTER TABLE "rbac_roles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rbac_roles" ALTER COLUMN "id" DROP DEFAULT`);
  }
}
