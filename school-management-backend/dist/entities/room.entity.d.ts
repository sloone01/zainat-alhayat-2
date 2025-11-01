import { School } from './school.entity';
import { Student } from './student.entity';
import { Schedule } from './schedule.entity';
export declare class Room {
    id: number;
    name: string;
    capacity: number;
    room_type: string;
    description: string;
    equipment: string;
    is_active: boolean;
    school_id: number;
    created_at: Date;
    updated_at: Date;
    school: School;
    students: Student[];
    schedules: Schedule[];
}
