import { User } from './user.entity';
export declare class Reminder {
    id: number;
    user_id: number;
    title: string;
    description: string;
    due_date: Date;
    created_at: Date;
    updated_at: Date;
    user: User;
}
