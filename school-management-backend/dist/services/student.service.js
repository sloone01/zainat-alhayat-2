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
exports.StudentService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const student_entity_1 = require("../entities/student.entity");
const user_entity_1 = require("../entities/user.entity");
const parent_entity_1 = require("../entities/parent.entity");
let StudentService = class StudentService {
    studentRepository;
    userRepository;
    parentRepository;
    constructor(studentRepository, userRepository, parentRepository) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
    }
    async create(createStudentDto) {
        const student = this.studentRepository.create(createStudentDto);
        if (createStudentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: createStudentDto.userId }
            });
            if (user) {
                student.user = user;
            }
        }
        if (createStudentDto.parentIds && createStudentDto.parentIds.length > 0) {
            const parents = await this.parentRepository.findByIds(createStudentDto.parentIds);
            student.parents = parents;
        }
        return this.studentRepository.save(student);
    }
    async findAll() {
        return this.studentRepository.find({
            relations: ['user', 'parents', 'groups', 'attendances', 'progress']
        });
    }
    async findOne(id) {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ['user', 'parents', 'groups', 'attendances', 'progress']
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        return student;
    }
    async update(id, updateStudentDto) {
        const student = await this.findOne(id);
        Object.assign(student, updateStudentDto);
        if (updateStudentDto.userId) {
            const user = await this.userRepository.findOne({
                where: { id: updateStudentDto.userId }
            });
            if (user) {
                student.user = user;
            }
        }
        if (updateStudentDto.parentIds) {
            if (updateStudentDto.parentIds.length > 0) {
                const parents = await this.parentRepository.findByIds(updateStudentDto.parentIds);
                student.parents = parents;
            }
            else {
                student.parents = [];
            }
        }
        return this.studentRepository.save(student);
    }
    async remove(id) {
        const student = await this.findOne(id);
        await this.studentRepository.remove(student);
    }
    async findByGroup(groupId) {
        return this.studentRepository.find({
            where: {
                groups: {
                    id: groupId
                }
            },
            relations: ['user', 'parents', 'groups']
        });
    }
    async findByParent(parentId) {
        return this.studentRepository.find({
            where: {
                parents: {
                    id: parentId
                }
            },
            relations: ['user', 'parents', 'groups']
        });
    }
    async searchStudents(query) {
        return this.studentRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .where('student.firstName ILIKE :query', { query: `%${query}%` })
            .orWhere('student.lastName ILIKE :query', { query: `%${query}%` })
            .orWhere('student.email ILIKE :query', { query: `%${query}%` })
            .orWhere('student.phone ILIKE :query', { query: `%${query}%` })
            .getMany();
    }
    async getStudentProgress(studentId) {
        return this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['progress', 'progress.milestone', 'progress.milestone.phase', 'progress.milestone.phase.course']
        });
    }
    async assignToGroup(studentId, groupId) {
        const student = await this.findOne(studentId);
        await this.studentRepository
            .createQueryBuilder()
            .relation(student_entity_1.Student, 'groups')
            .of(studentId)
            .add(groupId);
        return this.findOne(studentId);
    }
    async removeFromGroup(studentId, groupId) {
        const student = await this.findOne(studentId);
        await this.studentRepository
            .createQueryBuilder()
            .relation(student_entity_1.Student, 'groups')
            .of(studentId)
            .remove(groupId);
        return this.findOne(studentId);
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StudentService);
//# sourceMappingURL=student.service.js.map