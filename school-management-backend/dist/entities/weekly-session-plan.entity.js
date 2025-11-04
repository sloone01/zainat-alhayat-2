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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeeklySessionPlan = void 0;
const typeorm_1 = require("typeorm");
const schedule_entity_1 = require("./schedule.entity");
const user_entity_1 = require("./user.entity");
let WeeklySessionPlan = class WeeklySessionPlan {
    id;
    schedule_id;
    week_start_date;
    week_end_date;
    task_title;
    task_description;
    is_completed;
    completion_date;
    completion_notes;
    created_by;
    created_at;
    updated_at;
    schedule;
    createdBy;
};
exports.WeeklySessionPlan = WeeklySessionPlan;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'schedule_id' }),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "schedule_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], WeeklySessionPlan.prototype, "week_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], WeeklySessionPlan.prototype, "week_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255 }),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "task_title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "task_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WeeklySessionPlan.prototype, "is_completed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WeeklySessionPlan.prototype, "completion_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "completion_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'created_by' }),
    __metadata("design:type", String)
], WeeklySessionPlan.prototype, "created_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WeeklySessionPlan.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WeeklySessionPlan.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => schedule_entity_1.Schedule, schedule => schedule.weeklySessionPlans),
    (0, typeorm_1.JoinColumn)({ name: 'schedule_id' }),
    __metadata("design:type", schedule_entity_1.Schedule)
], WeeklySessionPlan.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.weeklySessionPlans),
    (0, typeorm_1.JoinColumn)({ name: 'created_by' }),
    __metadata("design:type", user_entity_1.User)
], WeeklySessionPlan.prototype, "createdBy", void 0);
exports.WeeklySessionPlan = WeeklySessionPlan = __decorate([
    (0, typeorm_1.Entity)('weekly_session_plans')
], WeeklySessionPlan);
//# sourceMappingURL=weekly-session-plan.entity.js.map