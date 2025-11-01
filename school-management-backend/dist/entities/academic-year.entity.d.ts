import { School } from './school.entity';
import { Course } from './course.entity';
import { Group } from './group.entity';
import { Semester } from './semester.entity';
export declare class AcademicYear {
    id: string;
    year: string;
    start_date: Date;
    end_date: Date;
    is_active: boolean;
    school_id: number;
    description: string;
    created_at: Date;
    updated_at: Date;
    school: School;
    courses: Course[];
    groups: Group[];
    semesters: Semester[];
}
