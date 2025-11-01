import { AcademicYear } from './academic-year.entity';
export declare class Semester {
    id: string;
    title: string;
    start_date: Date;
    end_date: Date;
    academic_year_id: string;
    description: string;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
    academicYear: AcademicYear;
}
