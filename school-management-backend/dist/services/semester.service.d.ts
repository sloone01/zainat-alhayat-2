import { Repository } from 'typeorm';
import { Semester } from '../entities/semester.entity';
import { AcademicYear } from '../entities/academic-year.entity';
export interface CreateSemesterDto {
    title: string;
    start_date: Date;
    end_date: Date;
    academic_year_id: string;
    description?: string;
    is_active?: boolean;
}
export interface UpdateSemesterDto {
    title?: string;
    start_date?: Date;
    end_date?: Date;
    description?: string;
    is_active?: boolean;
}
export declare class SemesterService {
    private semesterRepository;
    private academicYearRepository;
    constructor(semesterRepository: Repository<Semester>, academicYearRepository: Repository<AcademicYear>);
    create(createSemesterDto: CreateSemesterDto): Promise<Semester>;
    findAll(academicYearId?: string): Promise<Semester[]>;
    findOne(id: string): Promise<Semester>;
    findByAcademicYear(academicYearId: string): Promise<Semester[]>;
    findCurrentSemester(academicYearId?: string): Promise<Semester | null>;
    update(id: string, updateSemesterDto: UpdateSemesterDto): Promise<Semester>;
    remove(id: string): Promise<void>;
    getStatistics(academicYearId?: string): Promise<{
        total: number;
        active: number;
        current: Semester | null;
        upcoming: Semester | null;
        past: number;
    }>;
    validateSemesterOrder(academicYearId: string): Promise<{
        isValid: boolean;
        issues: string[];
    }>;
}
