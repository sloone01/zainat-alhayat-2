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
exports.StudentProgressController = void 0;
const common_1 = require("@nestjs/common");
const student_progress_service_1 = require("../services/student-progress.service");
let StudentProgressController = class StudentProgressController {
    constructor(progressService) {
        this.progressService = progressService;
    }
    async create(createProgressDto) {
        return {
            success: true,
            data: await this.progressService.create(createProgressDto),
            message: 'Progress record created successfully',
        };
    }
    async bulkUpdate(bulkUpdateDto) {
        return {
            success: true,
            data: await this.progressService.bulkUpdate(bulkUpdateDto),
            message: 'Bulk progress update completed successfully',
        };
    }
    async findAll() {
        return {
            success: true,
            data: await this.progressService.findAll(),
            message: 'Progress records retrieved successfully',
        };
    }
    async findByStudent(studentId) {
        return {
            success: true,
            data: await this.progressService.findByStudent(studentId),
            message: 'Student progress records retrieved successfully',
        };
    }
    async findByCourse(courseId) {
        return {
            success: true,
            data: await this.progressService.findByCourse(courseId),
            message: 'Course progress records retrieved successfully',
        };
    }
    async findByMilestone(milestoneId) {
        return {
            success: true,
            data: await this.progressService.findByMilestone(milestoneId),
            message: 'Milestone progress records retrieved successfully',
        };
    }
    async findByStudentAndCourse(studentId, courseId) {
        return {
            success: true,
            data: await this.progressService.findByStudentAndCourse(studentId, courseId),
            message: 'Student course progress retrieved successfully',
        };
    }
    async findByStudentAndMilestone(studentId, milestoneId) {
        return {
            success: true,
            data: await this.progressService.findByStudentAndMilestone(studentId, milestoneId),
            message: 'Student milestone progress retrieved successfully',
        };
    }
    async getStudentCourseProgress(studentId, courseId) {
        return {
            success: true,
            data: await this.progressService.getStudentCourseProgress(studentId, courseId),
            message: 'Student course progress summary retrieved successfully',
        };
    }
    async getCourseProgressSummary(courseId) {
        return {
            success: true,
            data: await this.progressService.getCourseProgressSummary(courseId),
            message: 'Course progress summary retrieved successfully',
        };
    }
    async getMilestoneProgressSummary(milestoneId) {
        return {
            success: true,
            data: await this.progressService.getMilestoneProgressSummary(milestoneId),
            message: 'Milestone progress summary retrieved successfully',
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.progressService.findOne(id),
            message: 'Progress record retrieved successfully',
        };
    }
    async update(id, updateProgressDto) {
        return {
            success: true,
            data: await this.progressService.update(id, updateProgressDto),
            message: 'Progress record updated successfully',
        };
    }
    async remove(id) {
        await this.progressService.remove(id);
        return {
            success: true,
            message: 'Progress record deleted successfully',
        };
    }
};
exports.StudentProgressController = StudentProgressController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('bulk-update'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "bulkUpdate", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('student/:studentId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findByStudent", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)('milestone/:milestoneId'),
    __param(0, (0, common_1.Param)('milestoneId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findByMilestone", null);
__decorate([
    (0, common_1.Get)('student/:studentId/course/:courseId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findByStudentAndCourse", null);
__decorate([
    (0, common_1.Get)('student/:studentId/milestone/:milestoneId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('milestoneId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findByStudentAndMilestone", null);
__decorate([
    (0, common_1.Get)('summary/student/:studentId/course/:courseId'),
    __param(0, (0, common_1.Param)('studentId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "getStudentCourseProgress", null);
__decorate([
    (0, common_1.Get)('summary/course/:courseId'),
    __param(0, (0, common_1.Param)('courseId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "getCourseProgressSummary", null);
__decorate([
    (0, common_1.Get)('summary/milestone/:milestoneId'),
    __param(0, (0, common_1.Param)('milestoneId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "getMilestoneProgressSummary", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], StudentProgressController.prototype, "remove", null);
exports.StudentProgressController = StudentProgressController = __decorate([
    (0, common_1.Controller)('student-progress'),
    __metadata("design:paramtypes", [student_progress_service_1.StudentProgressService])
], StudentProgressController);
