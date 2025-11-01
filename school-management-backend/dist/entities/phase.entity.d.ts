import { Course } from './course.entity';
import { Milestone } from './milestone.entity';
export declare class Phase {
    id: string;
    name: string;
    description: string;
    order: number;
    duration_weeks: number;
    is_active: boolean;
    course_id: string;
    created_at: Date;
    updated_at: Date;
    course: Course;
    milestones: Milestone[];
}
