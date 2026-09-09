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
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let GroupController = class GroupController {
    groupService;
    constructor(groupService) {
        this.groupService = groupService;
    }
    schoolOf(req, requested) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user, requested);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async create(req, createGroupDto) {
        const schoolId = this.schoolOf(req, createGroupDto.school_id);
        createGroupDto.school_id = schoolId;
        return {
            success: true,
            data: await this.groupService.create(createGroupDto),
            message: 'Group created successfully',
        };
    }
    async findAll(req, schoolId, isActive, paymentLevelId) {
        const requested = schoolId ? parseInt(schoolId, 10) : undefined;
        const schoolIdNum = this.schoolOf(req, requested);
        const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;
        try {
            const groups = await this.groupService.findAll(schoolIdNum, isActiveBool, paymentLevelId);
            return {
                success: true,
                data: groups,
                message: groups.length > 0 ? 'Groups retrieved successfully' : 'No groups found in database',
                count: groups.length
            };
        }
        catch (error) {
            console.error(`GET /groups - Database error: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByAcademicYear(req, year, schoolId) {
        const scopedSchoolId = this.schoolOf(req, schoolId);
        return {
            success: true,
            data: await this.groupService.findByAcademicYear(scopedSchoolId, year),
            message: 'Groups for academic year retrieved successfully',
        };
    }
    async findBySupervisor(req, supervisorId) {
        this.schoolOf(req);
        return {
            success: true,
            data: await this.groupService.findBySupervisor(supervisorId),
            message: 'Groups for supervisor retrieved successfully',
        };
    }
    async findOne(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: group,
            message: 'Group retrieved successfully',
        };
    }
    async getCapacity(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: await this.groupService.getGroupCapacity(id),
            message: 'Group capacity retrieved successfully',
        };
    }
    async getStatistics(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: await this.groupService.getGroupStatistics(id),
            message: 'Group statistics retrieved successfully',
        };
    }
    async update(req, id, updateGroupDto) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: await this.groupService.update(id, updateGroupDto),
            message: 'Group updated successfully',
        };
    }
    async updateStudentCount(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: await this.groupService.updateStudentCount(id),
            message: 'Group student count updated successfully',
        };
    }
    async deactivate(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
        return {
            success: true,
            data: await this.groupService.deactivate(id),
            message: 'Group deactivated successfully',
        };
    }
    async remove(req, id) {
        const group = await this.groupService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, group.school_id);
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
    (0, require_claim_decorator_1.RequireClaim)('groups', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'groups', action: 'view' }, { page: 'schedules', action: 'view' }, { page: 'attendance', action: 'view' }, { page: 'attendance_sessions', action: 'view' }, { page: 'students', action: 'view' }, { page: 'activities', action: 'view' }, { page: 'progress', action: 'view' }, { page: 'reports', action: 'view' }, { page: 'weekly_session_plans', action: 'view' }, { page: 'chat', action: 'view' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('school_id')),
    __param(2, (0, common_1.Query)('is_active')),
    __param(3, (0, common_1.Query)('payment_level_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('academic-year/:year'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('year')),
    __param(2, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findByAcademicYear", null);
__decorate([
    (0, common_1.Get)('supervisor/:supervisorId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('supervisorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findBySupervisor", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/capacity'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getCapacity", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('groups', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/student-count'),
    (0, require_claim_decorator_1.RequireClaim)('groups', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "updateStudentCount", null);
__decorate([
    (0, common_1.Patch)(':id/deactivate'),
    (0, require_claim_decorator_1.RequireClaim)('groups', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "deactivate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('groups', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], GroupController.prototype, "remove", null);
exports.GroupController = GroupController = __decorate([
    (0, common_1.Controller)('groups'),
    (0, require_claim_decorator_1.RequireClaim)('groups', 'view'),
    __metadata("design:paramtypes", [group_service_1.GroupService])
], GroupController);
//# sourceMappingURL=group.controller.js.map