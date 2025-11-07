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
exports.WeeklySessionPlanController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const weekly_session_plan_service_1 = require("../services/weekly-session-plan.service");
let WeeklySessionPlanController = class WeeklySessionPlanController {
    constructor(weeklySessionPlanService) {
        this.weeklySessionPlanService = weeklySessionPlanService;
    }
    async createWeeklySessionPlan(createDto, req) {
        try {
            const plan = await this.weeklySessionPlanService.createWeeklySessionPlan({
                ...createDto,
                created_by: req.user?.id || 'e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5'
            });
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan created successfully'
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
    async getWeeklySessionPlans(groupId, weekStartDate, scheduleId) {
        try {
            const plans = await this.weeklySessionPlanService.getWeeklySessionPlans(groupId, weekStartDate, scheduleId);
            return {
                success: true,
                data: plans,
                count: plans.length,
                message: 'Weekly session plans retrieved successfully'
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
    async getGroupWeeklyPlanning(groupId, weekStartDate) {
        try {
            const planning = await this.weeklySessionPlanService.getGroupWeeklyPlanning(groupId, weekStartDate);
            return {
                success: true,
                data: planning,
                message: 'Group weekly planning retrieved successfully'
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
    async getWeeklySessionPlanById(id) {
        try {
            const plan = await this.weeklySessionPlanService.getWeeklySessionPlanById(id);
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan retrieved successfully'
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
    async updateWeeklySessionPlan(id, updateDto) {
        try {
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, updateDto);
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan updated successfully'
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
    async markSessionComplete(id, body) {
        try {
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
                is_completed: true,
                completion_notes: body.completion_notes
            });
            return {
                success: true,
                data: plan,
                message: 'Session marked as completed successfully'
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
    async markSessionIncomplete(id) {
        try {
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
                is_completed: false,
                completion_notes: undefined
            });
            return {
                success: true,
                data: plan,
                message: 'Session marked as incomplete successfully'
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
    async deleteWeeklySessionPlan(id) {
        try {
            await this.weeklySessionPlanService.deleteWeeklySessionPlan(id);
            return {
                success: true,
                message: 'Weekly session plan deleted successfully',
                data: null
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message,
                error: error.name
            });
        }
    }
    async copyFromPreviousWeek(body, req) {
        try {
            const newPlans = await this.weeklySessionPlanService.copyFromPreviousWeek(undefined, body.currentWeekStartDate, req.user?.id || 'e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5');
            return {
                success: true,
                data: newPlans,
                count: newPlans.length,
                message: `Copied ${newPlans.length} plans from previous week`
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
exports.WeeklySessionPlanController = WeeklySessionPlanController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "createWeeklySessionPlan", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('group_id')),
    __param(1, (0, common_1.Query)('week_start_date')),
    __param(2, (0, common_1.Query)('schedule_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getWeeklySessionPlans", null);
__decorate([
    (0, common_1.Get)('group/:groupId/week/:weekStartDate'),
    __param(0, (0, common_1.Param)('groupId')),
    __param(1, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getGroupWeeklyPlanning", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getWeeklySessionPlanById", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "updateWeeklySessionPlan", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "markSessionComplete", null);
__decorate([
    (0, common_1.Put)(':id/incomplete'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "markSessionIncomplete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "deleteWeeklySessionPlan", null);
__decorate([
    (0, common_1.Post)('copy-from-previous-week'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "copyFromPreviousWeek", null);
exports.WeeklySessionPlanController = WeeklySessionPlanController = __decorate([
    (0, common_1.Controller)('weekly-session-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [weekly_session_plan_service_1.WeeklySessionPlanService])
], WeeklySessionPlanController);
