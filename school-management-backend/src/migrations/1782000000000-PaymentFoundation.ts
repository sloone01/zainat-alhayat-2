import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Payment foundation: school levels, charge/discount catalogs,
 * per-level payment profiles (per-year / per-course, one-time vs installments),
 * group → level FK.
 */
export class PaymentFoundation1782000000000 implements MigrationInterface {
  name = 'PaymentFoundation1782000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "school_payment_levels" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "code" character varying(64) NOT NULL,
        "name" character varying(255) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_school_payment_levels" PRIMARY KEY ("id"),
        CONSTRAINT "FK_school_payment_levels_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_school_payment_levels_school_code" UNIQUE ("school_id", "code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_school_payment_levels_school"
      ON "school_payment_levels" ("school_id", "is_active", "sort_order")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_charge_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "code" character varying(64) NOT NULL,
        "label" character varying(255) NOT NULL,
        "value" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_charge_types" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_charge_types_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_payment_charge_types_school_code" UNIQUE ("school_id", "code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_charge_types_school"
      ON "payment_charge_types" ("school_id", "is_active")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "payment_discount_types" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "code" character varying(64) NOT NULL,
        "label" character varying(255) NOT NULL,
        "value" character varying(255),
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_payment_discount_types" PRIMARY KEY ("id"),
        CONSTRAINT "FK_payment_discount_types_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_payment_discount_types_school_code" UNIQUE ("school_id", "code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_payment_discount_types_school"
      ON "payment_discount_types" ("school_id", "is_active")
    `);

    await queryRunner.query(`
      ALTER TABLE "groups"
      ADD COLUMN IF NOT EXISTS "level_id" uuid
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        ALTER TABLE "groups"
        ADD CONSTRAINT "FK_groups_school_payment_level"
        FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_groups_level_id" ON "groups" ("level_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "level_payment_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "level_id" uuid NOT NULL,
        "pricing_model" character varying(32) NOT NULL DEFAULT 'per_year',
        "year_payment_mode" character varying(32),
        "year_total_amount" numeric(12,2),
        "currency" character varying(3) NOT NULL DEFAULT 'OMR',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_level_payment_profiles" PRIMARY KEY ("id"),
        CONSTRAINT "FK_level_payment_profiles_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_level_payment_profiles_level" FOREIGN KEY ("level_id") REFERENCES "school_payment_levels"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "CHK_level_payment_profiles_pricing_model" CHECK ("pricing_model" IN ('per_year', 'per_course')),
        CONSTRAINT "CHK_level_payment_profiles_year_mode" CHECK ("year_payment_mode" IS NULL OR "year_payment_mode" IN ('one_time', 'installments')),
        CONSTRAINT "UQ_level_payment_profiles_school_level" UNIQUE ("school_id", "level_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "level_payment_charge_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profile_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_level_payment_charge_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_level_payment_charge_lines_profile" FOREIGN KEY ("profile_id") REFERENCES "level_payment_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_level_payment_charge_lines_charge_type" FOREIGN KEY ("charge_type_id") REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT ON UPDATE NO ACTION,
        CONSTRAINT "UQ_level_payment_charge_lines_profile_type" UNIQUE ("profile_id", "charge_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "level_payment_installments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "profile_id" uuid NOT NULL,
        "sequence" integer NOT NULL,
        "month_number" smallint,
        "label" character varying(100),
        "amount" numeric(12,2) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_level_payment_installments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_level_payment_installments_profile" FOREIGN KEY ("profile_id") REFERENCES "level_payment_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "UQ_level_payment_installments_profile_sequence" UNIQUE ("profile_id", "sequence")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "level_payment_profile_discounts" (
        "profile_id" uuid NOT NULL,
        "discount_type_id" uuid NOT NULL,
        CONSTRAINT "PK_level_payment_profile_discounts" PRIMARY KEY ("profile_id", "discount_type_id"),
        CONSTRAINT "FK_lppd_profile" FOREIGN KEY ("profile_id") REFERENCES "level_payment_profiles"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_lppd_discount" FOREIGN KEY ("discount_type_id") REFERENCES "payment_discount_types"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "level_payment_profile_discounts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "level_payment_installments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "level_payment_charge_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "level_payment_profiles"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP CONSTRAINT IF EXISTS "FK_groups_school_payment_level"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_groups_level_id"`);
    await queryRunner.query(`ALTER TABLE "groups" DROP COLUMN IF EXISTS "level_id"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_discount_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payment_charge_types"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "school_payment_levels"`);
  }
}
