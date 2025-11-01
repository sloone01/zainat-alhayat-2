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
exports.Milestone = void 0;
const typeorm_1 = require("typeorm");
const phase_entity_1 = require("./phase.entity");
const student_progress_entity_1 = require("./student-progress.entity");
let Milestone = class Milestone {
    id;
    name;
    description;
    order;
    isRequired;
    points;
    phase_id;
    title;
    type;
    target_week;
    weight;
    difficulty_level;
    estimated_duration_minutes;
    required_resources;
    allow_late_submission;
    enable_peer_review;
    created_at;
    updated_at;
    phase;
    progress;
};
exports.Milestone = Milestone;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Milestone.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'order_index', type: 'int' }),
    __metadata("design:type", Number)
], Milestone.prototype, "order", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_required', type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Milestone.prototype, "isRequired", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, select: false }),
    __metadata("design:type", Number)
], Milestone.prototype, "points", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'phase_id', nullable: true }),
    __metadata("design:type", String)
], Milestone.prototype, "phase_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true, select: false }),
    __metadata("design:type", String)
], Milestone.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, select: false }),
    __metadata("design:type", String)
], Milestone.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, select: false }),
    __metadata("design:type", Number)
], Milestone.prototype, "target_week", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true, select: false }),
    __metadata("design:type", Number)
], Milestone.prototype, "weight", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, nullable: true, select: false }),
    __metadata("design:type", String)
], Milestone.prototype, "difficulty_level", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true, select: false }),
    __metadata("design:type", Number)
], Milestone.prototype, "estimated_duration_minutes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true, select: false }),
    __metadata("design:type", String)
], Milestone.prototype, "required_resources", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'allow_late_submission', type: 'boolean', default: false, select: false }),
    __metadata("design:type", Boolean)
], Milestone.prototype, "allow_late_submission", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'enable_peer_review', type: 'boolean', default: false, select: false }),
    __metadata("design:type", Boolean)
], Milestone.prototype, "enable_peer_review", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Milestone.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Milestone.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => phase_entity_1.Phase, phase => phase.milestones),
    (0, typeorm_1.JoinColumn)({ name: 'phase_id' }),
    __metadata("design:type", phase_entity_1.Phase)
], Milestone.prototype, "phase", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_progress_entity_1.StudentProgress, progress => progress.milestone),
    __metadata("design:type", Array)
], Milestone.prototype, "progress", void 0);
exports.Milestone = Milestone = __decorate([
    (0, typeorm_1.Entity)('milestones')
], Milestone);
//# sourceMappingURL=milestone.entity.js.map