import { StudentProgressService } from '../services/student-progress.service';
import type { CreateProgressDto, UpdateProgressDto, BulkProgressUpdateDto } from '../services/student-progress.service';
export declare class StudentProgressController {
    private readonly progressService;
    constructor(progressService: StudentProgressService);
    create(createProgressDto: CreateProgressDto): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress;
        message: string;
    }>;
    bulkUpdate(bulkUpdateDto: BulkProgressUpdateDto): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findByStudent(studentId: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findByCourse(courseId: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findByMilestone(milestoneId: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findByStudentAndCourse(studentId: number, courseId: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress[];
        message: string;
    }>;
    findByStudentAndMilestone(studentId: number, milestoneId: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress | null;
        message: string;
    }>;
    getStudentCourseProgress(studentId: number, courseId: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getCourseProgressSummary(courseId: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getMilestoneProgressSummary(milestoneId: number): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress;
        message: string;
    }>;
    update(id: number, updateProgressDto: UpdateProgressDto): Promise<{
        success: boolean;
        data: import("../entities/student-progress.entity").StudentProgress;
        message: string;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
    }>;
}
