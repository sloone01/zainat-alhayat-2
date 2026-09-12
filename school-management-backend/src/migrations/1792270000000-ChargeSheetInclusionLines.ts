import { MigrationInterface, QueryRunner } from 'typeorm';

export class ChargeSheetInclusionLines1792270000000 implements MigrationInterface {
  name = 'ChargeSheetInclusionLines1792270000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets"
      ADD COLUMN IF NOT EXISTS "custom_inclusions" boolean NOT NULL DEFAULT false
    `);
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_charge_sheet_inclusion_lines" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sheet_id" uuid NOT NULL,
        "inclusion_type_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_student_charge_sheet_inclusion_lines" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_sheet_inclusion_type" UNIQUE ("sheet_id", "inclusion_type_id"),
        CONSTRAINT "FK_sheet_inclusion_sheet" FOREIGN KEY ("sheet_id")
          REFERENCES "student_charge_sheets"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_sheet_inclusion_type" FOREIGN KEY ("inclusion_type_id")
          REFERENCES "payment_inclusion_types"("id") ON DELETE RESTRICT
      )
    `);
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_sheet_inclusion_sheet"
      ON "student_charge_sheet_inclusion_lines" ("sheet_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_charge_sheet_inclusion_lines"`);
    await queryRunner.query(`
      ALTER TABLE "student_charge_sheets" DROP COLUMN IF EXISTS "custom_inclusions"
    `);
  }
}
