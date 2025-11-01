import { Repository } from 'typeorm';
import { StudentProgress } from '../entities/student-progress.entity';
export interface CreateProgressDto {
    status: string;
    score?: number;
    points_earned?: number;
    teacher_notes?: string;
    student_notes?: string;
    started_date?: Date;
    completed_date?: Date;
    due_date?: Date;
    is_late_submission?: boolean;
    feedback?: string;
    attachments?: any;
    student_id: number;
    course_id: number;
    milestone_id: number;
    updated_by: number;
}
export interface UpdateProgressDto {
    status?: string;
    score?: number;
    points_earned?: number;
    teacher_notes?: string;
    student_notes?: string;
    started_date?: Date;
    completed_date?: Date;
    due_date?: Date;
    is_late_submission?: boolean;
    feedback?: string;
    attachments?: any;
    updated_by?: number;
}
export interface BulkProgressUpdateDto {
    milestone_id: number;
    course_id: number;
    updated_by: number;
    updates: {
        student_id: number;
        status: string;
        teacher_notes?: string;
        score?: number;
        points_earned?: number;
    }[];
}
export declare class StudentProgressService {
    private progressRepository;
    constructor(progressRepository: Repository<StudentProgress>);
    create(createProgressDto: CreateProgressDto): Promise<StudentProgress>;
    bulkUpdate(bulkUpdateDto: BulkProgressUpdateDto): Promise<StudentProgress[]>;
    findAll(): Promise<StudentProgress[]>;
    findByStudent(studentId: number): Promise<StudentProgress[]>;
    findByCourse(courseId: number): Promise<StudentProgress[]>;
    findByMilestone(milestoneId: number): Promise<StudentProgress[]>;
    findByStudentAndCourse(studentId: number, courseId: number): Promise<StudentProgress[]>;
    findByStudentAndMilestone(studentId: number, milestoneId: number): Promise<StudentProgress | null>;
    findOne(id: number): Promise<StudentProgress>;
    update(id: number, updateProgressDto: UpdateProgressDto): Promise<StudentProgress>;
    remove(id: number): Promise<void>;
    getStudentCourseProgress(studentId: number, courseId: number): Promise<any>;
    getCourseProgressSummary(courseId: number): Promise<any>;
    getMilestoneProgressSummary(milestoneId: number): Promise<any>;
}
