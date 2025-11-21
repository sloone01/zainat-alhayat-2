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
exports.AttendanceController = void 0;
const common_1 = require("@nestjs/common");
const attendance_service_1 = require("../services/attendance.service");
let AttendanceController = class AttendanceController {
    attendanceService;
    constructor(attendanceService) {
        this.attendanceService = attendanceService;
    }
    async create(createAttendanceDto) {
        return {
            success: true,
            data: await this.attendanceService.create(createAttendanceDto),
            message: 'Attendance record created successfully',
        };
    }
    async bulkCreate(bulkAttendanceDto) {
        return {
            success: true,
            data: await this.attendanceService.bulkCreate(bulkAttendanceDto),
            message: 'Bulk attendance records created successfully',
        };
    }
    async findAll() {
        return {
            success: true,
            data: await this.attendanceService.findAll(),
            message: 'Attendance records retrieved successfully',
        };
    }
    async findByGroup(groupId, date) {
        const attendanceDate = date ? new Date(date) : undefined;
        return {
            success: true,
            data: await this.attendanceService.findByGroup(groupId, attendanceDate),
            message: 'Group attendance records retrieved successfully',
        };
    }
    async findByStudent(studentId, startDate, endDate) {
        const start = startDate ? new Date(startDate) : undefined;
        const end = endDate ? new Date(endDate) : undefined;
        return {
            success: true,
            data: await this.attendanceService.findByStudent(studentId, start, end),
            message: 'Student attendance records retrieved successfully',
        };
    }
    async findByDate(date) {
        return {
            success: true,
            data: await this.attendanceService.findByDate(new Date(date)),
            message: 'Daily attendance records retrieved successfully',
        };
    }
    async getGroupStatistics(groupId, startDate, endDate) {
        return {
            success: true,
            data: await this.attendanceService.getAttendanceStatistics(groupId, new Date(startDate), new Date(endDate)),
            message: 'Group attendance statistics retrieved successfully',
        };
    }
    async getStudentStatistics(studentId, startDate, endDate) {
        return {
            success: true,
            data: await this.attendanceService.getStudentAttendanceRate(studentId, new Date(startDate), new Date(endDate)),
            message: 'Student attendance statistics retrieved successfully',
        };
    }
    async getDailyReport(date) {
        return {
            success: true,
            data: await this.attendanceService.getDailyAttendanceReport(new Date(date)),
            message: 'Daily attendance report retrieved successfully',
        };
    }
    async checkExisting(studentId, date) {
        return {
            success: true,
            data: await this.attendanceService.checkExistingAttendance(studentId, new Date(date)),
            message: 'Attendance check completed successfully',
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.attendanceService.findOne(id),
            message: 'Attendance record retrieved successfully',
        };
    }
    async update(id, updateAttendanceDto) {
        return {
            success: true,
            data: await this.attendanceService.update(id, updateAttendanceDto),
            message: 'Attendance record updated successfully',
        };
    }
    async remove(id) {
        await this.attendanceService.remove(id);
        return {
            success: true,
            message: 'Attendance record deleted successfully',
        };
    }
};
exports.AttendanceController = AttendanceController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "bulkCreate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Query)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('date/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findByDate", null);
__decorate([
    (0, common_1.Get)('statistics/group/:groupId'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getGroupStatistics", null);
__decorate([
    (0, common_1.Get)('statistics/student/:studentId'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Query)('start_date')),
    __param(2, (0, common_1.Query)('end_date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getStudentStatistics", null);
__decorate([
    (0, common_1.Get)('report/daily/:date'),
    __param(0, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "getDailyReport", null);
__decorate([
    (0, common_1.Get)('check/:studentId/:date'),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.Param)('date')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "checkExisting", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AttendanceController.prototype, "remove", null);
exports.AttendanceController = AttendanceController = __decorate([
    (0, common_1.Controller)('attendance'),
    __metadata("design:paramtypes", [attendance_service_1.AttendanceService])
], AttendanceController);
//# sourceMappingURL=attendance.controller.js.map