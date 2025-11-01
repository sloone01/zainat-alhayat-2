import { School } from './school.entity';
import { Student } from './student.entity';
import { Schedule } from './schedule.entity';
import { Attendance } from './attendance.entity';
import { AcademicYear } from './academic-year.entity';
export declare class Group {
    id: string;
    name: string;
    description: string;
    age_range_min: number;
    age_range_max: number;
    capacity: number;
    is_active: boolean;
    color: string;
    status: string;
    studentCount: number;
    teacherCount: number;
    school_id: number;
    room_id: number;
    academic_year_id: string;
    created_at: Date;
    updated_at: Date;
    school: School;
    students: Student[];
    schedules: Schedule[];
    attendances: Attendance[];
    academicYear: AcademicYear;
}
