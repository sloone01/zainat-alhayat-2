import { SemesterService } from '../services/semester.service';
import type { CreateSemesterDto, UpdateSemesterDto } from '../services/semester.service';
export declare class SemesterController {
    private readonly semesterService;
    constructor(semesterService: SemesterService);
    create(createSemesterDto: CreateSemesterDto): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findAll(academicYearId?: string): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    findCurrentSemester(academicYearId?: string): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester | null;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getStatistics(academicYearId?: string): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            current: import("../entities/semester.entity").Semester | null;
            upcoming: import("../entities/semester.entity").Semester | null;
            past: number;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findByAcademicYear(academicYearId: string): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester[];
        count: number;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    validateSemesterOrder(academicYearId: string): Promise<{
        success: boolean;
        data: {
            isValid: boolean;
            issues: string[];
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateSemesterDto: UpdateSemesterDto): Promise<{
        success: boolean;
        data: import("../entities/semester.entity").Semester;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
}
