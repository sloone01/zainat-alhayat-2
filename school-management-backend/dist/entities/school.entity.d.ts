import { Room } from './room.entity';
import { Staff } from './staff.entity';
import { Student } from './student.entity';
import { Group } from './group.entity';
import { Course } from './course.entity';
import { ClassSettings } from './class-settings.entity';
import { AcademicYear } from './academic-year.entity';
export declare class School {
    id: number;
    name: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    logo_url: string;
    established_date: Date;
    description: string;
    created_at: Date;
    updated_at: Date;
    rooms: Room[];
    staff: Staff[];
    students: Student[];
    groups: Group[];
    courses: Course[];
    class_settings: ClassSettings[];
    academicYears: AcademicYear[];
}
