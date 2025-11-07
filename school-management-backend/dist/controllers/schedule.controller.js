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
exports.ScheduleController = void 0;
const common_1 = require("@nestjs/common");
const schedule_service_1 = require("../services/schedule.service");
let ScheduleController = class ScheduleController {
    constructor(scheduleService) {
        this.scheduleService = scheduleService;
    }
    async create(createScheduleDto) {
        return {
            success: true,
            data: await this.scheduleService.create(createScheduleDto),
            message: 'Schedule created successfully',
        };
    }
    async findAll() {
        return {
            success: true,
            data: await this.scheduleService.findAll(),
            message: 'Schedules retrieved successfully',
        };
    }
    async findByGroup(groupId) {
        return {
            success: true,
            data: await this.scheduleService.findByGroup(groupId),
            message: 'Group schedules retrieved successfully',
        };
    }
    async findByTeacher(teacherId) {
        return {
            success: true,
            data: await this.scheduleService.findByTeacher(teacherId),
            message: 'Teacher schedules retrieved successfully',
        };
    }
    async findTeacherCourses(teacherId) {
        return {
            success: true,
            data: await this.scheduleService.findTeacherCourses(teacherId),
            message: 'Teacher courses retrieved successfully',
        };
    }
    async findByRoom(roomId) {
        return {
            success: true,
            data: await this.scheduleService.findByRoom(roomId),
            message: 'Room schedules retrieved successfully',
        };
    }
    async findByDay(dayOfWeek) {
        return {
            success: true,
            data: await this.scheduleService.findByDay(dayOfWeek),
            message: 'Daily schedules retrieved successfully',
        };
    }
    async getWeeklySchedule(groupId, teacherId) {
        return {
            success: true,
            data: await this.scheduleService.getWeeklySchedule(groupId, teacherId),
            message: 'Weekly schedule retrieved successfully',
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.scheduleService.findOne(id),
            message: 'Schedule retrieved successfully',
        };
    }
    async update(id, updateScheduleDto) {
        return {
            success: true,
            data: await this.scheduleService.update(id, updateScheduleDto),
            message: 'Schedule updated successfully',
        };
    }
    async cancel(id) {
        return {
            success: true,
            data: await this.scheduleService.cancelSchedule(id),
            message: 'Schedule cancelled successfully',
        };
    }
    async remove(id) {
        await this.scheduleService.remove(id);
        return {
            success: true,
            message: 'Schedule deleted successfully',
        };
    }
};
exports.ScheduleController = ScheduleController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findByTeacher", null);
__decorate([
    (0, common_1.Get)('teacher/:teacherId/courses'),
    __param(0, (0, common_1.Param)('teacherId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findTeacherCourses", null);
__decorate([
    (0, common_1.Get)('room/:roomId'),
    __param(0, (0, common_1.Param)('roomId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findByRoom", null);
__decorate([
    (0, common_1.Get)('day/:dayOfWeek'),
    __param(0, (0, common_1.Param)('dayOfWeek')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findByDay", null);
__decorate([
    (0, common_1.Get)('weekly'),
    __param(0, (0, common_1.Query)('group_id')),
    __param(1, (0, common_1.Query)('teacher_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "getWeeklySchedule", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/cancel'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "cancel", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ScheduleController.prototype, "remove", null);
exports.ScheduleController = ScheduleController = __decorate([
    (0, common_1.Controller)('schedules'),
    __metadata("design:paramtypes", [schedule_service_1.ScheduleService])
], ScheduleController);
