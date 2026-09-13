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
exports.PhaseController = void 0;
const common_1 = require("@nestjs/common");
const phase_service_1 = require("../services/phase.service");
const course_service_1 = require("../services/course.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let PhaseController = class PhaseController {
    phaseService;
    courseService;
    constructor(phaseService, courseService) {
        this.phaseService = phaseService;
        this.courseService = courseService;
    }
    async assertCourseAccess(req, courseId) {
        const course = await this.courseService.findOne(courseId);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        return course;
    }
    assertPhaseAccess(req, phase) {
        (0, school_access_1.assertSameSchool)(req.user, phase.course?.school_id);
    }
    async create(req, createPhaseDto) {
        await this.assertCourseAccess(req, createPhaseDto.courseId);
        const phase = await this.phaseService.create(createPhaseDto);
        return {
            success: true,
            data: phase,
            message: 'Phase created successfully',
        };
    }
    async findByCourse(req, courseId) {
        await this.assertCourseAccess(req, courseId);
        const phases = await this.phaseService.findByCourse(courseId);
        return {
            success: true,
            data: phases,
            count: phases.length,
        };
    }
    async findOne(req, id) {
        const phase = await this.phaseService.findOne(id);
        this.assertPhaseAccess(req, phase);
        return {
            success: true,
            data: phase,
        };
    }
    async update(req, id, updatePhaseDto) {
        const existing = await this.phaseService.findOne(id);
        this.assertPhaseAccess(req, existing);
        if (updatePhaseDto.courseId) {
            await this.assertCourseAccess(req, updatePhaseDto.courseId);
        }
        const phase = await this.phaseService.update(id, updatePhaseDto);
        return {
            success: true,
            data: phase,
            message: 'Phase updated successfully',
        };
    }
    async duplicate(req, id, body) {
        const existing = await this.phaseService.findOne(id);
        this.assertPhaseAccess(req, existing);
        const duplicatedPhase = await this.phaseService.duplicatePhase(id, body.newName);
        return {
            success: true,
            data: duplicatedPhase,
            message: 'Phase duplicated successfully',
        };
    }
    async reorderPhases(req, courseId, body) {
        await this.assertCourseAccess(req, courseId);
        const phases = await this.phaseService.reorderPhases(courseId, body.phaseOrders);
        return {
            success: true,
            data: phases,
            message: 'Phases reordered successfully',
        };
    }
    async getNextOrder(req, courseId) {
        await this.assertCourseAccess(req, courseId);
        const nextOrder = await this.phaseService.getNextOrder(courseId);
        return {
            success: true,
            data: { nextOrder },
        };
    }
    async remove(req, id) {
        const phase = await this.phaseService.findOne(id);
        this.assertPhaseAccess(req, phase);
        await this.phaseService.remove(id);
        return {
            success: true,
            message: 'Phase deleted successfully',
        };
    }
};
exports.PhaseController = PhaseController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)('course/:courseId/reorder'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "reorderPhases", null);
__decorate([
    (0, common_1.Get)('course/:courseId/next-order'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "getNextOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "remove", null);
exports.PhaseController = PhaseController = __decorate([
    (0, common_1.Controller)('phases'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'view'),
    __metadata("design:paramtypes", [phase_service_1.PhaseService,
        course_service_1.CourseService])
], PhaseController);
//# sourceMappingURL=phase.controller.js.map