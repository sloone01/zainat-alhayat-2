import { DataSource } from 'typeorm';
export interface ExcelStudentData {
    fullName: string;
    birthDate: string;
    motherPhone: string;
    fatherPhone: string;
    address: string;
}
export interface ExcelSheetData {
    teacherName: string;
    groupName: string;
    students: ExcelStudentData[];
}
export interface ExcelFileData {
    fileName: string;
    ageRangeMin: number;
    ageRangeMax: number;
    stage: string;
    sheets: ExcelSheetData[];
}
export declare class ExcelImportService {
    private dataSource;
    private userRepository;
    private studentRepository;
    private parentRepository;
    private groupRepository;
    private schoolRepository;
    private academicYearRepository;
    constructor(dataSource: DataSource);
    importFromExcelFiles(): Promise<void>;
    private parseExcelFile;
    private cleanPhoneNumber;
    private parseArabicName;
    private parseBirthDate;
    private findOrCreateParent;
    private importFileData;
    private importSheetData;
    private createTeacher;
    private createGroup;
    private createStudentWithParents;
    getImportSummary(): Promise<any>;
}
