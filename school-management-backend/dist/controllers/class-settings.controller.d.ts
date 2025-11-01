import { ClassSettingsService } from '../services/class-settings.service';
import type { CreateClassSettingsDto, UpdateClassSettingsDto } from '../services/class-settings.service';
export declare class ClassSettingsController {
    private readonly classSettingsService;
    constructor(classSettingsService: ClassSettingsService);
    create(createClassSettingsDto: CreateClassSettingsDto): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
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
        data: import("../entities/class-settings.entity").ClassSettings[];
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
    findActive(): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings | null;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getOrCreateDefault(): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getAvailableTimeSlots(): Promise<{
        success: boolean;
        data: {
            durations: number[];
            startTimes: string[];
            defaultDuration: number;
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
        data: import("../entities/class-settings.entity").ClassSettings;
        message?: undefined;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    update(id: string, updateClassSettingsDto: UpdateClassSettingsDto): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
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
        data: import("../entities/class-settings.entity").ClassSettings;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    addDuration(body: {
        duration: number;
    }): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    removeDuration(duration: string): Promise<{
        success: boolean;
        data: void;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    addStartTime(body: {
        startTime: string;
    }): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    removeStartTime(startTime: string): Promise<{
        success: boolean;
        data: void;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    setDefaultDuration(body: {
        duration: number;
    }): Promise<{
        success: boolean;
        data: import("../entities/class-settings.entity").ClassSettings;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    validateTimeSlot(body: {
        startTime: string;
        duration: number;
    }): Promise<{
        success: boolean;
        data: {
            isValid: boolean;
        };
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
