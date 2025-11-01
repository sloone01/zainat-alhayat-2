import { MigrationInterface, QueryRunner } from "typeorm";

export class FixTeacherIdType1758294735882 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Change teacher_id column from integer to UUID string
        await queryRunner.query(`
            ALTER TABLE "schedules"
            ALTER COLUMN "teacher_id" TYPE varchar USING "teacher_id"::varchar
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Revert teacher_id column back to integer
        await queryRunner.query(`
            ALTER TABLE "schedules"
            ALTER COLUMN "teacher_id" TYPE integer USING "teacher_id"::integer
        `);
    }

}
