import { Repository } from 'typeorm';
import { Phase } from '../entities/phase.entity';
import { Course } from '../entities/course.entity';
export interface CreatePhaseDto {
    name: string;
    description?: string;
    order: number;
    courseId: string;
}
export interface UpdatePhaseDto {
    name?: string;
    description?: string;
    order?: number;
    courseId?: string;
}
export declare class PhaseService {
    private phaseRepository;
    private courseRepository;
    constructor(phaseRepository: Repository<Phase>, courseRepository: Repository<Course>);
    create(createPhaseDto: CreatePhaseDto): Promise<Phase>;
    findAll(): Promise<Phase[]>;
    findOne(id: string): Promise<Phase>;
    findByCourse(courseId: string): Promise<Phase[]>;
    update(id: string, updatePhaseDto: UpdatePhaseDto): Promise<Phase>;
    remove(id: string): Promise<void>;
    reorderPhases(courseId: string, phaseOrders: {
        id: string;
        order: number;
    }[]): Promise<Phase[]>;
    getNextOrder(courseId: string): Promise<number>;
    duplicatePhase(id: string, newName?: string): Promise<Phase>;
}
