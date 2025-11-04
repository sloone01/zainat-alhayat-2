import { Group } from './group.entity';
import { Course } from './course.entity';
import { User } from './user.entity';
import { Room } from './room.entity';
import { WeeklySessionPlan } from './weekly-session-plan.entity';
export declare class Schedule {
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
    group: Group;
    course: Course;
    teacher: User;
    room: Room;
    weeklySessionPlans: WeeklySessionPlan[];
}
