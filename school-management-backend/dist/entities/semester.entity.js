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
exports.Semester = void 0;
const typeorm_1 = require("typeorm");
const academic_year_entity_1 = require("./academic-year.entity");
let Semester = class Semester {
    id;
    title;
    start_date;
    end_date;
    academic_year_id;
    description;
    is_active;
    created_at;
    updated_at;
    academicYear;
};
exports.Semester = Semester;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Semester.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Semester.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Semester.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], Semester.prototype, "end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'academic_year_id' }),
    __metadata("design:type", String)
], Semester.prototype, "academic_year_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Semester.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], Semester.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], Semester.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ name: 'updated_at' }),
    __metadata("design:type", Date)
], Semester.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => academic_year_entity_1.AcademicYear, academicYear => academicYear.semesters),
    (0, typeorm_1.JoinColumn)({ name: 'academic_year_id' }),
    __metadata("design:type", academic_year_entity_1.AcademicYear)
], Semester.prototype, "academicYear", void 0);
exports.Semester = Semester = __decorate([
    (0, typeorm_1.Entity)('semesters')
], Semester);
//# sourceMappingURL=semester.entity.js.map