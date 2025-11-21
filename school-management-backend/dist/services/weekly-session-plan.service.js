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
exports.WeeklySessionPlanService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const weekly_session_plan_entity_1 = require("../entities/weekly-session-plan.entity");
const schedule_entity_1 = require("../entities/schedule.entity");
let WeeklySessionPlanService = class WeeklySessionPlanService {
    weeklySessionPlanRepository;
    scheduleRepository;
    constructor(weeklySessionPlanRepository, scheduleRepository) {
        this.weeklySessionPlanRepository = weeklySessionPlanRepository;
        this.scheduleRepository = scheduleRepository;
    }
    calculateWeekEndDate(weekStartDate) {
        const endDate = new Date(weekStartDate);
        endDate.setDate(endDate.getDate() + 6);
        return endDate;
    }
    getWeekStartDate(date) {
        const startDate = new Date(date);
        const dayOfWeek = startDate.getDay();
        startDate.setDate(startDate.getDate() - dayOfWeek);
        return startDate;
    }
    buildFullDescription(createDto) {
        let description = createDto.description || '';
        if (createDto.objectives && createDto.objectives.length > 0) {
            description += '\n\nObjectives:\n' + createDto.objectives.map(obj => `• ${obj}`).join('\n');
        }
        if (createDto.activities && createDto.activities.length > 0) {
            description += '\n\nActivities:\n';
            createDto.activities.forEach(activity => {
                description += `\n${activity.day}: ${activity.title}\n`;
                description += `  Description: ${activity.description}\n`;
                description += `  Duration: ${activity.duration} minutes\n`;
                if (activity.materials && activity.materials.length > 0) {
                    description += `  Materials: ${activity.materials.join(', ')}\n`;
                }
            });
        }
        if (createDto.notes) {
            description += '\n\nNotes:\n' + createDto.notes;
        }
        return description.trim();
    }
    async createWeeklySessionPlan(createDto) {
        let schedule;
        if (createDto.scheduleId) {
            schedule = await this.scheduleRepository.findOne({
                where: { id: createDto.scheduleId }
            });
            if (!schedule) {
                throw new common_1.NotFoundException(`Schedule with ID ${createDto.scheduleId} not found`);
            }
        }
        else {
            schedule = await this.scheduleRepository.findOne({
                where: { group_id: createDto.groupId }
            });
            if (!schedule) {
                throw new common_1.NotFoundException('No schedule found for this group');
            }
        }
        const weekStartDate = new Date(createDto.weekStartDate + 'T00:00:00.000Z');
        if (isNaN(weekStartDate.getTime())) {
            throw new common_1.BadRequestException(`Invalid week start date format. Received: ${createDto.weekStartDate}. Expected YYYY-MM-DD format.`);
        }
        const actualWeekStart = this.getWeekStartDate(weekStartDate);
        const weekEndDate = this.calculateWeekEndDate(actualWeekStart);
        const fullDescription = this.buildFullDescription(createDto);
        const weeklySessionPlan = this.weeklySessionPlanRepository.create({
            schedule_id: schedule.id,
            week_start_date: actualWeekStart,
            week_end_date: weekEndDate,
            task_title: createDto.title,
            task_description: fullDescription,
            created_by: createDto.created_by,
        });
        return await this.weeklySessionPlanRepository.save(weeklySessionPlan);
    }
    async getWeeklySessionPlans(groupId, weekStartDate, scheduleId) {
        const queryBuilder = this.weeklySessionPlanRepository
            .createQueryBuilder('wsp')
            .leftJoinAndSelect('wsp.schedule', 'schedule')
            .leftJoinAndSelect('schedule.group', 'group')
            .leftJoinAndSelect('schedule.course', 'course')
            .leftJoinAndSelect('schedule.teacher', 'teacher')
            .leftJoinAndSelect('wsp.createdBy', 'createdBy')
            .leftJoinAndSelect('wsp.media', 'media');
        if (groupId) {
            queryBuilder.andWhere('schedule.group_id = :groupId', { groupId });
        }
        if (scheduleId) {
            queryBuilder.andWhere('wsp.schedule_id = :scheduleId', { scheduleId });
        }
        if (weekStartDate) {
            const weekStart = new Date(weekStartDate);
            const actualWeekStart = this.getWeekStartDate(weekStart);
            queryBuilder.andWhere('wsp.week_start_date = :weekStartDate', {
                weekStartDate: actualWeekStart
            });
        }
        queryBuilder.orderBy('wsp.week_start_date', 'DESC')
            .addOrderBy('schedule.day_of_week', 'ASC')
            .addOrderBy('schedule.start_time', 'ASC');
        return await queryBuilder.getMany();
    }
    async getWeeklySessionPlanById(id) {
        const plan = await this.weeklySessionPlanRepository.findOne({
            where: { id },
            relations: ['schedule', 'schedule.group', 'schedule.course', 'schedule.teacher', 'createdBy', 'media']
        });
        if (!plan) {
            throw new common_1.NotFoundException('Weekly session plan not found');
        }
        return plan;
    }
    async updateWeeklySessionPlan(id, updateDto) {
        const plan = await this.getWeeklySessionPlanById(id);
        if (updateDto.is_completed === true && !plan.is_completed) {
            updateDto['completion_date'] = new Date();
        }
        if (updateDto.is_completed === false) {
            updateDto['completion_date'] = null;
            updateDto.completion_notes = undefined;
        }
        Object.assign(plan, updateDto);
        return await this.weeklySessionPlanRepository.save(plan);
    }
    async deleteWeeklySessionPlan(id) {
        const plan = await this.getWeeklySessionPlanById(id);
        await this.weeklySessionPlanRepository.remove(plan);
    }
    async getGroupWeeklyPlanning(groupId, weekStartDate) {
        const weekStart = new Date(weekStartDate);
        const actualWeekStart = this.getWeekStartDate(weekStart);
        const schedules = await this.scheduleRepository.find({
            where: { group_id: groupId, status: 'active' },
            relations: ['course', 'teacher', 'group'],
            order: { day_of_week: 'ASC', start_time: 'ASC' }
        });
        const weeklyPlans = await this.getWeeklySessionPlans(groupId, weekStartDate);
        const schedulesWithPlans = schedules.map(schedule => {
            const weeklyPlan = weeklyPlans.find(plan => plan.schedule_id === schedule.id);
            return {
                ...schedule,
                weeklyPlan: weeklyPlan || null
            };
        });
        return {
            week_start_date: actualWeekStart,
            week_end_date: this.calculateWeekEndDate(actualWeekStart),
            schedules: schedulesWithPlans
        };
    }
    async copyFromPreviousWeek(groupId, currentWeekStart, createdBy) {
        const currentWeek = new Date(currentWeekStart + 'T00:00:00.000Z');
        const actualCurrentWeek = this.getWeekStartDate(currentWeek);
        const previousWeek = new Date(actualCurrentWeek);
        previousWeek.setDate(previousWeek.getDate() - 7);
        const previousPlans = await this.getWeeklySessionPlans(groupId || undefined, previousWeek.toISOString().split('T')[0]);
        const newPlans = [];
        for (const prevPlan of previousPlans) {
            try {
                const schedule = await this.scheduleRepository.findOne({
                    where: { id: prevPlan.schedule_id },
                    relations: ['group']
                });
                if (schedule) {
                    const newPlan = await this.createWeeklySessionPlan({
                        groupId: schedule.group_id,
                        weekStartDate: actualCurrentWeek.toISOString().split('T')[0],
                        title: prevPlan.task_title,
                        description: prevPlan.task_description,
                        created_by: createdBy
                    });
                    newPlans.push(newPlan);
                }
            }
            catch (error) {
                if (!error.message.includes('already exists')) {
                    throw error;
                }
            }
        }
        return newPlans;
    }
    async updateTaskStatus(taskId, status) {
        const plan = await this.getWeeklySessionPlanById(taskId);
        const isCompleted = status === 'completed';
        const updateData = {
            is_completed: isCompleted
        };
        if (isCompleted && !plan.is_completed) {
            updateData['completion_date'] = new Date();
        }
        if (!isCompleted && plan.is_completed) {
            updateData['completion_date'] = null;
        }
        return await this.updateWeeklySessionPlan(taskId, updateData);
    }
    async completeSession(planId, data) {
        const updateData = {
            session_status: 'completed',
            completion_description: data.completion_description,
            completed_by: data.completed_by,
            completed_at: new Date(),
            is_completed: true
        };
        return await this.updateWeeklySessionPlan(planId, updateData);
    }
    async updateSessionStatus(planId, status, data) {
        const updateData = {
            session_status: status
        };
        if (data?.completion_description) {
            updateData.completion_description = data.completion_description;
        }
        if (data?.completed_by) {
            updateData.completed_by = data.completed_by;
        }
        if (status === 'completed') {
            updateData.completed_at = new Date();
            updateData.is_completed = true;
        }
        else if (status === 'pending') {
            updateData.completed_at = null;
            updateData.is_completed = false;
        }
        return await this.updateWeeklySessionPlan(planId, updateData);
    }
};
exports.WeeklySessionPlanService = WeeklySessionPlanService;
exports.WeeklySessionPlanService = WeeklySessionPlanService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(weekly_session_plan_entity_1.WeeklySessionPlan)),
    __param(1, (0, typeorm_1.InjectRepository)(schedule_entity_1.Schedule)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], WeeklySessionPlanService);
//# sourceMappingURL=weekly-session-plan.service.js.map