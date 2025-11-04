import { WeeklySessionPlanService } from '../services/weekly-session-plan.service';
import type { CreateWeeklySessionPlanDto, UpdateWeeklySessionPlanDto } from '../services/weekly-session-plan.service';
export declare class WeeklySessionPlanController {
    private readonly weeklySessionPlanService;
    constructor(weeklySessionPlanService: WeeklySessionPlanService);
    createWeeklySessionPlan(createDto: Omit<CreateWeeklySessionPlanDto, 'created_by'>, req: any): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getWeeklySessionPlans(groupId?: string, weekStartDate?: string, scheduleId?: string): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan[];
        count: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
    getGroupWeeklyPlanning(groupId: string, weekStartDate: string): Promise<{
        success: boolean;
        data: {
            week_start_date: Date;
            week_end_date: Date;
            schedules: {
                weeklyPlan: import("../entities/weekly-session-plan.entity").WeeklySessionPlan | null;
                id: string;
                day_of_week: string;
                start_time: string;
                end_time: string;
                duration_minutes: number;
                notes: string;
                is_recurring: boolean;
                specific_date: Date;
                status: string;
                group_id: string;
                course_id: string;
                teacher_id: string;
                room_id: number;
                created_at: Date;
                updated_at: Date;
                group: import("../entities/group.entity").Group;
                course: import("../entities/course.entity").Course;
                teacher: import("../entities/user.entity").User;
                room: import("../entities/room.entity").Room;
                weeklySessionPlans: import("../entities/weekly-session-plan.entity").WeeklySessionPlan[];
            }[];
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getWeeklySessionPlanById(id: string): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    updateWeeklySessionPlan(id: string, updateDto: UpdateWeeklySessionPlanDto): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    markSessionComplete(id: string, body: {
        completion_notes?: string;
    }): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    markSessionIncomplete(id: string): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    deleteWeeklySessionPlan(id: string): Promise<{
        success: boolean;
        message: string;
        data: null;
    }>;
    copyFromPreviousWeek(body: {
        currentWeekStartDate: string;
    }, req: any): Promise<{
        success: boolean;
        data: import("../entities/weekly-session-plan.entity").WeeklySessionPlan[];
        count: number;
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
        count?: undefined;
    }>;
}
