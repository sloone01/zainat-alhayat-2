import { MigrationInterface, QueryRunner } from 'typeorm';

export class FeePackages1782500000000 implements MigrationInterface {
  name = 'FeePackages1782500000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_packages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "school_id" integer NOT NULL,
        "name" character varying(200) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "year_payment_mode" character varying(32),
        "course_pricing_basis" character varying(16),
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_fee_packages" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fee_packages_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fee_packages_school_id" ON "fee_packages" ("school_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_charge_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        CONSTRAINT "PK_fee_package_charge_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_charge_types" UNIQUE ("package_id", "charge_type_id"),
        CONSTRAINT "FK_fpct_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpct_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_discount_types" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "discount_type_id" uuid NOT NULL,
        CONSTRAINT "PK_fee_package_discount_types" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_discount_types" UNIQUE ("package_id", "discount_type_id"),
        CONSTRAINT "FK_fpdt_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpdt_discount_type" FOREIGN KEY ("discount_type_id") REFERENCES "payment_discount_types"("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_installments" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "sequence" integer NOT NULL,
        "month_number" integer,
        "label" character varying(120),
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_fee_package_installments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_fpi_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fpi_package_id" ON "fee_package_installments" ("package_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_level_amounts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "level_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_fee_package_level_amounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_level_amounts" UNIQUE ("package_id", "level_id", "charge_type_id"),
        CONSTRAINT "FK_fpla_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpla_level" FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpla_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fpla_package_level" ON "fee_package_level_amounts" ("package_id", "level_id")`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fee_package_course_amounts" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "package_id" uuid NOT NULL,
        "course_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        CONSTRAINT "PK_fee_package_course_amounts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_fee_package_course_amounts" UNIQUE ("package_id", "course_id", "charge_type_id"),
        CONSTRAINT "FK_fpca_package" FOREIGN KEY ("package_id") REFERENCES "fee_packages"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpca_course" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_fpca_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_fpca_package_course" ON "fee_package_course_amounts" ("package_id", "course_id")`,
    );

    await queryRunner.query(`
      ALTER TABLE "level_payment_profiles"
      ADD COLUMN IF NOT EXISTS "fee_package_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "level_payment_profiles"
        ADD CONSTRAINT "FK_level_payment_profiles_fee_package"
        FOREIGN KEY ("fee_package_id") REFERENCES "fee_packages"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      ALTER TABLE "course_payment_profiles"
      ADD COLUMN IF NOT EXISTS "fee_package_id" uuid NULL
    `);
    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "course_payment_profiles"
        ADD CONSTRAINT "FK_course_payment_profiles_fee_package"
        FOREIGN KEY ("fee_package_id") REFERENCES "fee_packages"("id") ON DELETE SET NULL;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_payment_profiles" DROP CONSTRAINT IF EXISTS "FK_course_payment_profiles_fee_package"`,
    );
    await queryRunner.query(`ALTER TABLE "course_payment_profiles" DROP COLUMN IF EXISTS "fee_package_id"`);
    await queryRunner.query(
      `ALTER TABLE "level_payment_profiles" DROP CONSTRAINT IF EXISTS "FK_level_payment_profiles_fee_package"`,
    );
    await queryRunner.query(`ALTER TABLE "level_payment_profiles" DROP COLUMN IF EXISTS "fee_package_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_course_amounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_level_amounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_installments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_discount_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_package_charge_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fee_packages"`);
  }
}
