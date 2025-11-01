import { Repository } from 'typeorm';
import { Milestone } from '../entities/milestone.entity';
import { Phase } from '../entities/phase.entity';
export interface CreateMilestoneDto {
    name: string;
    description?: string;
    order: number;
    phaseId: string;
    isRequired?: boolean;
    points?: number;
}
export interface UpdateMilestoneDto {
    name?: string;
    description?: string;
    order?: number;
    phaseId?: string;
    isRequired?: boolean;
    points?: number;
}
export declare class MilestoneService {
    private milestoneRepository;
    private phaseRepository;
    constructor(milestoneRepository: Repository<Milestone>, phaseRepository: Repository<Phase>);
    create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone>;
    findAll(): Promise<Milestone[]>;
    findOne(id: string): Promise<Milestone>;
    findByPhase(phaseId: string): Promise<Milestone[]>;
    findByCourse(courseId: string): Promise<Milestone[]>;
    update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<Milestone>;
    remove(id: string): Promise<void>;
    reorderMilestones(phaseId: string, milestoneOrders: {
        id: string;
        order: number;
    }[]): Promise<Milestone[]>;
    getNextOrder(phaseId: string): Promise<number>;
    duplicateMilestone(id: string, newName?: string): Promise<Milestone>;
    getRequiredMilestones(phaseId: string): Promise<Milestone[]>;
    getMilestoneStats(milestoneId: string): Promise<{
        totalStudents: number;
        completedStudents: number;
        completionRate: number;
    }>;
}
