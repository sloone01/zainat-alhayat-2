import { DataSource } from 'typeorm';
export declare class DataCleanupService {
    private dataSource;
    constructor(dataSource: DataSource);
    cleanExistingData(): Promise<void>;
    verifyCleanup(): Promise<void>;
    getPreCleanupSummary(): Promise<any>;
}
