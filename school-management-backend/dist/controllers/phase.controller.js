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
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let PhaseController = class PhaseController {
    phaseService;
    constructor(phaseService) {
        this.phaseService = phaseService;
    }
    async create(createPhaseDto) {
        try {
            const phase = await this.phaseService.create(createPhaseDto);
            return {
                success: true,
                data: phase,
                message: 'Phase created successfully'
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
            const phases = await this.phaseService.findAll();
            return {
                success: true,
                data: phases,
                count: phases.length
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
            const phases = await this.phaseService.findByCourse(courseId);
            return {
                success: true,
                data: phases,
                count: phases.length
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
            const phase = await this.phaseService.findOne(id);
            return {
                success: true,
                data: phase
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
    async update(id, updatePhaseDto) {
        try {
            const phase = await this.phaseService.update(id, updatePhaseDto);
            return {
                success: true,
                data: phase,
                message: 'Phase updated successfully'
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
            const duplicatedPhase = await this.phaseService.duplicatePhase(id, body.newName);
            return {
                success: true,
                data: duplicatedPhase,
                message: 'Phase duplicated successfully'
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
    async reorderPhases(courseId, body) {
        try {
            const phases = await this.phaseService.reorderPhases(courseId, body.phaseOrders);
            return {
                success: true,
                data: phases,
                message: 'Phases reordered successfully'
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
    async getNextOrder(courseId) {
        try {
            const nextOrder = await this.phaseService.getNextOrder(courseId);
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
            await this.phaseService.remove(id);
            return {
                success: true,
                message: 'Phase deleted successfully'
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
exports.PhaseController = PhaseController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('course/:courseId'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "findByCourse", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "update", null);
__decorate([
    (0, common_1.Post)(':id/duplicate'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "duplicate", null);
__decorate([
    (0, common_1.Patch)('course/:courseId/reorder'),
    __param(0, (0, common_1.Param)('courseId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "reorderPhases", null);
__decorate([
    (0, common_1.Get)('course/:courseId/next-order'),
    __param(0, (0, common_1.Param)('courseId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "getNextOrder", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PhaseController.prototype, "remove", null);
exports.PhaseController = PhaseController = __decorate([
    (0, common_1.Controller)('phases'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [phase_service_1.PhaseService])
], PhaseController);
//# sourceMappingURL=phase.controller.js.map