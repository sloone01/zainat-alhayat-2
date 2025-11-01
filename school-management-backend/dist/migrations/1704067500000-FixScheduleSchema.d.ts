import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class FixScheduleSchema1704067500000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
