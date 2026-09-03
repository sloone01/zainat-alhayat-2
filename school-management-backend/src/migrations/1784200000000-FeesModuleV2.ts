import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fees v2: independent packages, module linking, installment plans, student charge sheets.
 */
export class FeesModuleV21784200000000 implements MigrationInterface {
  name = 'FeesModuleV21784200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "fee_package_charge_types"
      ADD COLUMN IF NOT EXISTS "payment_timing" varchar(16) NOT NULL DEFAULT 'installment'
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_charge_types"
      ADD COLUMN IF NOT EXISTS "billing_frequency" varchar(16) NOT NULL DEFAULT 'per_year'
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_charge_types"
      ADD CONSTRAINT "CHK_fpkg_charge_payment_timing"
      CHECK ("payment_timing" IN ('upfront', 'installment'))
    `);
    await queryRunner.query(`
      ALTER TABLE "fee_package_charge_types"
      ADD CONSTRAINT "CHK_fpkg_charge_billing_frequency"
      CHECK ("billing_frequency" IN ('per_year', 'once_only'))
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "installment_plans" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "name" varchar(200) NOT NULL,
        "description" text NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_installment_plans" PRIMARY KEY ("id"),
        CONSTRAINT "FK_installment_plans_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "installment_plan_entries" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "plan_id" uuid NOT NULL,
        "sequence" integer NOT NULL,
        "month_number" integer NULL,
        "label" varchar(120) NULL,
        "weight" decimal(8,4) NOT NULL DEFAULT 1,
        CONSTRAINT "PK_installment_plan_entries" PRIMARY KEY ("id"),
        CONSTRAINT "FK_installment_plan_entries_plan" FOREIGN KEY ("plan_id")
          REFERENCES "installment_plans"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_installment_plan_entries_seq" UNIQUE ("plan_id", "sequence")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grade_fee_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "level_id" uuid NOT NULL,
        "fee_package_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grade_fee_links" PRIMARY KEY ("id"),
        CONSTRAINT "FK_grade_fee_links_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_grade_fee_links_level" FOREIGN KEY ("level_id")
          REFERENCES "school_payment_levels"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_grade_fee_links_package" FOREIGN KEY ("fee_package_id")
          REFERENCES "fee_packages"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_grade_fee_links_level" UNIQUE ("school_id", "level_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grade_fee_link_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "link_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_grade_fee_link_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_grade_fee_link_lines_link" FOREIGN KEY ("link_id")
          REFERENCES "grade_fee_links"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_grade_fee_link_lines_charge" FOREIGN KEY ("charge_type_id")
          REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_grade_fee_link_lines" UNIQUE ("link_id", "charge_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bus_fee_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "bus_id" uuid NOT NULL,
        "fee_package_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bus_fee_links" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bus_fee_links_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bus_fee_links_bus" FOREIGN KEY ("bus_id")
          REFERENCES "buses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bus_fee_links_package" FOREIGN KEY ("fee_package_id")
          REFERENCES "fee_packages"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_bus_fee_links_bus" UNIQUE ("school_id", "bus_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "bus_fee_link_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "link_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_bus_fee_link_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_bus_fee_link_lines_link" FOREIGN KEY ("link_id")
          REFERENCES "bus_fee_links"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_bus_fee_link_lines_charge" FOREIGN KEY ("charge_type_id")
          REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_bus_fee_link_lines" UNIQUE ("link_id", "charge_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "student_id" uuid NOT NULL,
        "school_id" integer NOT NULL,
        "academic_year_id" uuid NOT NULL,
        "installment_plan_id" uuid NULL,
        "currency" varchar(3) NOT NULL DEFAULT 'OMR',
        "list_total" decimal(12,2) NOT NULL DEFAULT 0,
        "due_total" decimal(12,2) NOT NULL DEFAULT 0,
        "paid_total" decimal(12,2) NOT NULL DEFAULT 0,
        "discount_total" decimal(12,2) NOT NULL DEFAULT 0,
        "upfront_due" decimal(12,2) NOT NULL DEFAULT 0,
        "installment_due" decimal(12,2) NOT NULL DEFAULT 0,
        "status" varchar(32) NOT NULL DEFAULT 'draft',
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_charge_sheets" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_charge_sheets_student" FOREIGN KEY ("student_id")
          REFERENCES "students"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_charge_sheets_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_charge_sheets_year" FOREIGN KEY ("academic_year_id")
          REFERENCES "academic_years"("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_student_charge_sheets_plan" FOREIGN KEY ("installment_plan_id")
          REFERENCES "installment_plans"("id") ON DELETE SET NULL,
        CONSTRAINT "UQ_student_charge_sheets_student_year" UNIQUE ("student_id", "academic_year_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheet_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sheet_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "source_type" varchar(16) NOT NULL,
        "source_ref_id" uuid NULL,
        "charge_label" varchar(255) NOT NULL,
        "payment_timing" varchar(16) NOT NULL DEFAULT 'installment',
        "billing_frequency" varchar(16) NOT NULL DEFAULT 'per_year',
        "list_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "due_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "paid_amount" decimal(12,2) NOT NULL DEFAULT 0,
        "status" varchar(16) NOT NULL DEFAULT 'pending',
        "sort_order" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_student_charge_sheet_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_charge_sheet_lines_sheet" FOREIGN KEY ("sheet_id")
          REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_student_charge_sheet_lines_charge" FOREIGN KEY ("charge_type_id")
          REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "CHK_scsl_source_type" CHECK ("source_type" IN ('grade', 'bus', 'course')),
        CONSTRAINT "CHK_scsl_status" CHECK ("status" IN ('pending', 'paid', 'waived'))
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheet_installments" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sheet_id" uuid NOT NULL,
        "sequence" integer NOT NULL,
        "month_number" integer NULL,
        "label" varchar(120) NULL,
        "amount_due" decimal(12,2) NOT NULL DEFAULT 0,
        "amount_paid" decimal(12,2) NOT NULL DEFAULT 0,
        "status" varchar(16) NOT NULL DEFAULT 'pending',
        CONSTRAINT "PK_student_charge_sheet_installments" PRIMARY KEY ("id"),
        CONSTRAINT "FK_student_charge_sheet_installments_sheet" FOREIGN KEY ("sheet_id")
          REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "UQ_student_charge_sheet_installments_seq" UNIQUE ("sheet_id", "sequence"),
        CONSTRAINT "CHK_scsi_status" CHECK ("status" IN ('pending', 'paid', 'partial'))
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_student_charge_sheets_school"
      ON "student_charge_sheets" ("school_id", "academic_year_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheet_installments"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheet_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bus_fee_link_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bus_fee_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grade_fee_link_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "grade_fee_links"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "installment_plan_entries"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "installment_plans"`);
    await queryRunner.query(
      `ALTER TABLE "fee_package_charge_types" DROP CONSTRAINT IF EXISTS "CHK_fpkg_charge_billing_frequency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_package_charge_types" DROP CONSTRAINT IF EXISTS "CHK_fpkg_charge_payment_timing"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_package_charge_types" DROP COLUMN IF EXISTS "billing_frequency"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fee_package_charge_types" DROP COLUMN IF EXISTS "payment_timing"`,
    );
  }
}
