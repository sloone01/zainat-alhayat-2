import { GroupService } from '../services/group.service';
import type { CreateGroupDto, UpdateGroupDto } from '../services/group.service';
export declare class GroupController {
    private readonly groupService;
    constructor(groupService: GroupService);
    create(createGroupDto: CreateGroupDto): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group;
        message: string;
    }>;
    findAll(schoolId?: string, isActive?: string): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group[];
        message: string;
    }>;
    findByAcademicYear(year: string, schoolId: number): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group[];
        message: string;
    }>;
    findBySupervisor(supervisorId: number): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group[];
        message: string;
    }>;
    findOne(id: string): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group;
        message: string;
    }>;
    getCapacity(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    getStatistics(id: string): Promise<{
        success: boolean;
        data: any;
        message: string;
    }>;
    update(id: string, updateGroupDto: UpdateGroupDto): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group;
        message: string;
    }>;
    updateStudentCount(id: string): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group;
        message: string;
    }>;
    deactivate(id: string): Promise<{
        success: boolean;
        data: import("../entities/group.entity").Group;
        message: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
