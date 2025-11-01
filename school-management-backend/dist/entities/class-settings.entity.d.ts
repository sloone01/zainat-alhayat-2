import { School } from './school.entity';
export declare class ClassSettings {
    id: string;
    setting_type: string;
    name: string;
    duration_minutes: number;
    time_value: string;
    is_default: boolean;
    is_active: boolean;
    color: string;
    description: string;
    order_index: number;
    additional_settings: any;
    school_id: number;
    created_at: Date;
    updated_at: Date;
    school: School;
}
