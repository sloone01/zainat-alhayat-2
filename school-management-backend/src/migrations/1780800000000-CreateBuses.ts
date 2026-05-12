import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBuses1780800000000 implements MigrationInterface {
  name = 'CreateBuses1780800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "buses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "driver_name" character varying(255) NOT NULL,
        "capacity" integer NOT NULL DEFAULT 40,
        "driver_contacts" text,
        "school_id" integer NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_buses" PRIMARY KEY ("id"),
        CONSTRAINT "FK_buses_school" FOREIGN KEY ("school_id") REFERENCES "schools"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_buses_school_id"
      ON "buses" ("school_id")
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "student_buses" (
        "student_id" uuid NOT NULL,
        "bus_id" uuid NOT NULL,
        CONSTRAINT "PK_student_buses" PRIMARY KEY ("student_id", "bus_id"),
        CONSTRAINT "FK_student_buses_student" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_student_buses_bus" FOREIGN KEY ("bus_id") REFERENCES "buses"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "student_buses"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "buses"`);
  }
}
