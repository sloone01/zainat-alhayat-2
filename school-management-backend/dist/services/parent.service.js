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
const activity_entity_1 = require("../entities/activity.entity");
const parent_entity_1 = require("../entities/parent.entity");
const student_entity_1 = require("../entities/student.entity");
const attendance_entity_1 = require("../entities/attendance.entity");
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
    attendanceRepository;
    activityRepository;
    constructor(parentRepository, studentRepository, userRepository, groupRepository, scheduleRepository, weeklySessionPlanRepository, studentProgressRepository, attendanceRepository, activityRepository) {
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.scheduleRepository = scheduleRepository;
        this.weeklySessionPlanRepository = weeklySessionPlanRepository;
        this.studentProgressRepository = studentProgressRepository;
        this.attendanceRepository = attendanceRepository;
        this.activityRepository = activityRepository;
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
                    where: { group_id: group.id, status: 'active' },
                    relations: ['course', 'teacher', 'group', 'room'],
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
                    relations: ['schedule', 'schedule.course', 'schedule.group', 'schedule.teacher'],
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
    startOfLocalDay(d = new Date()) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate());
    }
    async getChildrenForParentUser(userId) {
        let parentRecord = await this.parentRepository.findOne({
            where: { user: { id: userId } },
            relations: ['students', 'students.groups'],
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
                .where('parent.firstName ILIKE :firstName', { firstName: `%${user.firstName}%` })
                .orWhere('parent.lastName ILIKE :lastName', { lastName: `%${user.lastName}%` })
                .getMany();
            return students;
        }
        return parentRecord.students || [];
    }
    async getParentAttendanceView(userId, offset = 0, limit = 5) {
        const students = await this.getChildrenForParentUser(userId);
        const todayStart = this.startOfLocalDay();
        const dateStr = `${todayStart.getFullYear()}-${String(todayStart.getMonth() + 1).padStart(2, '0')}-${String(todayStart.getDate()).padStart(2, '0')}`;
        const emptySummary = {
            totalChildren: 0,
            recorded: 0,
            pending: 0,
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
        };
        if (students.length === 0) {
            return {
                today: {
                    date: dateStr,
                    children: [],
                    summary: emptySummary,
                },
                history: {
                    items: [],
                    total: 0,
                    offset,
                    limit,
                    hasMore: false,
                },
            };
        }
        const studentIds = students.map((s) => s.id);
        const todayRows = await this.attendanceRepository.find({
            where: {
                student_id: (0, typeorm_2.In)(studentIds),
                attendance_date: todayStart,
            },
            relations: ['group'],
            order: { created_at: 'DESC' },
        });
        const todayByStudent = new Map();
        for (const row of todayRows) {
            if (!todayByStudent.has(row.student_id)) {
                todayByStudent.set(row.student_id, row);
            }
        }
        const mapAttendance = (r) => ({
            id: r.id,
            status: r.status,
            check_in_time: r.check_in_time,
            check_out_time: r.check_out_time,
            notes: r.notes,
            is_excused: r.is_excused,
            reason: r.reason,
            groupName: r.group?.name ?? null,
        });
        const children = students.map((student) => {
            const rec = todayByStudent.get(student.id);
            return {
                studentId: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                groupNames: student.groups?.map((g) => g.name).join(', ') || '',
                record: rec ? mapAttendance(rec) : null,
            };
        });
        let recorded = 0;
        let pending = 0;
        let present = 0;
        let absent = 0;
        let late = 0;
        let excused = 0;
        for (const c of children) {
            if (!c.record) {
                pending++;
                continue;
            }
            recorded++;
            if (c.record.status === 'present')
                present++;
            else if (c.record.status === 'absent')
                absent++;
            else if (c.record.status === 'late')
                late++;
            if (c.record.is_excused)
                excused++;
        }
        const safeLimit = Math.min(50, Math.max(1, limit));
        const safeOffset = Math.max(0, offset);
        const qb = this.attendanceRepository
            .createQueryBuilder('a')
            .leftJoinAndSelect('a.student', 'student')
            .leftJoinAndSelect('a.group', 'group')
            .where('a.student_id IN (:...ids)', { ids: studentIds })
            .andWhere('a.attendance_date < :today', { today: todayStart })
            .orderBy('a.attendance_date', 'DESC')
            .addOrderBy('a.created_at', 'DESC')
            .skip(safeOffset)
            .take(safeLimit);
        const [historyRows, total] = await qb.getManyAndCount();
        const items = historyRows.map((r) => ({
            id: r.id,
            attendance_date: r.attendance_date instanceof Date
                ? r.attendance_date.toISOString().split('T')[0]
                : String(r.attendance_date).split('T')[0],
            status: r.status,
            check_in_time: r.check_in_time,
            check_out_time: r.check_out_time,
            notes: r.notes,
            is_excused: r.is_excused,
            reason: r.reason,
            student: {
                id: r.student.id,
                firstName: r.student.firstName,
                lastName: r.student.lastName,
            },
            group: r.group ? { id: r.group.id, name: r.group.name } : null,
        }));
        return {
            today: {
                date: dateStr,
                children,
                summary: {
                    totalChildren: children.length,
                    recorded,
                    pending,
                    present,
                    absent,
                    late,
                    excused,
                },
            },
            history: {
                items,
                total,
                offset: safeOffset,
                limit: safeLimit,
                hasMore: safeOffset + items.length < total,
            },
        };
    }
    async getParentAssignedActivities(userId) {
        const students = await this.getChildrenForParentUser(userId);
        const groupIds = new Set();
        for (const s of students) {
            for (const g of s.groups || []) {
                groupIds.add(String(g.id));
            }
        }
        if (groupIds.size === 0) {
            return [];
        }
        const ids = [...groupIds];
        return this.activityRepository.find({
            where: {
                group_id: (0, typeorm_2.In)(ids),
                is_active: true,
            },
            relations: ['group', 'createdByUser'],
            order: { activity_date: 'DESC', created_at: 'DESC' },
        });
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
    __param(7, (0, typeorm_1.InjectRepository)(attendance_entity_1.Attendance)),
    __param(8, (0, typeorm_1.InjectRepository)(activity_entity_1.Activity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ParentService);
//# sourceMappingURL=parent.service.js.map