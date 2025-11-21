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
exports.StudentProgress = void 0;
const typeorm_1 = require("typeorm");
const student_entity_1 = require("./student.entity");
const course_entity_1 = require("./course.entity");
const milestone_entity_1 = require("./milestone.entity");
const staff_entity_1 = require("./staff.entity");
let StudentProgress = class StudentProgress {
    id;
    status;
    score;
    points_earned;
    teacher_notes;
    student_notes;
    started_date;
    completed_date;
    due_date;
    is_late_submission;
    attempts_count;
    feedback;
    attachments;
    student_id;
    course_id;
    milestone_id;
    updated_by;
    created_at;
    updated_at;
    student;
    course;
    milestone;
    updater;
};
exports.StudentProgress = StudentProgress;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], StudentProgress.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 50, default: 'not_started' }),
    __metadata("design:type", String)
], StudentProgress.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], StudentProgress.prototype, "score", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], StudentProgress.prototype, "points_earned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StudentProgress.prototype, "teacher_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StudentProgress.prototype, "student_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StudentProgress.prototype, "started_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StudentProgress.prototype, "completed_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], StudentProgress.prototype, "due_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], StudentProgress.prototype, "is_late_submission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], StudentProgress.prototype, "attempts_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], StudentProgress.prototype, "feedback", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], StudentProgress.prototype, "attachments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StudentProgress.prototype, "student_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StudentProgress.prototype, "course_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], StudentProgress.prototype, "milestone_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], StudentProgress.prototype, "updated_by", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StudentProgress.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], StudentProgress.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => student_entity_1.Student, student => student.progress),
    (0, typeorm_1.JoinColumn)({ name: 'student_id' }),
    __metadata("design:type", student_entity_1.Student)
], StudentProgress.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => course_entity_1.Course, course => course.schedules),
    (0, typeorm_1.JoinColumn)({ name: 'course_id' }),
    __metadata("design:type", course_entity_1.Course)
], StudentProgress.prototype, "course", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => milestone_entity_1.Milestone, milestone => milestone.progress),
    (0, typeorm_1.JoinColumn)({ name: 'milestone_id' }),
    __metadata("design:type", milestone_entity_1.Milestone)
], StudentProgress.prototype, "milestone", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => staff_entity_1.Staff, staff => staff.updated_progress),
    (0, typeorm_1.JoinColumn)({ name: 'updated_by' }),
    __metadata("design:type", staff_entity_1.Staff)
], StudentProgress.prototype, "updater", void 0);
exports.StudentProgress = StudentProgress = __decorate([
    (0, typeorm_1.Entity)('student_progress')
], StudentProgress);
//# sourceMappingURL=student-progress.entity.js.map