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
exports.Phase = void 0;
const typeorm_1 = require("typeorm");
const course_entity_1 = require("./course.entity");
const milestone_entity_1 = require("./milestone.entity");
let Phase = class Phase {
    id;
    name;
    description;
    order;
    duration_weeks;
    is_active;
    course_id;
    created_at;
    updated_at;
    course;
    milestones;
};
exports.Phase = Phase;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Phase.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Phase.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Phase.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', type: 'int' }),
    __metadata("design:type", Number)
], Phase.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'estimated_duration_days', type: 'int', nullable: true }),
    __metadata("design:type", Number)
], Phase.prototype, "duration_weeks", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_active', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Phase.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'course_id', nullable: true }),
    __metadata("design:type", String)
], Phase.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Phase.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Phase.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, course => course.phases),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], Phase.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => milestone_entity_1.Milestone, milestone => milestone.phase),
    __metadata("design:type", Array)
], Phase.prototype, "milestones", void 0);
exports.Phase = Phase = __decorate([
    (0, typeorm_1.Entity)('phases')
], Phase);
//# sourceMappingURL=phase.entity.js.map