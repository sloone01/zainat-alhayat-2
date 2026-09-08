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
const rbac_group_service_1 = require("../rbac/rbac-group.service");
const bcrypt = __importStar(require("bcryptjs"));
const notification_dispatcher_service_1 = require("../notifications/notification-dispatcher.service");
const notification_template_keys_1 = require("../constants/notification-template-keys");
const school_access_1 = require("../common/security/school-access");
let UserService = class UserService {
    userRepository;
    schoolRepository;
    rbacGroupService;
    notifications;
    constructor(userRepository, schoolRepository, rbacGroupService, notifications) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.rbacGroupService = rbacGroupService;
        this.notifications = notifications;
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
    async create(createUserDto, actor) {
        const existingUser = await this.userRepository.findOne({
            where: [
                { username: createUserDto.username },
                { email: createUserDto.email },
            ],
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this username or email already exists');
        }
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
        const plainPassword = createUserDto.password?.trim() || this.generateTempPassword();
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
        const legacyRole = this.legacyRoleFromUserType(userType, createUserDto.role);
        const user = this.userRepository.create({
            username: createUserDto.username,
            email: createUserDto.email,
            password: hashedPassword,
            firstName: createUserDto.firstName,
            lastName: createUserDto.lastName,
            role: legacyRole,
            roles: createUserDto.roles,
            phone: createUserDto.phone,
            address: createUserDto.address,
            dateOfBirth: createUserDto.dateOfBirth,
            isActive: createUserDto.isActive ?? true,
            school_id: schoolId,
            user_type: userType,
        });
        const saved = await this.userRepository.save(user);
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
    async findAll(actor) {
        const select = [
            'id',
            'username',
            'email',
            'firstName',
            'lastName',
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
            return this.userRepository.find({
                where: { school_id: actor.school_id },
                select: [...select],
            });
        }
        return this.userRepository.find({
            select: [...select],
        });
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
        if (updateUserDto.user_type) {
            user.user_type = updateUserDto.user_type;
            user.role = this.legacyRoleFromUserType(updateUserDto.user_type, updateUserDto.role || user.role);
        }
        else if (updateUserDto.role) {
            user.role = updateUserDto.role;
            user.user_type = this.mapLegacyRoleToUserType(updateUserDto.role);
        }
        const { groupIds, user_type: _ut, role: _r, ...rest } = updateUserDto;
        Object.assign(user, rest);
        const saved = await this.userRepository.save(user);
        if (saved.user_type === 'parent' || saved.user_type === 'student') {
            await this.rbacGroupService.ensurePersonaGroupMembership(saved);
        }
        else if (groupIds && actor) {
            const existing = await this.rbacGroupService.listUserGroups(saved.id);
            for (const g of existing) {
                if (g.groupType === 'staff') {
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
        await this.userRepository.update(id, { password: hashedPassword });
    }
    async resetPasswordAndNotify(id) {
        const user = await this.findOne(id);
        const tempPassword = this.generateTempPassword();
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        await this.userRepository.update(id, {
            password: await bcrypt.hash(tempPassword, saltRounds),
        });
        const school = user.school_id
            ? await this.schoolRepository.findOne({ where: { id: user.school_id } })
            : null;
        await this.notifications.notifySafe({
            schoolId: user.school_id ?? null,
            templateKey: notification_template_keys_1.NOTIFICATION_TEMPLATE_KEYS.AUTH_PASSWORD_RESET,
            locale: 'ar',
            variables: {
                schoolName: school?.name ?? 'School',
                recipientName: `${user.firstName} ${user.lastName}`.trim() || user.email,
                tempPassword,
            },
            recipients: [{ email: user.email, phone: user.phone, userId: user.id, name: user.firstName }],
        });
    }
    async remove(id) {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }
    async findByRole(role, actor) {
        const where = { role: role };
        if (actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null) {
            where.school_id = actor.school_id;
        }
        return this.userRepository.find({
            where,
            select: [
                'id',
                'username',
                'email',
                'firstName',
                'lastName',
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
    }
    async toggleActive(id) {
        const user = await this.findOne(id);
        user.isActive = !user.isActive;
        return this.userRepository.save(user);
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
            locale: 'ar',
            variables: {
                schoolName: school?.name ?? 'School',
                recipientName: `${user.firstName} ${user.lastName}`.trim() || user.email,
                email: user.email || '',
                tempPassword,
            },
            recipients: [{ email: user.email, phone: user.phone, userId: user.id, name: user.firstName }],
        });
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => rbac_group_service_1.RbacGroupService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        rbac_group_service_1.RbacGroupService,
        notification_dispatcher_service_1.NotificationDispatcherService])
], UserService);
//# sourceMappingURL=user.service.js.map