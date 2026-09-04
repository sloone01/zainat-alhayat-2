import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Fees v2 completion: course fee links, charge sheet discounts.
 */
export class FeesV2Completion1784300000000 implements MigrationInterface {
  name = 'FeesV2Completion1784300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_fee_links" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "school_id" integer NOT NULL,
        "course_id" uuid NOT NULL,
        "fee_package_id" uuid NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_course_fee_links" PRIMARY KEY ("id"),
        CONSTRAINT "FK_course_fee_links_school" FOREIGN KEY ("school_id")
          REFERENCES "schools"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_fee_links_course" FOREIGN KEY ("course_id")
          REFERENCES "courses"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_fee_links_package" FOREIGN KEY ("fee_package_id")
          REFERENCES "fee_packages"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_course_fee_links_course" UNIQUE ("school_id", "course_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "course_fee_link_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "link_id" uuid NOT NULL,
        "charge_type_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL DEFAULT 0,
        CONSTRAINT "PK_course_fee_link_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_course_fee_link_lines_link" FOREIGN KEY ("link_id")
          REFERENCES "course_fee_links"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_course_fee_link_lines_charge" FOREIGN KEY ("charge_type_id")
          REFERENCES "payment_charge_types"("id") ON DELETE RESTRICT,
        CONSTRAINT "UQ_course_fee_link_lines" UNIQUE ("link_id", "charge_type_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheet_discount_lines" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "sheet_id" uuid NOT NULL,
        "discount_type_id" uuid NOT NULL,
        "amount" decimal(12,2) NOT NULL DEFAULT 0,
        "remarks" varchar(500) NULL,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_charge_sheet_discount_lines" PRIMARY KEY ("id"),
        CONSTRAINT "FK_scsdl_sheet" FOREIGN KEY ("sheet_id")
          REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_scsdl_discount" FOREIGN KEY ("discount_type_id")
          REFERENCES "payment_discount_types"("id") ON DELETE RESTRICT
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheet_discount_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_fee_link_lines"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "course_fee_links"`);
  }
}
