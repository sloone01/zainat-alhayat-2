import { MigrationInterface, QueryRunner } from "typeorm";

export class AddRolesColumnToUser1757691788565 implements MigrationInterface {
    name = 'AddRolesColumnToUser1757691788565'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Simply add the roles column to users table
        await queryRunner.query(`ALTER TABLE "users" ADD "roles" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the roles column
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "roles"`);
    }
}