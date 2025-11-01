import { AcademicYearService } from '../services/academic-year.service';
import type { CreateAcademicYearDto, UpdateAcademicYearDto } from '../services/academic-year.service';
export declare class AcademicYearController {
    private readonly academicYearService;
    constructor(academicYearService: AcademicYearService);
    create(createAcademicYearDto: CreateAcademicYearDto): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findAll(schoolId?: string): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear[];
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
    findActive(schoolId?: string): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear | null;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getStatistics(schoolId?: string): Promise<{
        success: boolean;
        data: {
            total: number;
            active: number;
            current: import("../entities/academic-year.entity").AcademicYear | null;
            upcoming: import("../entities/academic-year.entity").AcademicYear | null;
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
        data: import("../entities/academic-year.entity").AcademicYear;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateAcademicYearDto: UpdateAcademicYearDto): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    setActive(id: string): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    archive(id: string): Promise<{
        success: boolean;
        data: import("../entities/academic-year.entity").AcademicYear;
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
