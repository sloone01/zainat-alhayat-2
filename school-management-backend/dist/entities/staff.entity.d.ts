import { User } from './user.entity';
import { School } from './school.entity';
import { Schedule } from './schedule.entity';
import { StudentProgress } from './student-progress.entity';
import { Attendance } from './attendance.entity';
export declare class Staff {
    id: number;
    user_id: number;
    school_id: number;
    created_at: Date;
    updated_at: Date;
    user: User;
    school: School;
    schedules: Schedule[];
    updated_progress: StudentProgress[];
    recorded_attendances: Attendance[];
}
