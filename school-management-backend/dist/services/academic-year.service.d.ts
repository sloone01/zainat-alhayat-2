import { Repository } from 'typeorm';
import { AcademicYear } from '../entities/academic-year.entity';
export interface CreateAcademicYearDto {
    year: string;
    start_date: Date;
    end_date: Date;
    description?: string;
    is_active?: boolean;
    school_id: number;
}
export interface UpdateAcademicYearDto {
    year?: string;
    start_date?: Date;
    end_date?: Date;
    description?: string;
    is_active?: boolean;
}
export declare class AcademicYearService {
    private academicYearRepository;
    constructor(academicYearRepository: Repository<AcademicYear>);
    create(createAcademicYearDto: CreateAcademicYearDto): Promise<AcademicYear>;
    findAll(schoolId?: number): Promise<AcademicYear[]>;
    findOne(id: string): Promise<AcademicYear>;
    findActive(schoolId?: number): Promise<AcademicYear | null>;
    update(id: string, updateAcademicYearDto: UpdateAcademicYearDto): Promise<AcademicYear>;
    remove(id: string): Promise<void>;
    setActive(id: string): Promise<AcademicYear>;
    archive(id: string): Promise<AcademicYear>;
    getStatistics(schoolId?: number): Promise<{
        total: number;
        active: number;
        current: AcademicYear | null;
        upcoming: AcademicYear | null;
    }>;
}
