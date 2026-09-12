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
exports.Parent = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("./user.entity");
const student_entity_1 = require("./student.entity");
let Parent = class Parent {
    id;
    firstName;
    lastName;
    first_name_ar;
    first_name_en;
    last_name_ar;
    last_name_en;
    email;
    phone;
    civil_id;
    address;
    tribe;
    workplace;
    workPhone;
    maritalStatus;
    organizationName;
    responsiblePerson;
    responsiblePhone;
    user_id;
    school_id;
    createdAt;
    updatedAt;
    user;
    students;
    created_at;
    updated_at;
};
exports.Parent = Parent;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Parent.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Parent.prototype, "firstName", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 100 }),
    __metadata("design:type", String)
], Parent.prototype, "lastName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "first_name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'first_name_en', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "first_name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "last_name_ar", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'last_name_en', type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "last_name_en", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 255, nullable: true }),
    __metadata("design:type", String)
], Parent.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], Parent.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'civil_id', type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "civil_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], Parent.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "tribe", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "workplace", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'work_phone', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "workPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'marital_status', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "maritalStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'organization_name', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "organizationName", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsible_person', type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "responsiblePerson", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'responsible_phone', type: 'varchar', length: 30, nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "responsiblePhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], Parent.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], Parent.prototype, "school_id", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Parent.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Parent.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.parents, { nullable: true }),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", user_entity_1.User)
], Parent.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.ManyToMany)(() => student_entity_1.Student, student => student.parents),
    __metadata("design:type", Array)
], Parent.prototype, "students", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Parent.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Parent.prototype, "updated_at", void 0);
exports.Parent = Parent = __decorate([
    (0, typeorm_1.Entity)('parents')
], Parent);
//# sourceMappingURL=parent.entity.js.map