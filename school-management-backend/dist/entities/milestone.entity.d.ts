import { Phase } from './phase.entity';
import { StudentProgress } from './student-progress.entity';
export declare class Milestone {
    id: string;
    name: string;
    description: string;
    order: number;
    isRequired: boolean;
    points: number;
    phase_id: string;
    title: string;
    type: string;
    target_week: number;
    weight: number;
    difficulty_level: string;
    estimated_duration_minutes: number;
    required_resources: string;
    allow_late_submission: boolean;
    enable_peer_review: boolean;
    created_at: Date;
    updated_at: Date;
    phase: Phase;
    progress: StudentProgress[];
}
