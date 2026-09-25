"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const crypto_1 = require("crypto");
const user_entity_1 = require("../entities/user.entity");
const school_entity_1 = require("../entities/school.entity");
const parent_entity_1 = require("../entities/parent.entity");
const student_entity_1 = require("../entities/student.entity");
const rbac_group_service_1 = require("../rbac/rbac-group.service");
const bcrypt = __importStar(require("bcryptjs"));
const notification_dispatcher_service_1 = require("../notifications/notification-dispatcher.service");
const notification_template_keys_1 = require("../constants/notification-template-keys");
const school_access_1 = require("../common/security/school-access");
const pagination_1 = require("../common/pagination");
const bilingual_name_1 = require("../common/identity/bilingual-name");
const staff_membership_1 = require("../common/identity/staff-membership");
const auth_service_1 = require("../auth/auth.service");
let UserService = class UserService {
    userRepository;
    schoolRepository;
    rbacGroupService;
    notifications;
    authService;
    constructor(userRepository, schoolRepository, rbacGroupService, notifications, authService) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.rbacGroupService = rbacGroupService;
        this.notifications = notifications;
        this.authService = authService;
    }
    generateTempPassword() {
        return (0, crypto_1.randomBytes)(9).toString('base64url').slice(0, 12);
    }
    mapLegacyRoleToUserType(role, explicit) {
        if (explicit)
            return explicit;
        if (role === 'parent')
            return 'parent';
        if (role === 'student')
            return 'student';
        return 'staff';
    }
    legacyRoleFromUserType(userType, role) {
        if (userType === 'parent')
            return 'parent';
        if (userType === 'student')
            return 'student';
        if (role === 'admin' || role === 'teacher')
            return role;
        return 'teacher';
    }
    async create(createUserDto, actor, opts) {
        const userType = this.mapLegacyRoleToUserType(createUserDto.role, createUserDto.user_type);
        let schoolId = createUserDto.school_id != null
            ? createUserDto.school_id
            : actor?.school_id ?? undefined;
        if (userType === 'platform') {
            if (!actor?.isSuperAdmin) {
                throw new common_1.ForbiddenException('Only super admin can create platform users');
            }
            schoolId = undefined;
        }
        else if (actor && !actor.isSuperAdmin && !actor.isSystemUser) {
            schoolId = actor.school_id ?? undefined;
            if (schoolId == null) {
                throw new common_1.BadRequestException('School context required');
            }
        }
        if (userType === 'staff' && schoolId == null) {
            throw new common_1.BadRequestException('Staff users require a school');
        }
        let linkStudent = null;
        const parentLinks = [];
        if (userType === 'parent') {
            const studentId = createUserDto.studentId?.trim();
            const seen = new Set();
            for (const link of createUserDto.links ?? []) {
                const id = String(link?.student_id ?? '').trim();
                if (!id || seen.has(id))
                    continue;
                seen.add(id);
                parentLinks.push({
                    student: await this.findLinkableStudent(id, schoolId, actor),
                    relationship: link.relationship,
                });
            }
            if (parentLinks.length) {
                linkStudent = parentLinks[0].student;
            }
            else if (studentId) {
                linkStudent = await this.findLinkableStudent(studentId, schoolId, actor);
            }
            else if (opts?.requireParentStudentLink &&
                actor &&
                !actor.isSuperAdmin &&
                !actor.isSystemUser) {
                throw new common_1.BadRequestException('A student must be selected to link the parent to');
            }
            schoolId = undefined;
        }
        let linkStudentRecord = null;
        if (userType === 'student') {
            const studentId = createUserDto.studentId?.trim();
            if (studentId) {
                linkStudentRecord = await this.findLinkableStudent(studentId, schoolId, actor);
            }
            else if (opts?.requireStudentRecordLink &&
                actor &&
                !actor.isSuperAdmin &&
                !actor.isSystemUser) {
                throw new common_1.BadRequestException('A student must be selected to link the account to');
            }
        }
        if (userType === 'staff' && schoolId) {
            const linked = await this.linkExistingStaff(createUserDto, schoolId, actor);
            if (linked)
                return linked;
        }
        if (userType === 'parent' && parentLinks.length) {
            const registered = await this.findRegisteredParent({
                email: createUserDto.email,
                phone: createUserDto.phone,
                civil_id: createUserDto.civil_id,
            });
            if (registered) {
                if (!createUserDto.link_existing) {
                    throw new common_1.ConflictException('PARENT_EXISTS');
                }
                const withParents = await this.studentsWithParents(parentLinks.map((link) => link.student.id), actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null);
                if (withParents.length) {
                    throw new common_1.BadRequestException('STUDENT_HAS_PARENT');
                }
                for (const link of parentLinks) {
                    await this.linkParentUserToStudent(registered, link.student, link.relationship);
                }
                await this.rbacGroupService.ensurePersonaGroupMembership(registered);
                return { ...(0, school_access_1.sanitizeUser)(registered), linked_existing: true };
            }
            if (!(0, bilingual_name_1.normalizeCivilId)(createUserDto.civil_id)) {
                throw new common_1.BadRequestException('Civil ID is required for a parent');
            }
            if (!createUserDto.phone?.trim()) {
                throw new common_1.BadRequestException('Mobile is required for a parent');
            }
            if (!createUserDto.email?.trim()) {
                throw new common_1.BadRequestException('Email is required for a parent');
            }
        }
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });
        if (existingUser &&
            linkStudent &&
            existingUser.user_type === 'parent' &&
            (0, bilingual_name_1.normalizeEmail)(existingUser.email) === (0, bilingual_name_1.normalizeEmail)(createUserDto.email)) {
            await this.linkParentUserToStudent(existingUser, linkStudent, createUserDto.relationship);
            return (0, school_access_1.sanitizeUser)(existingUser);
        }
        if (existingUser &&
            linkStudentRecord &&
            existingUser.user_type === 'student' &&
            (0, bilingual_name_1.normalizeEmail)(existingUser.email) === (0, bilingual_name_1.normalizeEmail)(createUserDto.email)) {
            await this.linkUserToStudentRecord(existingUser, linkStudentRecord);
            return (0, school_access_1.sanitizeUser)(existingUser);
        }
        if (existingUser) {
            throw new common_1.ConflictException('User with this username or email already exists');
        }
        const newCivilId = (0, bilingual_name_1.normalizeCivilId)(createUserDto.civil_id);
        if (newCivilId) {
            const existingCivil = await this.userRepository.findOne({ where: { civil_id: newCivilId } });
            if (existingCivil) {
                throw new common_1.ConflictException('Another user already has this civil ID');
            }
        }
        if (linkStudentRecord?.user_id) {
            throw new common_1.BadRequestException('This student already has a linked account');
        }
        const issuedTemp = !createUserDto.password?.trim();
        const plainPassword = createUserDto.password?.trim() || this.generateTempPassword();
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        const legacyRole = this.legacyRoleFromUserType(userType, createUserDto.role);
        const names = (0, bilingual_name_1.applyBilingualName)(createUserDto);
        const preferred = createUserDto.preferred_language === 'en' || createUserDto.preferred_language === 'ar'
            ? createUserDto.preferred_language
            : 'ar';
        const user = this.userRepository.create({
            username: createUserDto.username,
            email: createUserDto.email,
            password: hashedPassword,
            ...names,
            civil_id: (0, bilingual_name_1.normalizeCivilId)(createUserDto.civil_id),
            role: legacyRole,
            roles: createUserDto.roles,
            phone: createUserDto.phone,
            address: createUserDto.address,
            dateOfBirth: createUserDto.dateOfBirth,
            isActive: createUserDto.isActive ?? true,
            school_id: schoolId,
            user_type: userType,
            preferred_language: preferred,
            must_change_password: issuedTemp,
        });
        const saved = await this.userRepository.save(user);
        if (userType === 'staff' && schoolId) {
            await (0, staff_membership_1.ensureStaffMembership)(this.userRepository.manager, saved.id, schoolId);
        }
        if (userType === 'parent' && parentLinks.length) {
            for (const link of parentLinks) {
                await this.linkParentUserToStudent(saved, link.student, link.relationship);
            }
        }
        else if (userType === 'parent' && linkStudent) {
            await this.linkParentUserToStudent(saved, linkStudent, createUserDto.relationship);
        }
        if (userType === 'student' && linkStudentRecord) {
            await this.linkUserToStudentRecord(saved, linkStudentRecord);
        }
        if (userType === 'parent' || userType === 'student') {
            await this.rbacGroupService.ensurePersonaGroupMembership(saved);
        }
        else if (userType === 'staff' && createUserDto.groupIds?.length) {
            const assignActor = actor || saved;
            for (const groupId of createUserDto.groupIds) {
                await this.rbacGroupService.assignUserToGroup(assignActor, saved.id, groupId);
            }
        }
        void this.notifyAccountCreated(saved, plainPassword);
        return (0, school_access_1.sanitizeUser)(saved);
    }
    async findRegisteredParent(input) {
        const email = (0, bilingual_name_1.normalizeEmail)(input.email ?? '') || '';
        const phone = String(input.phone ?? '').replace(/\s+/g, '');
        const civil = (0, bilingual_name_1.normalizeCivilId)(input.civil_id) || '';
        if (!email && !phone && !civil)
            return null;
        const qb = this.userRepository
            .createQueryBuilder('u')
            .where("(u.user_type = 'parent' OR u.role = 'parent')")
            .andWhere(new typeorm_2.Brackets((w) => {
            if (email)
                w.orWhere('LOWER(u.email) = :email', { email });
            if (phone)
                w.orWhere("REPLACE(u.phone, ' ', '') = :phone", { phone });
            if (civil)
                w.orWhere('u.civil_id = :civil', { civil });
        }));
        return qb.getOne();
    }
    async studentsWithParents(studentIds, schoolId) {
        if (!studentIds.length)
            return [];
        const rows = await this.userRepository.query(`SELECT DISTINCT sp.student_id
         FROM student_parents sp
         INNER JOIN students st ON st.id = sp.student_id
        WHERE sp.student_id = ANY($1::uuid[])
          AND ($2::uuid IS NULL OR st.school_id = $2::uuid)`, [studentIds, schoolId ?? null]);
        return rows.map((r) => r.student_id);
    }
    async lookupParent(actor, input) {
        const parent = await this.findRegisteredParent(input);
        if (!parent)
            return { exists: false };
        const maskEmail = (v) => {
            const [name, domain] = String(v ?? '').split('@');
            return domain ? `${name.slice(0, 1)}***@${domain}` : null;
        };
        const maskPhone = (v) => {
            const digits = String(v ?? '');
            return digits.length > 3 ? `***${digits.slice(-3)}` : null;
        };
        let linkedStudentIds = [];
        const schoolId = actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null;
        if (schoolId) {
            const rows = await this.userRepository.query(`SELECT sp.student_id
           FROM student_parents sp
           INNER JOIN parents p ON p.id = sp.parent_id
           INNER JOIN students st ON st.id = sp.student_id
          WHERE p.user_id = $1 AND st.school_id = $2`, [parent.id, schoolId]);
            linkedStudentIds = rows.map((r) => r.student_id);
        }
        return {
            exists: true,
            name_ar: [parent.first_name_ar, parent.last_name_ar].filter(Boolean).join(' ') || null,
            name_en: [parent.first_name_en, parent.last_name_en].filter(Boolean).join(' ') || null,
            name: `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim(),
            first_name_ar: parent.first_name_ar ?? null,
            last_name_ar: parent.last_name_ar ?? null,
            first_name_en: parent.first_name_en ?? null,
            last_name_en: parent.last_name_en ?? null,
            email: maskEmail(parent.email),
            phone: maskPhone(parent.phone),
            linked_student_ids: linkedStudentIds,
            students_with_parents: await this.studentsWithParents(input.student_ids ?? [], actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null),
        };
    }
    async findLinkableStudent(studentId, schoolId, actor) {
        const studentSchoolId = actor && !actor.isSuperAdmin && !actor.isSystemUser ? schoolId : undefined;
        const student = await this.userRepository.manager.getRepository(student_entity_1.Student).findOne({
            where: studentSchoolId ? { id: studentId, school_id: studentSchoolId } : { id: studentId },
        });
        if (!student) {
            throw new common_1.BadRequestException('Student not found in this school');
        }
        return student;
    }
    async linkUserToStudentRecord(user, student) {
        if (student.user_id && student.user_id !== user.id) {
            throw new common_1.BadRequestException('This student already has a linked account');
        }
        student.user_id = user.id;
        if (!student.email?.trim() && user.email) {
            student.email = user.email;
        }
        await this.userRepository.manager.getRepository(student_entity_1.Student).save(student);
    }
    async linkParentUserToStudent(user, student, relationship) {
        const parentRepo = this.userRepository.manager.getRepository(parent_entity_1.Parent);
        let parent = await parentRepo.findOne({ where: { user_id: user.id } });
        if (!parent) {
            const email = (0, bilingual_name_1.normalizeEmail)(user.email);
            if (email) {
                parent = await parentRepo
                    .createQueryBuilder('p')
                    .where('p.user_id IS NULL')
                    .andWhere('LOWER(p.email) = :email', { email })
                    .getOne();
            }
        }
        if (parent) {
            parent.user_id = user.id;
            parent = await parentRepo.save(parent);
        }
        else {
            parent = await parentRepo.save(parentRepo.create({
                firstName: user.firstName,
                lastName: user.lastName,
                first_name_ar: user.first_name_ar,
                first_name_en: user.first_name_en,
                last_name_ar: user.last_name_ar,
                last_name_en: user.last_name_en,
                email: user.email,
                phone: user.phone,
                civil_id: user.civil_id,
                user_id: user.id,
                school_id: null,
            }));
        }
        const rel = relationship === 'father' || relationship === 'mother' ? relationship : 'guardian';
        await parentRepo.query(`DELETE FROM student_parents WHERE student_id = $1 AND parent_id = $2`, [student.id, parent.id]);
        await parentRepo.query(`INSERT INTO student_parents (student_id, parent_id, relationship) VALUES ($1, $2, $3)`, [student.id, parent.id, rel]);
    }
    async findAll(actor, audience) {
        const qb = this.scopedListQuery(actor, audience);
        qb.orderBy('u.createdAt', 'DESC');
        return (0, school_access_1.sanitizeUserDeep)(await qb.getMany());
    }
    async findPage(actor, query) {
        const { page, limit } = (0, pagination_1.parsePageQuery)(query);
        const qb = this.scopedListQuery(actor, query.audience);
        if (query.role) {
            qb.andWhere(new typeorm_2.Brackets((w) => {
                w.where('u.role = :role', { role: query.role }).orWhere(`',' || REPLACE(COALESCE(u.roles, ''), ' ', '') || ',' LIKE :roleToken`, { roleToken: `%,${query.role},%` });
            }));
        }
        if (query.status === 'active')
            qb.andWhere('u.isActive = true');
        else if (query.status === 'inactive')
            qb.andWhere('u.isActive = false');
        const createdDays = query.created_within === 'today' ? 0 : query.created_within === 'week' ? 7 : query.created_within === 'month' ? 30 : null;
        if (createdDays != null) {
            qb.andWhere(`u.createdAt >= CURRENT_DATE - CAST(:createdDays AS int)`, { createdDays });
        }
        const term = (0, pagination_1.likeTerm)(query.q);
        if (term) {
            const digits = (query.q || '').replace(/\D/g, '');
            qb.andWhere(new typeorm_2.Brackets((w) => {
                w.where(`LOWER(CONCAT_WS(' ', u.firstName, u.lastName, u.first_name_ar, u.last_name_ar, u.first_name_en, u.last_name_en, u.username, u.email, u.phone, u.civil_id)) LIKE :term`, { term });
                if (digits.length >= 3) {
                    w.orWhere(`REGEXP_REPLACE(COALESCE(u.phone, ''), '\\D', '', 'g') LIKE :digits`, { digits: `%${digits}%` })
                        .orWhere(`REGEXP_REPLACE(COALESCE(u.civil_id, ''), '\\D', '', 'g') LIKE :digits`, { digits: `%${digits}%` });
                }
            }));
        }
        const total = await qb.getCount();
        const safePage = (0, pagination_1.clampPage)(page, total, limit);
        const rows = await qb
            .orderBy('u.createdAt', 'DESC')
            .addOrderBy('u.id', 'ASC')
            .skip((safePage - 1) * limit)
            .take(limit)
            .getMany();
        return (0, pagination_1.buildPage)((0, school_access_1.sanitizeUserDeep)(rows), total, safePage, limit);
    }
    scopedListQuery(actor, audience) {
        const qb = this.userRepository.createQueryBuilder('u');
        if (actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null) {
            const schoolId = actor.school_id;
            qb.where(new typeorm_2.Brackets((w) => {
                w.where('u.school_id = :schoolId', { schoolId })
                    .orWhere(`u.id IN (SELECT s.user_id FROM staff s WHERE s.school_id = :schoolId)`, { schoolId })
                    .orWhere(`u.id IN (
                SELECT p.user_id FROM parents p
                WHERE p.user_id IS NOT NULL
                  AND EXISTS (
                    SELECT 1 FROM student_parents sp
                    INNER JOIN students st ON st.id = sp.student_id
                    WHERE sp.parent_id = p.id AND st.school_id = :schoolId
                  )
              )`, { schoolId })
                    .orWhere(`u.id IN (
                SELECT stu.user_id FROM students stu
                WHERE stu.school_id = :schoolId AND stu.user_id IS NOT NULL
              )`, { schoolId });
            }));
        }
        if (audience === 'staff') {
            qb.andWhere(new typeorm_2.Brackets((w) => {
                w.where("u.user_type = 'staff'").orWhere("u.role IN ('admin', 'teacher')");
                if (actor?.school_id) {
                    w.orWhere(`u.id IN (SELECT s.user_id FROM staff s WHERE s.school_id = :staffSchoolId)`, { staffSchoolId: actor.school_id });
                }
            }));
        }
        else if (audience === 'parent') {
            qb.andWhere(new typeorm_2.Brackets((w) => {
                w.where("u.user_type = 'parent'").orWhere("u.role = 'parent'");
            }));
        }
        else if (audience === 'student') {
            qb.andWhere(new typeorm_2.Brackets((w) => {
                w.where("u.user_type = 'student'").andWhere("u.role NOT IN ('admin', 'teacher')");
            }));
        }
        return qb;
    }
    async findOne(id) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: [
                'id',
                'username',
                'email',
                'firstName',
                'lastName',
                'civil_id',
                'role',
                'phone',
                'address',
                'dateOfBirth',
                'isActive',
                'createdAt',
                'updatedAt',
                'school_id',
                'user_type',
            ],
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return user;
    }
    async findByUsername(username) {
        return this.userRepository.findOne({
            where: { username },
        });
    }
    async findByEmail(email) {
        return this.userRepository.findOne({
            where: { email },
        });
    }
    async uniqueUsernameFromEmail(email) {
        const local = (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'user';
        let candidate = local;
        let n = 0;
        for (;;) {
            const taken = await this.userRepository.findOne({ where: { username: candidate } });
            if (!taken)
                return candidate;
            n += 1;
            candidate = `${local}${n}`;
        }
    }
    async update(id, updateUserDto, actor) {
        const user = await this.findOne(id);
        if (updateUserDto.username || updateUserDto.email) {
            const existingUser = await this.userRepository.findOne({
                where: [
                    { username: updateUserDto.username },
                    { email: updateUserDto.email },
                ],
            });
            if (existingUser && existingUser.id !== id) {
                throw new common_1.ConflictException('User with this username or email already exists');
            }
        }
        if (updateUserDto.civil_id !== undefined) {
            const civilId = (0, bilingual_name_1.normalizeCivilId)(updateUserDto.civil_id);
            if (civilId) {
                const existingCivil = await this.userRepository.findOne({ where: { civil_id: civilId } });
                if (existingCivil && existingCivil.id !== id) {
                    throw new common_1.ConflictException('Another user already has this civil ID');
                }
            }
        }
        if (updateUserDto.user_type) {
            user.user_type = updateUserDto.user_type;
            user.role = this.legacyRoleFromUserType(updateUserDto.user_type, updateUserDto.role || user.role);
        }
        else if (updateUserDto.role) {
            user.role = updateUserDto.role;
            user.user_type = this.mapLegacyRoleToUserType(updateUserDto.role);
        }
        const { groupIds, user_type: _ut, role: _r, civil_id, preferred_language, ...rest } = updateUserDto;
        Object.assign(user, rest);
        if (civil_id !== undefined) {
            user.civil_id = (0, bilingual_name_1.normalizeCivilId)(civil_id);
        }
        if (preferred_language === 'en' || preferred_language === 'ar') {
            user.preferred_language = preferred_language;
        }
        Object.assign(user, (0, bilingual_name_1.applyBilingualName)({ ...user, ...rest }));
        const saved = await this.userRepository.save(user);
        if (saved.user_type === 'parent' || saved.user_type === 'student') {
            await this.rbacGroupService.ensurePersonaGroupMembership(saved);
        }
        else if (groupIds && actor) {
            const actorSchool = actor.school_id;
            const existing = await this.rbacGroupService.listUserGroups(saved.id);
            for (const g of existing) {
                if (g.groupType === 'staff' && actorSchool && String(g.schoolId) === String(actorSchool)) {
                    await this.rbacGroupService.removeUserFromGroup(actor, saved.id, g.id);
                }
            }
            for (const groupId of groupIds) {
                await this.rbacGroupService.assignUserToGroup(actor, saved.id, groupId);
            }
        }
        return saved;
    }
    async updatePassword(id, newPassword) {
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
        await this.userRepository.update(id, {
            password: hashedPassword,
            must_change_password: true,
        });
    }
    async resetPasswordAndNotify(id, actor) {
        const user = await this.findOne(id);
        if (user.user_type === 'parent' && !actor?.isSuperAdmin && !actor?.isSystemUser) {
            throw new common_1.ForbiddenException('A parent password cannot be reset from a school');
        }
        if (!user.email) {
            throw new common_1.BadRequestException('This user has no email, so a reset link cannot be sent.');
        }
        await this.authService.issuePasswordResetLink(user);
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async findByRole(role, actor) {
        const select = [
            'id',
            'username',
            'email',
            'firstName',
            'lastName',
            'civil_id',
            'role',
            'phone',
            'address',
            'dateOfBirth',
            'isActive',
            'createdAt',
            'updatedAt',
            'school_id',
            'user_type',
        ];
        if (actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null) {
            const schoolId = actor.school_id;
            const qb = this.userRepository
                .createQueryBuilder('u')
                .select(select.map((c) => `u.${c}`))
                .where('u.role = :role', { role })
                .andWhere(`(
            u.school_id = :schoolId
            OR u.id IN (SELECT s.user_id FROM staff s WHERE s.school_id = :schoolId)
            OR u.id IN (
              SELECT p.user_id FROM parents p
              WHERE p.user_id IS NOT NULL
                AND EXISTS (
                  SELECT 1 FROM student_parents sp
                  INNER JOIN students s ON s.id = sp.student_id
                  WHERE sp.parent_id = p.id AND s.school_id = :schoolId
                )
            )
            OR u.id IN (
              SELECT st.user_id FROM students st
              WHERE st.school_id = :schoolId AND st.user_id IS NOT NULL
            )
          )`, { schoolId })
                .orderBy('u."createdAt"', 'DESC');
            return qb.getMany();
        }
        return this.userRepository.find({
            where: { role: role },
            select: [...select],
            order: { createdAt: 'DESC' },
        });
    }
    async toggleActive(id) {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return this.userRepository.save(user);
    }
    isStaffAccount(user) {
        if (user.user_type === 'staff')
            return true;
        return user.role === 'admin' || user.role === 'teacher';
    }
    async findExistingStaffUser(dto) {
        const email = (0, bilingual_name_1.normalizeEmail)(dto.email);
        if (email) {
            const byEmail = await this.userRepository.findOne({
                where: { email: (0, typeorm_2.ILike)(email) },
            });
            if (byEmail)
                return byEmail;
        }
        const civil = (0, bilingual_name_1.normalizeCivilId)(dto.civil_id);
        if (!civil)
            return null;
        return this.userRepository.findOne({
            where: { civil_id: civil, user_type: 'staff' },
        });
    }
    async linkExistingStaff(dto, schoolId, actor) {
        const existing = await this.findExistingStaffUser(dto);
        if (!existing)
            return null;
        if (!this.isStaffAccount(existing)) {
            throw new common_1.ConflictException('User with this username or email already exists');
        }
        if (await (0, staff_membership_1.hasStaffMembership)(this.userRepository.manager, existing.id, schoolId)) {
            throw new common_1.ConflictException('User with this username or email already exists');
        }
        await (0, staff_membership_1.ensureStaffMembership)(this.userRepository.manager, existing.id, schoolId);
        const civil = (0, bilingual_name_1.normalizeCivilId)(dto.civil_id);
        if (civil && !existing.civil_id) {
            existing.civil_id = civil;
            await this.userRepository.update(existing.id, { civil_id: civil });
        }
        if (dto.groupIds?.length) {
            const assignActor = actor || existing;
            for (const groupId of dto.groupIds) {
                await this.rbacGroupService.assignUserToGroup(assignActor, existing.id, groupId);
            }
        }
        return (0, school_access_1.sanitizeUser)(existing);
    }
    async notifyAccountCreated(user, tempPassword) {
        if (!user.email && !user.phone)
            return;
        const school = user.school_id
            ? await this.schoolRepository.findOne({ where: { id: user.school_id } })
            : null;
        await this.notifications.notifySafe({
            schoolId: user.school_id ?? null,
            templateKey: notification_template_keys_1.NOTIFICATION_TEMPLATE_KEYS.AUTH_ACCOUNT_CREATED,
            locale: user.preferred_language === 'en' ? 'en' : 'ar',
            variables: {
                schoolName: school?.name ?? 'School',
                recipientName: `${user.firstName} ${user.lastName}`.trim() || user.email,
                email: user.email || '',
                tempPassword,
            },
            recipients: [
                {
                    email: user.email,
                    phone: user.phone,
                    userId: user.id,
                    name: user.firstName,
                    locale: user.preferred_language === 'en' ? 'en' : 'ar',
                },
            ],
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => rbac_group_service_1.RbacGroupService))),
    __param(4, (0, common_1.Inject)((0, common_1.forwardRef)(() => auth_service_1.AuthService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        rbac_group_service_1.RbacGroupService,
        notification_dispatcher_service_1.NotificationDispatcherService,
        auth_service_1.AuthService])
], UserService);
//# sourceMappingURL=user.service.js.map