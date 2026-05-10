import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGradesTable1780200000000 implements MigrationInterface {
  name = 'CreateGradesTable1780200000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "grades" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "nameEn" character varying(100) NOT NULL,
        "nameAr" character varying(100) NOT NULL,
        "code" character varying(50) NOT NULL,
        "displayOrder" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "description" text,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_grades" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_grades_code" UNIQUE ("code")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_grades_display_order"
      ON "grades" ("displayOrder")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "grades"`);
  }
}
