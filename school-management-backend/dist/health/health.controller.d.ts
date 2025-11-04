import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator);
    check(): any;
    simpleCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
        memory: {
            used: number;
            total: number;
        };
    };
}
