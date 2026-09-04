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
const bus_entity_1 = require("../entities/bus.entity");
const group_entity_1 = require("../entities/group.entity");
const student_payment_service_1 = require("./student-payment.service");
let StudentService = class StudentService {
    studentRepository;
    userRepository;
    parentRepository;
    busRepository;
    groupRepository;
    studentPaymentService;
    constructor(studentRepository, userRepository, parentRepository, busRepository, groupRepository, studentPaymentService) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
        this.busRepository = busRepository;
        this.groupRepository = groupRepository;
        this.studentPaymentService = studentPaymentService;
    }
    async create(createStudentDto) {
        if (!createStudentDto.payment_level_id?.trim()) {
            throw new common_1.BadRequestException('Grade (payment level) is required when registering a student');
        }
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
            relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
        });
    }
    async findOne(id) {
        const student = await this.studentRepository.findOne({
            where: { id },
            relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
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
            relations: ['user', 'parents', 'groups', 'buses']
        });
    }
    async findByBus(busId) {
        return this.studentRepository
            .createQueryBuilder('student')
            .where(`EXISTS (SELECT 1 FROM student_buses sb WHERE sb.student_id = student.id AND sb.bus_id = :busId)`, { busId })
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .leftJoinAndSelect('student.groups', 'groups')
            .leftJoinAndSelect('student.buses', 'buses')
            .orderBy('student.lastName', 'ASC')
            .addOrderBy('student.firstName', 'ASC')
            .getMany();
    }
    async findByParent(parentId) {
        return this.studentRepository.find({
            where: {
                parents: {
                    id: parentId
                }
            },
            relations: ['user', 'parents', 'groups', 'buses']
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
    async assignToGroup(studentId, groupId, options) {
        const student = await this.findOne(studentId);
        const group = await this.groupRepository.findOne({ where: { id: groupId } });
        if (!group) {
            throw new common_1.NotFoundException(`Group with ID ${groupId} not found`);
        }
        const paymentLevelId = options?.paymentLevelId ?? undefined;
        if (paymentLevelId) {
            if (!group.level_id || group.level_id !== paymentLevelId) {
                throw new common_1.BadRequestException('The selected group does not belong to this fee level');
            }
            student.payment_level_id = paymentLevelId;
        }
        else if (group.level_id) {
            student.payment_level_id = group.level_id;
        }
        if (options?.replaceExistingGroups) {
            const current = student.groups ?? [];
            for (const g of current) {
                await this.studentRepository.createQueryBuilder().relation(student_entity_1.Student, 'groups').of(studentId).remove(g.id);
            }
        }
        await this.studentRepository.createQueryBuilder().relation(student_entity_1.Student, 'groups').of(studentId).add(groupId);
        await this.studentRepository.save(student);
        await this.studentPaymentService.ensureForStudent(studentId);
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
    async assignToBus(studentId, busId) {
        const student = await this.studentRepository.findOne({
            where: { id: studentId },
            relations: ['buses'],
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${studentId} not found`);
        }
        const bus = await this.busRepository.findOne({
            where: { id: busId },
            relations: ['students'],
        });
        if (!bus) {
            throw new common_1.NotFoundException(`Bus with ID ${busId} not found`);
        }
        const currentIds = student.buses?.map((b) => b.id) ?? [];
        const alreadyOnThisBus = currentIds.includes(busId);
        if (alreadyOnThisBus && currentIds.length === 1) {
            return this.findOne(studentId);
        }
        if (!alreadyOnThisBus) {
            const count = bus.students?.length ?? 0;
            if (count >= bus.capacity) {
                throw new common_1.BadRequestException('This bus is at full capacity');
            }
        }
        const rel = this.studentRepository
            .createQueryBuilder()
            .relation(student_entity_1.Student, 'buses')
            .of(studentId);
        if (currentIds.length > 0) {
            await rel.remove(currentIds);
        }
        await rel.add(busId);
        return this.findOne(studentId);
    }
    async removeFromBus(studentId, busId) {
        const student = await this.findOne(studentId);
        if (!student.buses?.some((b) => b.id === busId)) {
            return student;
        }
        await this.studentRepository
            .createQueryBuilder()
            .relation(student_entity_1.Student, 'buses')
            .of(studentId)
            .remove(busId);
        return this.findOne(studentId);
    }
};
exports.StudentService = StudentService;
exports.StudentService = StudentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(student_entity_1.Student)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(2, (0, typeorm_1.InjectRepository)(parent_entity_1.Parent)),
    __param(3, (0, typeorm_1.InjectRepository)(bus_entity_1.Bus)),
    __param(4, (0, typeorm_1.InjectRepository)(group_entity_1.Group)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        student_payment_service_1.StudentPaymentService])
], StudentService);
//# sourceMappingURL=student.service.js.map