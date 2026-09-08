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
exports.MilestoneController = void 0;
const common_1 = require("@nestjs/common");
const milestone_service_1 = require("../services/milestone.service");
const phase_service_1 = require("../services/phase.service");
const course_service_1 = require("../services/course.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let MilestoneController = class MilestoneController {
    milestoneService;
    phaseService;
    courseService;
    constructor(milestoneService, phaseService, courseService) {
        this.milestoneService = milestoneService;
        this.phaseService = phaseService;
        this.courseService = courseService;
    }
    async assertCourseAccess(req, courseId) {
        const course = await this.courseService.findOne(courseId);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        return course;
    }
    async assertPhaseAccess(req, phaseId) {
        const phase = await this.phaseService.findOne(phaseId);
        this.assertPhaseSchool(req, phase);
        return phase;
    }
    assertPhaseSchool(req, phase) {
        (0, school_access_1.assertSameSchool)(req.user, phase.course?.school_id);
    }
    assertMilestoneAccess(req, milestone) {
        (0, school_access_1.assertSameSchool)(req.user, milestone.phase?.course?.school_id);
    }
    async create(req, createMilestoneDto) {
        try {
            await this.assertPhaseAccess(req, createMilestoneDto.phaseId);
            const milestone = await this.milestoneService.create(createMilestoneDto);
            return {
                success: true,
                data: milestone,
                message: 'Milestone created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findByPhase(req, phaseId) {
        try {
            await this.assertPhaseAccess(req, phaseId);
            const milestones = await this.milestoneService.findByPhase(phaseId);
            return {
                success: true,
                data: milestones,
                count: milestones.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findByCourse(req, courseId) {
        try {
            await this.assertCourseAccess(req, courseId);
            const milestones = await this.milestoneService.findByCourse(courseId);
            return {
                success: true,
                data: milestones,
                count: milestones.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async getRequiredMilestones(req, phaseId) {
        try {
            await this.assertPhaseAccess(req, phaseId);
            const milestones = await this.milestoneService.getRequiredMilestones(phaseId);
            return {
                success: true,
                data: milestones,
                count: milestones.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findOne(req, id) {
        try {
            const milestone = await this.milestoneService.findOne(id);
            this.assertMilestoneAccess(req, milestone);
            return {
                success: true,
                data: milestone
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async getStats(req, id) {
        try {
            const milestone = await this.milestoneService.findOne(id);
            this.assertMilestoneAccess(req, milestone);
            const stats = await this.milestoneService.getMilestoneStats(id);
            return {
                success: true,
                data: stats
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async update(req, id, updateMilestoneDto) {
        try {
            const existing = await this.milestoneService.findOne(id);
            this.assertMilestoneAccess(req, existing);
            if (updateMilestoneDto.phaseId) {
                await this.assertPhaseAccess(req, updateMilestoneDto.phaseId);
            }
            const milestone = await this.milestoneService.update(id, updateMilestoneDto);
            return {
                success: true,
                data: milestone,
                message: 'Milestone updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async duplicate(req, id, body) {
        try {
            const existing = await this.milestoneService.findOne(id);
            this.assertMilestoneAccess(req, existing);
            const duplicatedMilestone = await this.milestoneService.duplicateMilestone(id, body.newName);
            return {
                success: true,
                data: duplicatedMilestone,
                message: 'Milestone duplicated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async reorderMilestones(req, phaseId, body) {
        try {
            await this.assertPhaseAccess(req, phaseId);
            const milestones = await this.milestoneService.reorderMilestones(phaseId, body.milestoneOrders);
            return {
                success: true,
                data: milestones,
                message: 'Milestones reordered successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async getNextOrder(req, phaseId) {
        try {
            await this.assertPhaseAccess(req, phaseId);
            const nextOrder = await this.milestoneService.getNextOrder(phaseId);
            return {
                success: true,
                data: { nextOrder }
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async remove(req, id) {
        try {
            const milestone = await this.milestoneService.findOne(id);
            this.assertMilestoneAccess(req, milestone);
            await this.milestoneService.remove(id);
            return {
                success: true,
                message: 'Milestone deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
};
exports.MilestoneController = MilestoneController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findByPhase", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId/required'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getRequiredMilestones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'create'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)('phase/:phaseId/reorder'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('phaseId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "reorderMilestones", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId/next-order'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getNextOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "remove", null);
exports.MilestoneController = MilestoneController = __decorate([
    (0, common_1.Controller)('milestones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'view'),
    __metadata("design:paramtypes", [milestone_service_1.MilestoneService,
        phase_service_1.PhaseService,
        course_service_1.CourseService])
], MilestoneController);
//# sourceMappingURL=milestone.controller.js.map