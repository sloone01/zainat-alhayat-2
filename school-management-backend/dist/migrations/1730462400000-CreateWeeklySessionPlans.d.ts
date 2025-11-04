import { MigrationInterface, QueryRunner } from 'typeorm';
export declare class CreateWeeklySessionPlans1730462400000 implements MigrationInterface {
    name: string;
    up(queryRunner: QueryRunner): Promise<void>;
    down(queryRunner: QueryRunner): Promise<void>;
}
