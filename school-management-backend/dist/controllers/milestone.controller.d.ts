import { MilestoneService } from '../services/milestone.service';
import type { CreateMilestoneDto, UpdateMilestoneDto } from '../services/milestone.service';
export declare class MilestoneController {
    private readonly milestoneService;
    constructor(milestoneService: MilestoneService);
    create(createMilestoneDto: CreateMilestoneDto): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone[];
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
    findByPhase(phaseId: string): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone[];
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
    findByCourse(courseId: string): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone[];
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
    getRequiredMilestones(phaseId: string): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone[];
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
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getStats(id: string): Promise<{
        success: boolean;
        data: {
            totalStudents: number;
            completedStudents: number;
            completionRate: number;
        };
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    duplicate(id: string, body: {
        newName?: string;
    }): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    reorderMilestones(phaseId: string, body: {
        milestoneOrders: {
            id: string;
            order: number;
        }[];
    }): Promise<{
        success: boolean;
        data: import("../entities/milestone.entity").Milestone[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getNextOrder(phaseId: string): Promise<{
        success: boolean;
        data: {
            nextOrder: number;
        };
        message?: undefined;
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
