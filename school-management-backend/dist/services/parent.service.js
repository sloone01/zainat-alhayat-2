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
exports.ParentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_entity_1 = require("../entities/parent.entity");
const student_entity_1 = require("../entities/student.entity");
const user_entity_1 = require("../entities/user.entity");
const group_entity_1 = require("../entities/group.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
const weekly_session_plan_entity_1 = require("../entities/weekly-session-plan.entity");
const student_progress_entity_1 = require("../entities/student-progress.entity");
let ParentService = class ParentService {
    parentRepository;
    studentRepository;
    userRepository;
    groupRepository;
    scheduleRepository;
    weeklySessionPlanRepository;
    studentProgressRepository;
    constructor(parentRepository, studentRepository, userRepository, groupRepository, scheduleRepository, weeklySessionPlanRepository, studentProgressRepository) {
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.scheduleRepository = scheduleRepository;
        this.weeklySessionPlanRepository = weeklySessionPlanRepository;
        this.studentProgressRepository = studentProgressRepository;
    }
    async create(createParentDto) {
        const parent = this.parentRepository.create(createParentDto);
        if (createParentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: createParentDto.userId.toString() }
            });
            if (user) {
                parent.user = user;
                parent.user_id = createParentDto.userId;
            }
        }
        if (createParentDto.studentIds && createParentDto.studentIds.length > 0) {
            const students = await this.studentRepository.findBy({
                id: (0, typeorm_2.In)(createParentDto.studentIds)
            });
            parent.students = students;
        }
        return this.parentRepository.save(parent);
    }
    async findAll() {
        return this.parentRepository.find({
            relations: ['user', 'students']
        });
    }
    async findOne(id) {
        const parent = await this.parentRepository.findOne({
            where: { id },
            relations: ['user', 'students']
        });
        if (!parent) {
            throw new common_1.NotFoundException(`Parent with ID ${id} not found`);
        }
        return parent;
    }
    async update(id, updateParentDto) {
        const parent = await this.findOne(id);
        Object.assign(parent, updateParentDto);
        if (updateParentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: updateParentDto.userId.toString() }
            });
            if (user) {
                parent.user = user;
            }
        }
        if (updateParentDto.studentIds) {
            if (updateParentDto.studentIds.length > 0) {
                const students = await this.studentRepository.findByIds(updateParentDto.studentIds);
                parent.students = students;
            }
            else {
                parent.students = [];
            }
        }
        return this.parentRepository.save(parent);
    }
    async remove(id) {
        const parent = await this.findOne(id);
        await this.parentRepository.remove(parent);
    }
    async searchParents(query) {
        return this.parentRepository
            .createQueryBuilder('parent')
            .leftJoinAndSelect('parent.user', 'user')
            .leftJoinAndSelect('parent.students', 'students')
            .where('parent.firstName ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.lastName ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.email ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.phone ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
    async assignToStudent(parentId, studentId) {
        const parent = await this.findOne(parentId);
        const student = await this.studentRepository.findOne({ where: { id: studentId } });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${studentId} not found`);
        }
        await this.parentRepository
            .createQueryBuilder()
            .relation(parent_entity_1.Parent, 'students')
            .of(parentId)
            .add(studentId);
        return this.findOne(parentId);
    }
    async removeFromStudent(parentId, studentId) {
        const parent = await this.findOne(parentId);
        await this.parentRepository
            .createQueryBuilder()
            .relation(parent_entity_1.Parent, 'students')
            .of(parentId)
            .remove(studentId);
        return this.findOne(parentId);
    }
    async getParentDashboardData(userId) {
        try {
            let parentRecord = await this.parentRepository.findOne({
                where: { user: { id: userId } },
                relations: ['students', 'students.groups', 'students.parents']
            });
            if (!parentRecord) {
                const user = await this.userRepository.findOne({ where: { id: userId } });
                if (!user) {
                    throw new common_1.NotFoundException('User not found');
                }
                const students = await this.studentRepository
                    .createQueryBuilder('student')
                    .leftJoinAndSelect('student.parents', 'parent')
                    .leftJoinAndSelect('student.groups', 'group')
                    .leftJoinAndSelect('student.progress', 'progress')
                    .where('parent.firstName ILIKE :firstName', { firstName: `%${user.firstName}%` })
                    .orWhere('parent.lastName ILIKE :lastName', { lastName: `%${user.lastName}%` })
                    .getMany();
                if (students.length === 0) {
                    return {
                        children: [],
                        groups: [],
                        schedules: [],
                        weeklyPlans: [],
                        progress: []
                    };
                }
                parentRecord = {
                    id: 0,
                    students: students,
                    user: user
                };
            }
            const allGroups = [];
            const groupIds = new Set();
            if (parentRecord && parentRecord.students) {
                parentRecord.students.forEach(student => {
                    if (student.groups) {
                        student.groups.forEach(group => {
                            if (!groupIds.has(group.id)) {
                                groupIds.add(group.id);
                                allGroups.push(group);
                            }
                        });
                    }
                });
            }
            const schedules = [];
            for (const group of allGroups) {
                const groupSchedules = await this.scheduleRepository.find({
                    where: { group_id: group.id },
                    relations: ['course', 'teacher', 'group']
                });
                schedules.push(...groupSchedules);
            }
            const currentDate = new Date();
            const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));
            const weeklyPlans = [];
            for (const group of allGroups) {
                const groupWeeklyPlans = await this.weeklySessionPlanRepository.find({
                    where: {
                        schedule: { group_id: group.id }
                    },
                    relations: ['schedule', 'schedule.course', 'schedule.group']
                });
                weeklyPlans.push(...groupWeeklyPlans);
            }
            const progressData = [];
            if (parentRecord && parentRecord.students) {
                for (const student of parentRecord.students) {
                    const studentProgress = await this.studentProgressRepository.find({
                        where: { student: { id: student.id } },
                        relations: ['milestone', 'milestone.phase', 'milestone.phase.course']
                    });
                    progressData.push({
                        student: student,
                        progress: studentProgress
                    });
                }
            }
            return {
                children: parentRecord && parentRecord.students ? parentRecord.students.map(student => ({
                    ...student,
                    groupNames: student.groups?.map(g => g.name).join(', ') || 'No group assigned'
                })) : [],
                groups: allGroups,
                schedules: schedules,
                weeklyPlans: weeklyPlans,
                progress: progressData,
                summary: {
                    totalChildren: parentRecord && parentRecord.students ? parentRecord.students.length : 0,
                    totalGroups: allGroups.length,
                    totalSchedules: schedules.length,
                    totalWeeklyPlans: weeklyPlans.length
                }
            };
        }
        catch (error) {
            console.error('Error getting parent dashboard data:', error);
            throw error;
        }
    }
};
exports.ParentService = ParentService;
exports.ParentService = ParentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(3, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __param(4, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __param(5, (0, typeorm_1.InjectRepository)(weekly_session_plan_entity_1.WeeklySessionPlan)),
    __param(6, (0, typeorm_1.InjectRepository)(student_progress_entity_1.StudentProgress)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ParentService);
//# sourceMappingURL=parent.service.js.map