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
let ClassSettingsController = class ClassSettingsController {
    classSettingsService;
    constructor(classSettingsService) {
        this.classSettingsService = classSettingsService;
    }
    async create(createClassSettingsDto) {
        try {
            const classSettings = await this.classSettingsService.create(createClassSettingsDto);
            return {
                success: true,
                data: classSettings,
                message: 'Class settings created successfully'
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
            const classSettings = await this.classSettingsService.findAll();
            return {
                success: true,
                data: classSettings,
                count: classSettings.length
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
    async findActive() {
        try {
            const activeSettings = await this.classSettingsService.findActive();
            return {
                success: true,
                data: activeSettings
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
    async getOrCreateDefault() {
        try {
            const defaultSettings = await this.classSettingsService.getOrCreateDefault();
            return {
                success: true,
                data: defaultSettings
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
    async getAvailableTimeSlots() {
        try {
            const timeSlots = await this.classSettingsService.getAvailableTimeSlots();
            return {
                success: true,
                data: timeSlots
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
            const classSettings = await this.classSettingsService.findOne(id);
            return {
                success: true,
                data: classSettings
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
    async update(id, updateClassSettingsDto) {
        try {
            const classSettings = await this.classSettingsService.update(id, updateClassSettingsDto);
            return {
                success: true,
                data: classSettings,
                message: 'Class settings updated successfully'
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
    async setActive(id) {
        try {
            const classSettings = await this.classSettingsService.setActive(id);
            return {
                success: true,
                data: classSettings,
                message: 'Class settings activated successfully'
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
    async addDuration(body) {
        try {
            const classSettings = await this.classSettingsService.addDuration(body.duration);
            return {
                success: true,
                data: classSettings,
                message: 'Duration added successfully'
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
    async removeDuration(duration) {
        try {
            const classSettings = await this.classSettingsService.removeDuration(parseInt(duration));
            return {
                success: true,
                data: classSettings,
                message: 'Duration removed successfully'
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
    async addStartTime(body) {
        try {
            const classSettings = await this.classSettingsService.addStartTime(body.startTime);
            return {
                success: true,
                data: classSettings,
                message: 'Start time added successfully'
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
    async removeStartTime(startTime) {
        try {
            const classSettings = await this.classSettingsService.removeStartTime(startTime);
            return {
                success: true,
                data: classSettings,
                message: 'Start time removed successfully'
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
    async setDefaultDuration(body) {
        try {
            const classSettings = await this.classSettingsService.setDefaultDuration(body.duration);
            return {
                success: true,
                data: classSettings,
                message: 'Default duration set successfully'
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
    async validateTimeSlot(body) {
        try {
            const isValid = await this.classSettingsService.validateTimeSlot(body.startTime, body.duration);
            return {
                success: true,
                data: { isValid },
                message: isValid ? 'Time slot is valid' : 'Time slot is invalid'
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
            await this.classSettingsService.remove(id);
            return {
                success: true,
                message: 'Class settings deleted successfully'
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
exports.ClassSettingsController = ClassSettingsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('default'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "getOrCreateDefault", null);
__decorate([
    (0, common_1.Get)('time-slots'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "getAvailableTimeSlots", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/set-active'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "setActive", null);
__decorate([
    (0, common_1.Post)('durations'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "addDuration", null);
__decorate([
    (0, common_1.Delete)('durations/:duration'),
    __param(0, (0, common_1.Param)('duration')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "removeDuration", null);
__decorate([
    (0, common_1.Post)('start-times'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "addStartTime", null);
__decorate([
    (0, common_1.Delete)('start-times/:startTime'),
    __param(0, (0, common_1.Param)('startTime')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "removeStartTime", null);
__decorate([
    (0, common_1.Patch)('default-duration'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "setDefaultDuration", null);
__decorate([
    (0, common_1.Post)('validate-time-slot'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "validateTimeSlot", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ClassSettingsController.prototype, "remove", null);
exports.ClassSettingsController = ClassSettingsController = __decorate([
    (0, common_1.Controller)('class-settings'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [class_settings_service_1.ClassSettingsService])
], ClassSettingsController);
//# sourceMappingURL=class-settings.controller.js.map