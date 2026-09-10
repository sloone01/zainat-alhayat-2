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
exports.ParentController = void 0;
const common_1 = require("@nestjs/common");
const parent_service_1 = require("../services/parent.service");
const student_service_1 = require("../services/student.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let ParentController = class ParentController {
    parentService;
    studentService;
    constructor(parentService, studentService) {
        this.parentService = parentService;
        this.studentService = studentService;
    }
    schoolOf(req, requested) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user, requested);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async getMyDashboardData(req) {
        const dashboardData = await this.parentService.getParentDashboardData(req.user.id);
        return { success: true, data: dashboardData };
    }
    async getMyAttendance(req, offsetRaw, limitRaw) {
        const offset = Math.max(0, parseInt(offsetRaw ?? '0', 10) || 0);
        const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? '5', 10) || 5));
        const data = await this.parentService.getParentAttendanceView(req.user.id, offset, limit);
        return { success: true, data };
    }
    async getMyAssignedActivities(req) {
        const data = await this.parentService.getParentAssignedActivities(req.user.id);
        return { success: true, data, count: data.length };
    }
    async getMyBusMovements(req, requestedSchoolId, date, limitRaw) {
        const schoolId = this.schoolOf(req, requestedSchoolId);
        const limit = Math.min(100, Math.max(1, parseInt(limitRaw ?? '30', 10) || 30));
        const data = await this.parentService.getParentBusMovementLogs(req.user.id, schoolId, {
            date,
            limit,
        });
        return { success: true, data };
    }
    async shareChildBusPickup(req, studentId, body) {
        if (body.pickup_lat == null || body.pickup_lng == null) {
            throw new common_1.BadRequestException('pickup_lat and pickup_lng are required');
        }
        const data = await this.studentService.setPickupAsParent(req.user.id, studentId, {
            pickup_lat: Number(body.pickup_lat),
            pickup_lng: Number(body.pickup_lng),
        });
        return { success: true, data, message: 'Pickup location shared' };
    }
    async create(req, createParentDto) {
        const parent = await this.parentService.create(createParentDto, this.schoolOf(req));
        return {
            success: true,
            data: parent,
            message: 'Parent created successfully',
        };
    }
    async findAll(req) {
        const parents = await this.parentService.findAll(this.schoolOf(req));
        return {
            success: true,
            data: parents,
            count: parents.length,
        };
    }
    async search(req, query) {
        if (!query) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const parents = await this.parentService.searchParents(query, this.schoolOf(req));
        return {
            success: true,
            data: parents,
            count: parents.length,
        };
    }
    async findOne(req, id) {
        const parent = await this.parentService.findOne(id, this.schoolOf(req));
        return { success: true, data: parent };
    }
    async update(req, id, updateParentDto) {
        const parent = await this.parentService.update(id, updateParentDto, this.schoolOf(req));
        return {
            success: true,
            data: parent,
            message: 'Parent updated successfully',
        };
    }
    async assignToStudent(req, id, body) {
        if (!body?.studentId) {
            throw new common_1.BadRequestException('studentId is required');
        }
        const parent = await this.parentService.assignToStudent(id, body.studentId, this.schoolOf(req), body.relationship || 'guardian');
        return {
            success: true,
            data: parent,
            message: 'Parent assigned to student successfully',
        };
    }
    async unassignFromStudent(req, id, studentId) {
        if (!studentId) {
            throw new common_1.BadRequestException('studentId is required');
        }
        const parent = await this.parentService.removeFromStudent(id, studentId, this.schoolOf(req));
        return {
            success: true,
            data: parent,
            message: 'Parent unassigned from student successfully',
        };
    }
    async resetPassword(id, newPassword, req) {
        const result = await this.parentService.resetPassword(id, newPassword, this.schoolOf(req));
        return {
            success: true,
            data: result,
            message: 'Password reset successfully',
        };
    }
    async removeFromStudent(id, studentId, req) {
        const parent = await this.parentService.removeFromStudent(id, studentId, this.schoolOf(req));
        return {
            success: true,
            data: parent,
            message: 'Parent unlinked from student successfully',
        };
    }
    async remove(req, id) {
        await this.parentService.remove(id, this.schoolOf(req));
        return {
            success: true,
            message: 'Parent deleted successfully',
        };
    }
};
exports.ParentController = ParentController;
__decorate([
    (0, common_1.Get)('dashboard/my-data'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getMyDashboardData", null);
__decorate([
    (0, common_1.Get)('dashboard/attendance'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('offset')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getMyAttendance", null);
__decorate([
    (0, common_1.Get)('dashboard/activities'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getMyAssignedActivities", null);
__decorate([
    (0, common_1.Get)('dashboard/bus-movements'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('school_id', school_access_1.RequestedSchoolIdPipe)),
    __param(2, (0, common_1.Query)('date')),
    __param(3, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "getMyBusMovements", null);
__decorate([
    (0, common_1.Patch)('dashboard/students/:studentId/bus-pickup'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "shareChildBusPickup", null);
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('students', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, require_claim_decorator_1.RequireClaim)('students', 'view'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'view'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "search", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'view'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign-student'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "assignToStudent", null);
__decorate([
    (0, common_1.Patch)(':id/unassign-student'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(2, (0, common_1.Body)('studentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "unassignFromStudent", null);
__decorate([
    (0, common_1.Patch)(':id/reset-password'),
    (0, common_1.UseGuards)(roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)('admin'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Body)('newPassword')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "resetPassword", null);
__decorate([
    (0, common_1.Delete)(':id/students/:studentId'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "removeFromStudent", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id', common_1.ParseUUIDPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ParentController.prototype, "remove", null);
exports.ParentController = ParentController = __decorate([
    (0, common_1.Controller)('parents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [parent_service_1.ParentService,
        student_service_1.StudentService])
], ParentController);
//# sourceMappingURL=parent.controller.js.map