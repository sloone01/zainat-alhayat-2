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
exports.ClassSettingsController = void 0;
const common_1 = require("@nestjs/common");
const class_settings_service_1 = require("../services/class-settings.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let ClassSettingsController = class ClassSettingsController {
    classSettingsService;
    constructor(classSettingsService) {
        this.classSettingsService = classSettingsService;
    }
    schoolOf(req) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async assertSettingsAccess(req, id) {
        const classSettings = await this.classSettingsService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, classSettings.school_id);
        return classSettings;
    }
    async create(req, createClassSettingsDto) {
        try {
            const classSettings = await this.classSettingsService.create(createClassSettingsDto, this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                message: 'Class settings created successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async findAll(req) {
        try {
            const classSettings = await this.classSettingsService.findAll(this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                count: classSettings.length,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async findActive(req) {
        try {
            const activeSettings = await this.classSettingsService.findActive(this.schoolOf(req));
            return {
                success: true,
                data: activeSettings,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async getOrCreateDefault(req) {
        try {
            const defaultSettings = await this.classSettingsService.getOrCreateDefault(this.schoolOf(req));
            return {
                success: true,
                data: defaultSettings,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async getAvailableTimeSlots(req) {
        try {
            const timeSlots = await this.classSettingsService.getAvailableTimeSlots(this.schoolOf(req));
            return {
                success: true,
                data: timeSlots,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async findOne(req, id) {
        try {
            const classSettings = await this.assertSettingsAccess(req, id);
            return {
                success: true,
                data: classSettings,
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async update(req, id, updateClassSettingsDto) {
        try {
            const classSettings = await this.classSettingsService.update(id, updateClassSettingsDto, this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                message: 'Class settings updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async setActive(req, id) {
        try {
            const classSettings = await this.classSettingsService.setActive(id, this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                message: 'Class settings activated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async addDuration(req, body) {
        try {
            const classSettings = await this.classSettingsService.addDuration(body.duration, this.schoolOf(req), body.name);
            return {
                success: true,
                data: classSettings,
                message: 'Duration added successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async updateDuration(req, id, body) {
        try {
            const classSettings = await this.classSettingsService.updateDuration(id, this.schoolOf(req), body);
            return {
                success: true,
                data: classSettings,
                message: 'Duration updated successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async removeDuration(req, duration) {
        try {
            await this.classSettingsService.removeDuration(parseInt(duration, 10), this.schoolOf(req));
            return {
                success: true,
                message: 'Duration removed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async addStartTime(req, body) {
        try {
            const classSettings = await this.classSettingsService.addStartTime(body.startTime, this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                message: 'Start time added successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async removeStartTime(req, startTime) {
        try {
            await this.classSettingsService.removeStartTime(startTime, this.schoolOf(req));
            return {
                success: true,
                message: 'Start time removed successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async setDefaultDuration(req, body) {
        try {
            const classSettings = await this.classSettingsService.setDefaultDuration(body.duration, this.schoolOf(req));
            return {
                success: true,
                data: classSettings,
                message: 'Default duration set successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async validateTimeSlot(req, body) {
        try {
            const isValid = await this.classSettingsService.validateTimeSlot(body.startTime, body.duration, this.schoolOf(req));
            return {
                success: true,
                data: { isValid },
                message: isValid ? 'Time slot is valid' : 'Time slot is invalid',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async remove(req, id) {
        try {
            await this.classSettingsService.remove(id, this.schoolOf(req));
            return {
                success: true,
                message: 'Class settings deleted successfully',
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
};
exports.ClassSettingsController = ClassSettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('default'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "getOrCreateDefault", null);
__decorate([
    (0, common_1.Get)('time-slots'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "getAvailableTimeSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/set-active'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "setActive", null);
__decorate([
    (0, common_1.Post)('durations'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "addDuration", null);
__decorate([
    (0, common_1.Patch)('durations/:id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "updateDuration", null);
__decorate([
    (0, common_1.Delete)('durations/:duration'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "removeDuration", null);
__decorate([
    (0, common_1.Post)('start-times'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "addStartTime", null);
__decorate([
    (0, common_1.Delete)('start-times/:startTime'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('startTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "removeStartTime", null);
__decorate([
    (0, common_1.Patch)('default-duration'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "setDefaultDuration", null);
__decorate([
    (0, common_1.Post)('validate-time-slot'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "validateTimeSlot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "remove", null);
exports.ClassSettingsController = ClassSettingsController = __decorate([
    (0, common_1.Controller)('class-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'view'),
    __metadata("design:paramtypes", [class_settings_service_1.ClassSettingsService])
], ClassSettingsController);
//# sourceMappingURL=class-settings.controller.js.map