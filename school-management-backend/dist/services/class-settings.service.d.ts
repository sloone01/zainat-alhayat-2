import { Repository } from 'typeorm';
import { ClassSettings } from '../entities/class-settings.entity';
export interface CreateClassSettingsDto {
    durations: number[];
    startTimes: string[];
    defaultDuration?: number;
    is_active?: boolean;
}
export interface UpdateClassSettingsDto {
    durations?: number[];
    startTimes?: string[];
    defaultDuration?: number;
    is_active?: boolean;
}
export declare class ClassSettingsService {
    private classSettingsRepository;
    constructor(classSettingsRepository: Repository<ClassSettings>);
    create(createClassSettingsDto: CreateClassSettingsDto): Promise<ClassSettings>;
    findAll(): Promise<ClassSettings[]>;
    findOne(id: string): Promise<ClassSettings>;
    findActive(): Promise<ClassSettings | null>;
    update(id: string, updateClassSettingsDto: UpdateClassSettingsDto): Promise<ClassSettings>;
    remove(id: string): Promise<void>;
    setActive(id: string): Promise<ClassSettings>;
    getOrCreateDefault(): Promise<ClassSettings>;
    addDuration(duration: number): Promise<ClassSettings>;
    removeDuration(duration: number): Promise<void>;
    addStartTime(startTime: string): Promise<ClassSettings>;
    removeStartTime(startTime: string): Promise<void>;
    setDefaultDuration(duration: number): Promise<ClassSettings>;
    validateTimeSlot(startTime: string, duration: number): Promise<boolean>;
    getAvailableTimeSlots(): Promise<{
        durations: number[];
        startTimes: string[];
        defaultDuration: number;
    }>;
}
