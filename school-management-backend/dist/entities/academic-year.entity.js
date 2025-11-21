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
exports.AcademicYear = void 0;
const typeorm_1 = require("typeorm");
const school_entity_1 = require("./school.entity");
const course_entity_1 = require("./course.entity");
const group_entity_1 = require("./group.entity");
const semester_entity_1 = require("./semester.entity");
let AcademicYear = class AcademicYear {
    id;
    year;
    start_date;
    end_date;
    is_active;
    school_id;
    description;
    created_at;
    updated_at;
    school;
    courses;
    groups;
    semesters;
};
exports.AcademicYear = AcademicYear;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AcademicYear.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20 }),
    __metadata("design:type", String)
], AcademicYear.prototype, "year", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicYear.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], AcademicYear.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AcademicYear.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], AcademicYear.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], AcademicYear.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], AcademicYear.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], AcademicYear.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => school_entity_1.School, school => school.academicYears),
    (0, typeorm_1.JoinColumn)({ name: 'school_id' }),
    __metadata("design:type", school_entity_1.School)
], AcademicYear.prototype, "school", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_entity_1.Course, course => course.academicYear),
    __metadata("design:type", Array)
], AcademicYear.prototype, "courses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_entity_1.Group, group => group.academicYear),
    __metadata("design:type", Array)
], AcademicYear.prototype, "groups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => semester_entity_1.Semester, semester => semester.academicYear),
    __metadata("design:type", Array)
], AcademicYear.prototype, "semesters", void 0);
exports.AcademicYear = AcademicYear = __decorate([
    (0, typeorm_1.Entity)('academic_years')
], AcademicYear);
//# sourceMappingURL=academic-year.entity.js.map