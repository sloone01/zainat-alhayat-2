import { PhaseService } from '../services/phase.service';
import type { CreatePhaseDto, UpdatePhaseDto } from '../services/phase.service';
export declare class PhaseController {
    private readonly phaseService;
    constructor(phaseService: PhaseService);
    create(createPhaseDto: CreatePhaseDto): Promise<{
        success: boolean;
        data: import("../entities/phase.entity").Phase;
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
        data: import("../entities/phase.entity").Phase[];
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
        data: import("../entities/phase.entity").Phase[];
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
        data: import("../entities/phase.entity").Phase;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updatePhaseDto: UpdatePhaseDto): Promise<{
        success: boolean;
        data: import("../entities/phase.entity").Phase;
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
        data: import("../entities/phase.entity").Phase;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    reorderPhases(courseId: string, body: {
        phaseOrders: {
            id: string;
            order: number;
        }[];
    }): Promise<{
        success: boolean;
        data: import("../entities/phase.entity").Phase[];
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getNextOrder(courseId: string): Promise<{
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
