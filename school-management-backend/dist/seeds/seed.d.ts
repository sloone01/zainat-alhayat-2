import { DataSource } from 'typeorm';
export declare class DatabaseSeeder {
    private dataSource;
    constructor(dataSource: DataSource);
    run(): Promise<void>;
    private seedSchools;
    private seedUsers;
    private seedAcademicYears;
    private seedRooms;
    private seedSemesters;
    private seedStaff;
    private seedParents;
    private seedStudents;
    private seedGroups;
    private seedCourses;
    private linkStudentsToParents;
    private linkStudentsToGroups;
}
