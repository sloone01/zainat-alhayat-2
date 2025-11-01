import { ScheduleService } from '../services/schedule.service';
import type { CreateScheduleDto, UpdateScheduleDto } from '../services/schedule.service';
export declare class ScheduleController {
    private readonly scheduleService;
    constructor(scheduleService: ScheduleService);
    create(createScheduleDto: CreateScheduleDto): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule;
        message: string;
    }>;
    findAll(): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
    }>;
    findByGroup(groupId: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
    }>;
    findByTeacher(teacherId: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
    }>;
    findTeacherCourses(teacherId: string): Promise<{
        success: boolean;
        data: any[];
        message: string;
    }>;
    findByRoom(roomId: number): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
    }>;
    findByDay(dayOfWeek: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule[];
        message: string;
    }>;
    getWeeklySchedule(groupId?: string, teacherId?: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule;
        message: string;
    }>;
    update(id: string, updateScheduleDto: UpdateScheduleDto): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule;
        message: string;
    }>;
    cancel(id: string): Promise<{
        success: boolean;
        data: import("../entities/schedule.entity").Schedule;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
