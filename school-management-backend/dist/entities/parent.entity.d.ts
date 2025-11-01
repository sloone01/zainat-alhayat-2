import { User } from './user.entity';
import { Student } from './student.entity';
export declare class Parent {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    user_id: number;
    createdAt: Date;
    updatedAt: Date;
    user: User;
    students: Student[];
    student_id: number;
    created_at: Date;
    updated_at: Date;
}
