import { Schedule } from './schedule.entity';
import { User } from './user.entity';
export declare class WeeklySessionPlan {
    id: string;
    schedule_id: string;
    week_start_date: Date;
    week_end_date: Date;
    task_title: string;
    task_description: string;
    is_completed: boolean;
    completion_date: Date;
    completion_notes: string;
    created_by: string;
    created_at: Date;
    updated_at: Date;
    schedule: Schedule;
    createdBy: User;
}
