import { Student } from './student.entity';
import { Course } from './course.entity';
import { Milestone } from './milestone.entity';
import { Staff } from './staff.entity';
export declare class StudentProgress {
    id: number;
    status: string;
    score: number;
    points_earned: number;
    teacher_notes: string;
    student_notes: string;
    started_date: Date;
    completed_date: Date;
    due_date: Date;
    is_late_submission: boolean;
    attempts_count: number;
    feedback: string;
    attachments: any;
    student_id: number;
    course_id: number;
    milestone_id: number;
    updated_by: number;
    created_at: Date;
    updated_at: Date;
    student: Student;
    course: Course;
    milestone: Milestone;
    updater: Staff;
}
