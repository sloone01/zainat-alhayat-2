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
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const weekly_session_plan_service_1 = require("../services/weekly-session-plan.service");
const group_service_1 = require("../services/group.service");
const school_access_1 = require("../common/security/school-access");
let WeeklySessionPlanController = class WeeklySessionPlanController {
    weeklySessionPlanService;
    groupService;
    constructor(weeklySessionPlanService, groupService) {
        this.weeklySessionPlanService = weeklySessionPlanService;
        this.groupService = groupService;
    }
    schoolOf(req, requested) {
        return (0, school_access_1.resolveActorSchoolId)(req.user, requested);
    }
    async assertGroupSchool(user, groupId) {
        const group = await this.groupService.findOne(groupId);
        (0, school_access_1.assertSameSchool)(user, group.school_id);
        return group;
    }
    async assertPlanSchool(user, planId) {
        const plan = await this.weeklySessionPlanService.getWeeklySessionPlanById(planId);
        (0, school_access_1.assertSameSchool)(user, plan.schedule?.group?.school_id);
        return plan;
    }
    async createWeeklySessionPlan(createDto, req) {
        try {
            await this.assertGroupSchool(req.user, createDto.groupId);
            const plan = await this.weeklySessionPlanService.createWeeklySessionPlan({
                ...createDto,
                created_by: req.user.id,
            });
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan created successfully',
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
    async getWeeklySessionPlans(req, groupId, weekStartDate, scheduleId, schoolIdRaw) {
        try {
            const requestedSchoolId = schoolIdRaw != null && schoolIdRaw !== '' ? String(schoolIdRaw) : undefined;
            const schoolId = this.schoolOf(req, requestedSchoolId);
            if (groupId) {
                await this.assertGroupSchool(req.user, groupId);
            }
            const plans = await this.weeklySessionPlanService.getWeeklySessionPlans(groupId, weekStartDate, scheduleId, schoolId);
            return {
                success: true,
                data: plans,
                count: plans.length,
                message: 'Weekly session plans retrieved successfully',
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
    async getGroupWeeklyPlanning(req, groupId, weekStartDate) {
        try {
            await this.assertGroupSchool(req.user, groupId);
            const planning = await this.weeklySessionPlanService.getGroupWeeklyPlanning(groupId, weekStartDate);
            return {
                success: true,
                data: planning,
                message: 'Group weekly planning retrieved successfully',
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
    async getWeeklySessionPlanById(req, id) {
        try {
            const plan = await this.assertPlanSchool(req.user, id);
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan retrieved successfully',
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
    async updateWeeklySessionPlan(req, id, updateDto) {
        try {
            await this.assertPlanSchool(req.user, id);
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, updateDto);
            return {
                success: true,
                data: plan,
                message: 'Weekly session plan updated successfully',
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
    async markSessionComplete(req, id, body) {
        try {
            await this.assertPlanSchool(req.user, id);
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
                is_completed: true,
                completion_notes: body.completion_notes,
            });
            return {
                success: true,
                data: plan,
                message: 'Session marked as completed successfully',
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
    async markSessionIncomplete(req, id) {
        try {
            await this.assertPlanSchool(req.user, id);
            const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
                is_completed: false,
                completion_notes: undefined,
            });
            return {
                success: true,
                data: plan,
                message: 'Session marked as incomplete successfully',
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
    async deleteWeeklySessionPlan(req, id) {
        try {
            await this.assertPlanSchool(req.user, id);
            await this.weeklySessionPlanService.deleteWeeklySessionPlan(id);
            return {
                success: true,
                message: 'Weekly session plan deleted successfully',
                data: null,
            };
        }
        catch (error) {
            throw new common_1.BadRequestException({
                success: false,
                message: error.message,
                error: error.name,
            });
        }
    }
    async copyFromPreviousWeek(body, req) {
        try {
            const schoolId = this.schoolOf(req, body.school_id);
            if (body.group_id) {
                await this.assertGroupSchool(req.user, body.group_id);
            }
            const newPlans = await this.weeklySessionPlanService.copyFromPreviousWeek(body.group_id, body.currentWeekStartDate, req.user.id, schoolId);
            return {
                success: true,
                data: newPlans,
                count: newPlans.length,
                message: `Copied ${newPlans.length} plans from previous week`,
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
    async updateTaskStatus(req, taskId, body) {
        try {
            await this.assertPlanSchool(req.user, taskId);
            const plan = await this.weeklySessionPlanService.updateTaskStatus(taskId, body.status);
            return {
                success: true,
                data: {
                    id: plan.id,
                    title: plan.task_title,
                    description: plan.task_description,
                    status: plan.is_completed ? 'completed' : 'pending',
                    created_at: plan.created_at,
                    updated_at: plan.updated_at,
                },
                message: 'Task status updated successfully',
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
    async completeSession(req, planId, body) {
        try {
            await this.assertPlanSchool(req.user, planId);
            const plan = await this.weeklySessionPlanService.completeSession(planId, {
                completion_description: body.completion_description,
                completed_by: req.user.id,
            });
            return {
                success: true,
                data: plan,
                message: 'Session completed successfully',
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
    async updateSessionStatus(req, planId, body) {
        try {
            await this.assertPlanSchool(req.user, planId);
            const plan = await this.weeklySessionPlanService.updateSessionStatus(planId, body.session_status, {
                completion_description: body.completion_description,
                completed_by: req.user.id,
            });
            return {
                success: true,
                data: plan,
                message: 'Session status updated successfully',
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
exports.WeeklySessionPlanController = WeeklySessionPlanController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('weekly_session_plans', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "createWeeklySessionPlan", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('group_id')),
    __param(2, (0, common_1.Query)('week_start_date')),
    __param(3, (0, common_1.Query)('schedule_id')),
    __param(4, (0, common_1.Query)('school_id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getWeeklySessionPlans", null);
__decorate([
    (0, common_1.Get)('group/:groupId/week/:weekStartDate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __param(2, (0, common_1.Param)('weekStartDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getGroupWeeklyPlanning", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "getWeeklySessionPlanById", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('weekly_session_plans', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "updateWeeklySessionPlan", null);
__decorate([
    (0, common_1.Put)(':id/complete'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'edit' }, { page: 'teacher_weekly_sessions', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "markSessionComplete", null);
__decorate([
    (0, common_1.Put)(':id/incomplete'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'edit' }, { page: 'teacher_weekly_sessions', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "markSessionIncomplete", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('weekly_session_plans', 'delete'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "deleteWeeklySessionPlan", null);
__decorate([
    (0, common_1.Post)('copy-from-previous-week'),
    (0, require_claim_decorator_1.RequireClaim)('weekly_session_plans', 'create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "copyFromPreviousWeek", null);
__decorate([
    (0, common_1.Put)('tasks/:taskId'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'edit' }, { page: 'teacher_weekly_sessions', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('taskId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "updateTaskStatus", null);
__decorate([
    (0, common_1.Patch)(':planId/complete'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'edit' }, { page: 'teacher_weekly_sessions', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('planId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "completeSession", null);
__decorate([
    (0, common_1.Patch)(':planId/status'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'edit' }, { page: 'teacher_weekly_sessions', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('planId')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], WeeklySessionPlanController.prototype, "updateSessionStatus", null);
exports.WeeklySessionPlanController = WeeklySessionPlanController = __decorate([
    (0, common_1.Controller)('weekly-session-plans'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'weekly_session_plans', action: 'view' }, { page: 'teacher_weekly_sessions', action: 'view' }),
    __metadata("design:paramtypes", [weekly_session_plan_service_1.WeeklySessionPlanService,
        group_service_1.GroupService])
], WeeklySessionPlanController);
//# sourceMappingURL=weekly-session-plan.controller.js.map