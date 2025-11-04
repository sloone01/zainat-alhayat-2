import { DataSource } from 'typeorm';
export declare class ExcelDatabaseSeeder {
    private dataSource;
    private cleanupService;
    private excelImportService;
    constructor(dataSource: DataSource);
    run(): Promise<void>;
    private seedSchools;
    private seedSystemAdmin;
    private seedRooms;
    private seedAcademicYears;
    private seedSemesters;
    private seedCourses;
    private showFinalSummary;
}
