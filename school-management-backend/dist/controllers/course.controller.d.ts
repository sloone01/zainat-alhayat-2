import { CourseService } from '../services/course.service';
import type { CreateCourseDto, UpdateCourseDto } from '../services/course.service';
export declare class CourseController {
    private readonly courseService;
    private readonly logger;
    constructor(courseService: CourseService);
    create(createCourseDto: CreateCourseDto): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course;
        message: string;
    }>;
    findAll(schoolId?: string): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course[];
        message: string;
    }>;
    search(schoolId: number, searchTerm: string): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course[];
        message: string;
    }>;
    findByAgeGroup(minAge: number, maxAge: number, schoolId: number): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course[];
        message: string;
    }>;
    findByStatus(isActive: string, schoolId: number): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course[];
        message: string;
    }>;
    findActive(schoolId: number): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course[];
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course;
        message: string;
    }>;
    getStatistics(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    update(id: string, updateCourseDto: UpdateCourseDto): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course;
        message: string;
    }>;
    updateStatus(id: string, isActive: boolean): Promise<{
        success: boolean;
        data: import("../entities/course.entity").Course;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
    getSchema(): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
}
