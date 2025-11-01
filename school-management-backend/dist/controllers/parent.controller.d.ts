import { ParentService } from '../services/parent.service';
import type { CreateParentDto, UpdateParentDto } from '../services/parent.service';
export declare class ParentController {
    private readonly parentService;
    constructor(parentService: ParentService);
    create(createParentDto: CreateParentDto): Promise<{
        success: boolean;
        data: import("../entities/parent.entity").Parent;
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
        data: import("../entities/parent.entity").Parent[];
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
    search(query: string): Promise<{
        success: boolean;
        message: string;
        data?: undefined;
        count?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        data: import("../entities/parent.entity").Parent[];
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
    findOne(id: number): Promise<{
        success: boolean;
        data: import("../entities/parent.entity").Parent;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: number, updateParentDto: UpdateParentDto): Promise<{
        success: boolean;
        data: import("../entities/parent.entity").Parent;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    assignToStudent(id: number, studentId: string): Promise<{
        success: boolean;
        data: import("../entities/parent.entity").Parent;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    remove(id: number): Promise<{
        success: boolean;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
    }>;
}
