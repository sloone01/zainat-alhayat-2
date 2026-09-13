import { MigrationInterface, QueryRunner } from 'typeorm';

/** Prefer a DB default when an existing uuid function is available. App also sets id. */
export class RbacRolesIdDefault1786200000000 implements MigrationInterface {
  name = 'RbacRolesIdDefault1786200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uuid_generate_v4') THEN
          ALTER TABLE "rbac_roles" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4();
        ELSIF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'gen_random_uuid') THEN
          ALTER TABLE "rbac_roles" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "rbac_roles" ALTER COLUMN "id" DROP DEFAULT`);
  }
}

