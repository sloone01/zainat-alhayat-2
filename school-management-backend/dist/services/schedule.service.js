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
exports.ScheduleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const schedule_entity_1 = require("../entities/schedule.entity");
let ScheduleService = class ScheduleService {
    scheduleRepository;
    constructor(scheduleRepository) {
        this.scheduleRepository = scheduleRepository;
    }
    async create(createScheduleDto) {
        try {
            const schedule = this.scheduleRepository.create(createScheduleDto);
            return await this.scheduleRepository.save(schedule);
        }
        catch (error) {
            console.error('Schedule creation error:', error);
            throw new common_1.BadRequestException('Failed to create schedule: ' + error.message);
        }
    }
    async findAll() {
        return await this.scheduleRepository.find({
            relations: ['group', 'course', 'teacher', 'room'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
    }
    async findByGroup(groupId) {
        return await this.scheduleRepository.find({
            where: { group_id: groupId, status: 'active' },
            relations: ['course', 'teacher', 'room'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
    }
    async findByTeacher(teacherId) {
        return await this.scheduleRepository.find({
            where: { teacher_id: teacherId, status: 'active' },
            relations: ['group', 'course', 'room'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
    }
    async findByRoom(roomId) {
        return await this.scheduleRepository.find({
            where: { room_id: roomId, status: 'active' },
            relations: ['group', 'course', 'teacher'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
    }
    async findByDay(dayOfWeek) {
        return await this.scheduleRepository.find({
            where: { day_of_week: dayOfWeek, status: 'active' },
            relations: ['group', 'course', 'teacher', 'room'],
            order: { start_time: 'ASC' },
        });
    }
    async findTeacherCourses(teacherId) {
        const schedules = await this.scheduleRepository.find({
            where: { teacher_id: teacherId, status: 'active' },
            relations: ['group', 'course'],
            order: { day_of_week: 'ASC', start_time: 'ASC' },
        });
        const courseGroups = new Map();
        schedules.forEach(schedule => {
            const key = `${schedule.course_id}-${schedule.group_id}`;
            if (!courseGroups.has(key)) {
                courseGroups.set(key, {
                    course: schedule.course,
                    group: schedule.group,
                    schedules: []
                });
            }
            courseGroups.get(key).schedules.push(schedule);
        });
        return Array.from(courseGroups.values());
    }
    async findOne(id) {
        const schedule = await this.scheduleRepository.findOne({
            where: { id },
            relations: ['group', 'course', 'teacher', 'room'],
        });
        if (!schedule) {
            throw new common_1.NotFoundException(`Schedule with ID ${id} not found`);
        }
        return schedule;
    }
    async update(id, updateScheduleDto) {
        const schedule = await this.findOne(id);
        if (updateScheduleDto.day_of_week || updateScheduleDto.start_time || updateScheduleDto.end_time) {
            await this.checkForConflicts({
                ...schedule,
                ...updateScheduleDto,
            }, id);
        }
        Object.assign(schedule, updateScheduleDto);
        return await this.scheduleRepository.save(schedule);
    }
    async remove(id) {
        const schedule = await this.findOne(id);
        await this.scheduleRepository.remove(schedule);
    }
    async cancelSchedule(id) {
        const schedule = await this.findOne(id);
        schedule.status = 'cancelled';
        return await this.scheduleRepository.save(schedule);
    }
    async getWeeklySchedule(groupId, teacherId) {
        let query = this.scheduleRepository.createQueryBuilder('schedule')
            .leftJoinAndSelect('schedule.group', 'group')
            .leftJoinAndSelect('schedule.course', 'course')
            .leftJoinAndSelect('schedule.teacher', 'teacher')
            .leftJoinAndSelect('schedule.room', 'room')
            .where('schedule.status = :status', { status: 'active' });
        if (groupId) {
            query = query.andWhere('schedule.group_id = :groupId', { groupId });
        }
        if (teacherId) {
            query = query.andWhere('schedule.teacher_id = :teacherId', { teacherId });
        }
        const schedules = await query
            .orderBy('schedule.day_of_week', 'ASC')
            .addOrderBy('schedule.start_time', 'ASC')
            .getMany();
        const weeklySchedule = {
            sunday: [],
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
        };
        schedules.forEach(schedule => {
            const day = schedule.day_of_week.toLowerCase();
            if (weeklySchedule[day]) {
                weeklySchedule[day].push(schedule);
            }
        });
        return weeklySchedule;
    }
    async checkForConflicts(scheduleData, excludeId) {
        let query = this.scheduleRepository.createQueryBuilder('schedule')
            .where('schedule.day_of_week = :dayOfWeek', { dayOfWeek: scheduleData.day_of_week })
            .andWhere('schedule.status = :status', { status: 'active' })
            .andWhere('(schedule.start_time < :endTime AND schedule.end_time > :startTime)', {
            startTime: scheduleData.start_time,
            endTime: scheduleData.end_time
        });
        if (excludeId) {
            query = query.andWhere('schedule.id != :excludeId', { excludeId });
        }
        if (scheduleData.teacher_id) {
            const teacherConflict = await query
                .andWhere('schedule.teacher_id = :teacherId', { teacherId: scheduleData.teacher_id })
                .getOne();
            if (teacherConflict) {
                throw new common_1.ConflictException('Teacher has a conflicting schedule at this time');
            }
        }
        if (scheduleData.room_id) {
            const roomConflict = await query
                .andWhere('schedule.room_id = :roomId', { roomId: scheduleData.room_id })
                .getOne();
            if (roomConflict) {
                throw new common_1.ConflictException('Room is already booked at this time');
            }
        }
        const groupConflict = await query
            .andWhere('schedule.group_id = :groupId', { groupId: scheduleData.group_id })
            .getOne();
        if (groupConflict) {
            throw new common_1.ConflictException('Group has a conflicting schedule at this time');
        }
    }
};
exports.ScheduleService = ScheduleService;
exports.ScheduleService = ScheduleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ScheduleService);
//# sourceMappingURL=schedule.service.js.map