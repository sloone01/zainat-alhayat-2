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
exports.ParentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const parent_entity_1 = require("../entities/parent.entity");
const student_entity_1 = require("../entities/student.entity");
const user_entity_1 = require("../entities/user.entity");
let ParentService = class ParentService {
    constructor(parentRepository, studentRepository, userRepository) {
        this.parentRepository = parentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
    }
    async create(createParentDto) {
        const parent = this.parentRepository.create(createParentDto);
        if (createParentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: createParentDto.userId.toString() }
            });
            if (user) {
                parent.user = user;
            }
        }
        if (createParentDto.studentIds && createParentDto.studentIds.length > 0) {
            const students = await this.studentRepository.findByIds(createParentDto.studentIds);
            parent.students = students;
        }
        return this.parentRepository.save(parent);
    }
    async findAll() {
        return this.parentRepository.find({
            relations: ['user', 'students']
        });
    }
    async findOne(id) {
        const parent = await this.parentRepository.findOne({
            where: { id },
            relations: ['user', 'students']
        });
        if (!parent) {
            throw new common_1.NotFoundException(`Parent with ID ${id} not found`);
        }
        return parent;
    }
    async update(id, updateParentDto) {
        const parent = await this.findOne(id);
        Object.assign(parent, updateParentDto);
        if (updateParentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: updateParentDto.userId.toString() }
            });
            if (user) {
                parent.user = user;
            }
        }
        if (updateParentDto.studentIds) {
            if (updateParentDto.studentIds.length > 0) {
                const students = await this.studentRepository.findByIds(updateParentDto.studentIds);
                parent.students = students;
            }
            else {
                parent.students = [];
            }
        }
        return this.parentRepository.save(parent);
    }
    async remove(id) {
        const parent = await this.findOne(id);
        await this.parentRepository.remove(parent);
    }
    async searchParents(query) {
        return this.parentRepository
            .createQueryBuilder('parent')
            .leftJoinAndSelect('parent.user', 'user')
            .leftJoinAndSelect('parent.students', 'students')
            .where('parent.firstName ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.lastName ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.email ILIKE :query', { query: `%${query}%` })
            .orWhere('parent.phone ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
    async assignToStudent(parentId, studentId) {
        const parent = await this.findOne(parentId);
        const student = await this.studentRepository.findOne({ where: { id: studentId } });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${studentId} not found`);
        }
        await this.parentRepository
            .createQueryBuilder()
            .relation(parent_entity_1.Parent, 'students')
            .of(parentId)
            .add(studentId);
        return this.findOne(parentId);
    }
    async removeFromStudent(parentId, studentId) {
        const parent = await this.findOne(parentId);
        await this.parentRepository
            .createQueryBuilder()
            .relation(parent_entity_1.Parent, 'students')
            .of(parentId)
            .remove(studentId);
        return this.findOne(parentId);
    }
};
exports.ParentService = ParentService;
exports.ParentService = ParentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(1, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(2, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], ParentService);
