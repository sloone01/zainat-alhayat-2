import { Repository } from 'typeorm';
import { WeeklySessionPlan } from '../entities/weekly-session-plan.entity';
import { Schedule } from '../entities/schedule.entity';
export interface CreateWeeklySessionPlanDto {
    groupId: string;
    scheduleId?: string;
    weekStartDate: string;
    title: string;
    description?: string;
    objectives?: string[];
    activities?: Array<{
        day: string;
        title: string;
        description: string;
        duration: number;
        materials: string[];
    }>;
    notes?: string;
    created_by: string;
}
export interface UpdateWeeklySessionPlanDto {
    task_title?: string;
    task_description?: string;
    is_completed?: boolean;
    completion_notes?: string;
}
export declare class WeeklySessionPlanService {
    private weeklySessionPlanRepository;
    private scheduleRepository;
    constructor(weeklySessionPlanRepository: Repository<WeeklySessionPlan>, scheduleRepository: Repository<Schedule>);
    private calculateWeekEndDate;
    private getWeekStartDate;
    private buildFullDescription;
    createWeeklySessionPlan(createDto: CreateWeeklySessionPlanDto): Promise<WeeklySessionPlan>;
    getWeeklySessionPlans(groupId?: string, weekStartDate?: string, scheduleId?: string): Promise<WeeklySessionPlan[]>;
    getWeeklySessionPlanById(id: string): Promise<WeeklySessionPlan>;
    updateWeeklySessionPlan(id: string, updateDto: UpdateWeeklySessionPlanDto): Promise<WeeklySessionPlan>;
    deleteWeeklySessionPlan(id: string): Promise<void>;
    getGroupWeeklyPlanning(groupId: string, weekStartDate: string): Promise<{
        week_start_date: Date;
        week_end_date: Date;
        schedules: {
            weeklyPlan: WeeklySessionPlan | null;
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
            weeklySessionPlans: WeeklySessionPlan[];
        }[];
    }>;
    copyFromPreviousWeek(groupId: string | undefined, currentWeekStart: string, createdBy: string): Promise<WeeklySessionPlan[]>;
}
