"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GroupService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const group_entity_1 = require("../entities/group.entity");
let GroupService = class GroupService {
    groupRepository;
    constructor(groupRepository) {
        this.groupRepository = groupRepository;
    }
    async create(createGroupDto) {
        const group = this.groupRepository.create(createGroupDto);
        return await this.groupRepository.save(group);
    }
    async findAll(schoolId, isActive) {
        const whereConditions = {};
        if (schoolId !== undefined) {
            whereConditions.school_id = schoolId;
        }
        if (isActive !== undefined) {
            whereConditions.is_active = isActive;
        }
        return await this.groupRepository.find({
            where: whereConditions,
            relations: ['students', 'school', 'academicYear'],
            order: { created_at: 'DESC' },
        });
    }
    async findOne(id) {
        const group = await this.groupRepository.findOne({
            where: { id },
            relations: ['students', 'school', 'schedules'],
        });
        if (!group) {
            throw new common_1.NotFoundException(`Group with ID ${id} not found`);
        }
        return group;
    }
    async findByAcademicYear(schoolId, academicYear) {
        return await this.groupRepository.find({
            where: {
                school_id: schoolId,
                academic_year_id: academicYear,
                is_active: true
            },
            relations: ['students'],
            order: { name: 'ASC' },
        });
    }
    async findBySupervisor(supervisorId) {
        return [];
    }
    async update(id, updateGroupDto) {
        const group = await this.findOne(id);
        Object.assign(group, updateGroupDto);
        return await this.groupRepository.save(group);
    }
    async updateStudentCount(id) {
        const group = await this.findOne(id);
        return await this.groupRepository.save(group);
    }
    async remove(id) {
        const group = await this.findOne(id);
        await this.groupRepository.remove(group);
    }
    async deactivate(id) {
        const group = await this.findOne(id);
        group.is_active = false;
        return await this.groupRepository.save(group);
    }
    async getGroupCapacity(id) {
        const group = await this.findOne(id);
        const currentStudents = group.students ? group.students.length : 0;
        return {
            capacity: group.capacity,
            currentStudents: currentStudents,
            available: group.capacity - currentStudents
        };
    }
    async getGroupStatistics(id) {
        const group = await this.findOne(id);
        const currentStudents = group.students ? group.students.length : 0;
        return {
            id: group.id,
            name: group.name,
            capacity: group.capacity,
            current_students: currentStudents,
            available_spots: group.capacity - currentStudents,
            occupancy_rate: (currentStudents / group.capacity) * 100,
        };
    }
};
exports.GroupService = GroupService;
exports.GroupService = GroupService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], GroupService);
//# sourceMappingURL=group.service.js.map