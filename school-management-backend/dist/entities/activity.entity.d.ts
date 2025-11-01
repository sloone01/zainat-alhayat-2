import { Student } from './student.entity';
export declare class Activity {
    id: number;
    student_id: number;
    type: string;
    data: any;
    created_at: Date;
    student: Student;
}
