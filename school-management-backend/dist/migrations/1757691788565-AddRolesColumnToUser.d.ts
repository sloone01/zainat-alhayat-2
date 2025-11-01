import { MigrationInterface, QueryRunner } from "typeorm";
export declare class AddRolesColumnToUser1757691788565 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
