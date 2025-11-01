import { Repository } from 'typeorm';
import { Group } from '../entities/group.entity';
export interface CreateGroupDto {
    name: string;
    age_group: string;
    capacity: number;
    academic_year: string;
    semester: string;
    description?: string;
    school_id: number;
    supervisor_id?: number;
}
export interface UpdateGroupDto {
    name?: string;
    age_group?: string;
    capacity?: number;
    academic_year?: string;
    semester?: string;
    description?: string;
    supervisor_id?: number;
    is_active?: boolean;
}
export declare class GroupService {
    private groupRepository;
    constructor(groupRepository: Repository<Group>);
    create(createGroupDto: CreateGroupDto): Promise<Group>;
    findAll(schoolId?: number, isActive?: boolean): Promise<Group[]>;
    findOne(id: string): Promise<Group>;
    findByAcademicYear(schoolId: number, academicYear: string): Promise<Group[]>;
    findBySupervisor(supervisorId: number): Promise<Group[]>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<Group>;
    updateStudentCount(id: string): Promise<Group>;
    remove(id: string): Promise<void>;
    deactivate(id: string): Promise<Group>;
    getGroupCapacity(id: string): Promise<any>;
    getGroupStatistics(id: string): Promise<any>;
}
