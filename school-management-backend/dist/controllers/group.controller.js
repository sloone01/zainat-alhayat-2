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
exports.GroupController = void 0;
const common_1 = require("@nestjs/common");
const group_service_1 = require("../services/group.service");
let GroupController = class GroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    async create(createGroupDto) {
        return {
            success: true,
            data: await this.groupService.create(createGroupDto),
            message: 'Group created successfully',
        };
    }
    async findAll(schoolId, isActive) {
        const schoolIdNum = schoolId ? parseInt(schoolId) : undefined;
        const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
        return {
            success: true,
            data: await this.groupService.findAll(schoolIdNum, isActiveBool),
            message: 'Groups retrieved successfully',
        };
    }
    async findByAcademicYear(year, schoolId) {
        return {
            success: true,
            data: await this.groupService.findByAcademicYear(schoolId, year),
            message: 'Groups for academic year retrieved successfully',
        };
    }
    async findBySupervisor(supervisorId) {
        return {
            success: true,
            data: await this.groupService.findBySupervisor(supervisorId),
            message: 'Groups for supervisor retrieved successfully',
        };
    }
    async findOne(id) {
        return {
            success: true,
            data: await this.groupService.findOne(id),
            message: 'Group retrieved successfully',
        };
    }
    async getCapacity(id) {
        return {
            success: true,
            data: await this.groupService.getGroupCapacity(id),
            message: 'Group capacity retrieved successfully',
        };
    }
    async getStatistics(id) {
        return {
            success: true,
            data: await this.groupService.getGroupStatistics(id),
            message: 'Group statistics retrieved successfully',
        };
    }
    async update(id, updateGroupDto) {
        return {
            success: true,
            data: await this.groupService.update(id, updateGroupDto),
            message: 'Group updated successfully',
        };
    }
    async updateStudentCount(id) {
        return {
            success: true,
            data: await this.groupService.updateStudentCount(id),
            message: 'Group student count updated successfully',
        };
    }
    async deactivate(id) {
        return {
            success: true,
            data: await this.groupService.deactivate(id),
            message: 'Group deactivated successfully',
        };
    }
    async remove(id) {
        await this.groupService.remove(id);
        return {
            success: true,
            message: 'Group deleted successfully',
        };
    }
};
exports.GroupController = GroupController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('school_id')),
    __param(1, (0, common_1.Query)('is_active')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('academic-year/:year'),
    __param(0, (0, common_1.Param)('year')),
    __param(1, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findByAcademicYear", null);
__decorate([
    (0, common_1.Get)('supervisor/:supervisorId'),
    __param(0, (0, common_1.Param)('supervisorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findBySupervisor", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/capacity'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getCapacity", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/student-count'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "updateStudentCount", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "remove", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('groups'),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map