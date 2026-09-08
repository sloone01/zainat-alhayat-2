import { MigrationInterface, QueryRunner } from 'typeorm';

export class StudentParentRelationship1785900000000 implements MigrationInterface {
  name = 'StudentParentRelationship1785900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE student_parents
      ADD COLUMN IF NOT EXISTS relationship character varying(20) NOT NULL DEFAULT 'guardian'
    `);
    await queryRunner.query(`
      ALTER TABLE parents
      ADD COLUMN IF NOT EXISTS tribe character varying(100),
      ADD COLUMN IF NOT EXISTS workplace character varying(255),
      ADD COLUMN IF NOT EXISTS work_phone character varying(30),
      ADD COLUMN IF NOT EXISTS marital_status character varying(30),
      ADD COLUMN IF NOT EXISTS organization_name character varying(255),
      ADD COLUMN IF NOT EXISTS responsible_person character varying(255),
      ADD COLUMN IF NOT EXISTS responsible_phone character varying(30)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE parents
      DROP COLUMN IF EXISTS tribe,
      DROP COLUMN IF EXISTS workplace,
      DROP COLUMN IF EXISTS work_phone,
      DROP COLUMN IF EXISTS marital_status,
      DROP COLUMN IF EXISTS organization_name,
      DROP COLUMN IF EXISTS responsible_person,
      DROP COLUMN IF EXISTS responsible_phone
    `);
    await queryRunner.query(`
      ALTER TABLE student_parents
      DROP COLUMN IF EXISTS relationship
    `);
  }
}
