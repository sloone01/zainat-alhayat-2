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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let MilestoneController = class MilestoneController {
    constructor(milestoneService) {
        this.milestoneService = milestoneService;
    }
    async create(createMilestoneDto) {
        try {
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
    async findAll() {
        try {
            const milestones = await this.milestoneService.findAll();
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
    async findByPhase(phaseId) {
        try {
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
    async findByCourse(courseId) {
        try {
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
    async getRequiredMilestones(phaseId) {
        try {
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
    async findOne(id) {
        try {
            const milestone = await this.milestoneService.findOne(id);
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
    async getStats(id) {
        try {
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
    async update(id, updateMilestoneDto) {
        try {
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
    async duplicate(id, body) {
        try {
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
    async reorderMilestones(phaseId, body) {
        try {
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
    async getNextOrder(phaseId) {
        try {
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
    async remove(id) {
        try {
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
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId'),
    __param(0, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findByPhase", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId/required'),
    __param(0, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getRequiredMilestones", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/stats'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getStats", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)('phase/:phaseId/reorder'),
    __param(0, (0, common_1.Param)('phaseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "reorderMilestones", null);
__decorate([
    (0, common_1.Get)('phase/:phaseId/next-order'),
    __param(0, (0, common_1.Param)('phaseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "getNextOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MilestoneController.prototype, "remove", null);
exports.MilestoneController = MilestoneController = __decorate([
    (0, common_1.Controller)('milestones'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [milestone_service_1.MilestoneService])
], MilestoneController);
