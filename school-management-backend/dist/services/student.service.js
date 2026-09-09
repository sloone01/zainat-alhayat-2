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
const user_service_1 = require("./user.service");
const parent_service_1 = require("./parent.service");
const school_access_1 = require("../common/security/school-access");
let StudentService = class StudentService {
    studentRepository;
    userRepository;
    parentRepository;
    busRepository;
    groupRepository;
    studentPaymentService;
    userService;
    parentService;
    constructor(studentRepository, userRepository, parentRepository, busRepository, groupRepository, studentPaymentService, userService, parentService) {
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.parentRepository = parentRepository;
        this.busRepository = busRepository;
        this.groupRepository = groupRepository;
        this.studentPaymentService = studentPaymentService;
        this.userService = userService;
        this.parentService = parentService;
    }
    async create(createStudentDto, actorSchoolId) {
        if (!createStudentDto.payment_level_id?.trim()) {
            throw new common_1.BadRequestException('Grade (payment level) is required when registering a student');
        }
        const school_id = actorSchoolId != null ? actorSchoolId : createStudentDto.school_id;
        if (school_id == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        const student = this.studentRepository.create({
            ...createStudentDto,
            school_id,
        });
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
    async registerInApp(dto, actor) {
        const group = await this.groupRepository.findOne({ where: { id: dto.groupId } });
        if (!group) {
            throw new common_1.NotFoundException(`Group with ID ${dto.groupId} not found`);
        }
        (0, school_access_1.assertSameSchool)(actor, group.school_id);
        if (!group.level_id) {
            throw new common_1.BadRequestException('Selected group has no fee level');
        }
        if (group.capacity > 0 && group.studentCount >= group.capacity) {
            throw new common_1.BadRequestException('This group is at full capacity');
        }
        const parentInput = dto.parent;
        const createNewParent = parentInput?.createNew === true;
        const existingParentId = parentInput?.existingParentId;
        if (!createNewParent && (existingParentId == null || Number.isNaN(String(existingParentId)))) {
            throw new common_1.BadRequestException('A parent is required');
        }
        const createStudentUser = dto.createStudentUser === true;
        const studentEmail = (dto.studentEmail || dto.email || '').trim();
        if (createStudentUser && !studentEmail) {
            throw new common_1.BadRequestException('Student email is required to create a login');
        }
        if (createNewParent) {
            const firstName = parentInput?.firstName?.trim();
            const lastName = parentInput?.lastName?.trim();
            if (!firstName || !lastName) {
                throw new common_1.BadRequestException('Parent first and last name are required');
            }
            if (parentInput?.createUser && !parentInput.email?.trim()) {
                throw new common_1.BadRequestException('Parent email is required to create a login');
            }
        }
        const schoolId = String(group.school_id);
        const emergencyContact = (dto.emergencyContact || parentInput?.phone || '').trim() || '—';
        const student = await this.create({
            firstName: dto.firstName.trim(),
            lastName: dto.lastName.trim(),
            secondName: dto.secondName?.trim() || undefined,
            thirdName: dto.thirdName?.trim() || undefined,
            dateOfBirth: new Date(dto.dateOfBirth),
            gender: dto.gender,
            address: dto.address?.trim() || '-',
            phone: dto.phone?.trim() || undefined,
            email: studentEmail || undefined,
            emergencyContact,
            medicalInfo: dto.medicalInfo?.trim() || undefined,
            notes: dto.notes?.trim() || undefined,
            nationality: dto.nationality?.trim() || undefined,
            studentId: dto.studentId?.trim() || undefined,
            photo: dto.photo || undefined,
            payment_level_id: group.level_id,
            school_id: schoolId,
        }, schoolId);
        const relationship = parentInput?.relationship || 'guardian';
        if (createNewParent && parentInput) {
            let parentUserId;
            if (parentInput.createUser) {
                const parentEmail = parentInput.email.trim();
                const parentUser = await this.userService.create({
                    username: await this.userService.uniqueUsernameFromEmail(parentEmail),
                    email: parentEmail,
                    firstName: parentInput.firstName.trim(),
                    lastName: parentInput.lastName.trim(),
                    phone: parentInput.phone?.trim() || undefined,
                    user_type: 'parent',
                    school_id: schoolId,
                }, actor);
                parentUserId = parentUser.id;
            }
            await this.parentService.create({
                firstName: parentInput.firstName.trim(),
                lastName: parentInput.lastName.trim(),
                email: parentInput.email?.trim() || undefined,
                phone: parentInput.phone?.trim() || undefined,
                userId: parentUserId,
                studentIds: [student.id],
                relationship,
            }, schoolId);
        }
        else if (existingParentId != null) {
            await this.parentService.assignToStudent(String(existingParentId), student.id, schoolId, relationship);
        }
        if (createStudentUser) {
            const studentUser = await this.userService.create({
                username: await this.userService.uniqueUsernameFromEmail(studentEmail),
                email: studentEmail,
                firstName: student.firstName,
                lastName: student.lastName,
                user_type: 'student',
                school_id: schoolId,
            }, actor);
            student.user_id = studentUser.id;
            student.email = studentEmail;
            await this.studentRepository.save(student);
        }
        return this.assignToGroup(student.id, group.id, {
            paymentLevelId: group.level_id,
        });
    }
    async findAll(schoolId) {
        const where = schoolId != null ? { school_id: schoolId } : {};
        const rows = await this.studentRepository.find({
            where,
            relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'paymentLevel'],
            order: { firstName: 'ASC', lastName: 'ASC' },
        });
        return (0, school_access_1.sanitizeUserDeep)(rows);
    }
    async findOne(id, schoolId) {
        const where = { id };
        if (schoolId != null)
            where.school_id = schoolId;
        const student = await this.studentRepository.findOne({
            where,
            relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
        });
        if (!student) {
            throw new common_1.NotFoundException(`Student with ID ${id} not found`);
        }
        await this.attachParentRelationships(student);
        return (0, school_access_1.sanitizeUserDeep)(student);
    }
    async attachParentRelationships(student) {
        if (!student?.id || !student.parents?.length)
            return;
        const rows = await this.studentRepository.query(`SELECT parent_id, relationship FROM student_parents WHERE student_id = $1`, [student.id]);
        const byId = new Map(rows.map((r) => [Number(r.parent_id), r.relationship || 'guardian']));
        for (const parent of student.parents) {
            parent.relationship =
                byId.get(Number(parent.id)) || 'guardian';
        }
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
    async findByGroup(groupId, schoolId) {
        const qb = this.studentRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .leftJoinAndSelect('student.groups', 'groups')
            .leftJoinAndSelect('student.buses', 'buses')
            .where('groups.id = :groupId', { groupId });
        if (schoolId != null) {
            qb.andWhere('student.school_id = :schoolId', { schoolId });
        }
        return (0, school_access_1.sanitizeUserDeep)(await qb.getMany());
    }
    async findByBus(busId, schoolId) {
        const qb = this.studentRepository
            .createQueryBuilder('student')
            .where(`EXISTS (SELECT 1 FROM student_buses sb WHERE sb.student_id = student.id AND sb.bus_id = :busId)`, { busId })
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .leftJoinAndSelect('student.groups', 'groups')
            .leftJoinAndSelect('student.buses', 'buses')
            .orderBy('student.lastName', 'ASC')
            .addOrderBy('student.firstName', 'ASC');
        if (schoolId != null) {
            qb.andWhere('student.school_id = :schoolId', { schoolId });
        }
        return (0, school_access_1.sanitizeUserDeep)(await qb.getMany());
    }
    async findByParent(parentId, schoolId) {
        const qb = this.studentRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .leftJoinAndSelect('student.groups', 'groups')
            .leftJoinAndSelect('student.buses', 'buses')
            .where('parents.id = :parentId', { parentId });
        if (schoolId != null) {
            qb.andWhere('student.school_id = :schoolId', { schoolId });
        }
        return (0, school_access_1.sanitizeUserDeep)(await qb.getMany());
    }
    async searchStudents(query, schoolId) {
        const qb = this.studentRepository
            .createQueryBuilder('student')
            .leftJoinAndSelect('student.user', 'user')
            .leftJoinAndSelect('student.parents', 'parents')
            .where('(student.firstName ILIKE :query OR student.lastName ILIKE :query OR student.email ILIKE :query OR student.phone ILIKE :query)', { query: `%${query}%` });
        if (schoolId != null) {
            qb.andWhere('student.school_id = :schoolId', { schoolId });
        }
        return (0, school_access_1.sanitizeUserDeep)(await qb.getMany());
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
        if (student.payment_level_id) {
            await this.studentRepository.update(studentId, {
                payment_level_id: student.payment_level_id,
            });
        }
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
        student_payment_service_1.StudentPaymentService,
        user_service_1.UserService,
        parent_service_1.ParentService])
], StudentService);
//# sourceMappingURL=student.service.js.map