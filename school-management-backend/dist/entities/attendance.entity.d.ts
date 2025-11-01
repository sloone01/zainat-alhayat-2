import { Student } from './student.entity';
import { Group } from './group.entity';
import { Staff } from './staff.entity';
export declare class Attendance {
    id: number;
    attendance_date: Date;
    status: string;
    check_in_time: string;
    check_out_time: string;
    notes: string;
    reason: string;
    is_excused: boolean;
    student_id: string;
    group_id: string;
    recorded_by: number;
    created_at: Date;
    updated_at: Date;
    student: Student;
    group: Group;
    recorder: Staff;
}
