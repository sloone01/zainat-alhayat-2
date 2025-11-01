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
exports.School = void 0;
const typeorm_1 = require("typeorm");
const room_entity_1 = require("./room.entity");
const staff_entity_1 = require("./staff.entity");
const student_entity_1 = require("./student.entity");
const group_entity_1 = require("./group.entity");
const course_entity_1 = require("./course.entity");
const class_settings_entity_1 = require("./class-settings.entity");
const academic_year_entity_1 = require("./academic-year.entity");
let School = class School {
    id;
    name;
    address;
    phone;
    email;
    website;
    logo_url;
    established_date;
    description;
    created_at;
    updated_at;
    rooms;
    staff;
    students;
    groups;
    courses;
    class_settings;
    academicYears;
};
exports.School = School;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], School.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200 }),
    __metadata("design:type", String)
], School.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], School.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 20, nullable: true }),
    __metadata("design:type", String)
], School.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100, nullable: true }),
    __metadata("design:type", String)
], School.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 200, nullable: true }),
    __metadata("design:type", String)
], School.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 500, nullable: true }),
    __metadata("design:type", String)
], School.prototype, "logo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], School.prototype, "established_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], School.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], School.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], School.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => room_entity_1.Room, room => room.school),
    __metadata("design:type", Array)
], School.prototype, "rooms", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => staff_entity_1.Staff, staff => staff.school),
    __metadata("design:type", Array)
], School.prototype, "staff", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => student_entity_1.Student, student => student.school),
    __metadata("design:type", Array)
], School.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => group_entity_1.Group, group => group.school),
    __metadata("design:type", Array)
], School.prototype, "groups", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => course_entity_1.Course, course => course.school),
    __metadata("design:type", Array)
], School.prototype, "courses", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => class_settings_entity_1.ClassSettings, settings => settings.school),
    __metadata("design:type", Array)
], School.prototype, "class_settings", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => academic_year_entity_1.AcademicYear, academicYear => academicYear.school),
    __metadata("design:type", Array)
], School.prototype, "academicYears", void 0);
exports.School = School = __decorate([
    (0, typeorm_1.Entity)('schools')
], School);
//# sourceMappingURL=school.entity.js.map