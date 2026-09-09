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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcryptjs"));
const crypto_1 = require("crypto");
const user_entity_1 = require("../entities/user.entity");
const school_entity_1 = require("../entities/school.entity");
const rbac_group_service_1 = require("../rbac/rbac-group.service");
const notification_dispatcher_service_1 = require("../notifications/notification-dispatcher.service");
const notification_template_keys_1 = require("../constants/notification-template-keys");
const school_access_1 = require("../common/security/school-access");
function deriveUserType(user) {
    if (user.user_type === 'staff' || user.user_type === 'parent' || user.user_type === 'student' || user.user_type === 'platform') {
        return user.user_type;
    }
    if (user.isSuperAdmin || user.isSystemUser)
        return 'platform';
    if (user.role === 'parent')
        return 'parent';
    if (user.role === 'student')
        return 'student';
    return 'staff';
}
const USER_CACHE_TTL_MS = 30_000;
let AuthService = class AuthService {
    userRepository;
    schoolRepository;
    jwtService;
    rbacGroupService;
    notifications;
    userCache = new Map();
    constructor(userRepository, schoolRepository, jwtService, rbacGroupService, notifications) {
        this.userRepository = userRepository;
        this.schoolRepository = schoolRepository;
        this.jwtService = jwtService;
        this.rbacGroupService = rbacGroupService;
        this.notifications = notifications;
    }
    async register(registerDto, actor) {
        if (!actor) {
            throw new common_1.ForbiddenException('Authentication required');
        }
        const allowedRoles = [
            'teacher',
            'student',
            'parent',
        ];
        if (!allowedRoles.includes(registerDto.user_type)) {
            throw new common_1.BadRequestException('user_type must be teacher, parent, or student. Create admins via Users with proper claims.');
        }
        const schoolId = (0, school_access_1.resolveActorSchoolId)(actor, registerDto.school_id ?? actor.school_id);
        if (schoolId == null) {
            throw new common_1.BadRequestException('School context required');
        }
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);
        const legacyRole = registerDto.user_type;
        const userType = deriveUserType({ role: legacyRole });
        const user = this.userRepository.create({
            email: registerDto.email,
            password: hashedPassword,
            firstName: registerDto.first_name,
            lastName: registerDto.family_name,
            role: legacyRole,
            user_type: userType,
            phone: registerDto.phone,
            school_id: schoolId,
            isActive: true,
            createdAt: new Date(),
        });
        const savedUser = await this.userRepository.save(user);
        await this.rbacGroupService.ensurePersonaGroupMembership(savedUser);
        const payload = {
            sub: savedUser.id,
            email: savedUser.email,
            role: savedUser.role,
            user_type: savedUser.user_type,
            school_id: savedUser.school_id,
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: savedUser.id,
                email: savedUser.email,
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                role: savedUser.role,
                user_type: savedUser.user_type,
                school_id: savedUser.school_id,
                isActive: savedUser.isActive,
            },
        };
    }
    async findUserForAuth(email) {
        return this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .leftJoinAndSelect('user.school', 'school')
            .where('user.email = :email', { email })
            .getOne();
    }
    async login(loginDto) {
        const user = await this.findUserForAuth(loginDto.email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (!user.isActive) {
            const schoolStatus = user.school?.status;
            if (schoolStatus === 'pending') {
                throw new common_1.UnauthorizedException('Your school registration is pending approval. You can sign in after it is approved.');
            }
            if (schoolStatus === 'rejected') {
                throw new common_1.UnauthorizedException('Your school registration was not approved. Please contact support.');
            }
            throw new common_1.UnauthorizedException('Account is deactivated. Please contact administrator.');
        }
        if (!user.isSuperAdmin &&
            !user.isSystemUser &&
            user.school_id != null &&
            user.school_id !== '0') {
            const schoolStatus = user.school?.status || 'active';
            if (schoolStatus === 'pending') {
                throw new common_1.UnauthorizedException('Your school registration is pending approval. You can sign in after it is approved.');
            }
            if (schoolStatus === 'suspended') {
                throw new common_1.UnauthorizedException('This school account is suspended. Please contact support.');
            }
            if (schoolStatus === 'rejected') {
                throw new common_1.UnauthorizedException('Your school registration was not approved. Please contact support.');
            }
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        user.lastLogin = new Date();
        await this.userRepository.save(user);
        const schoolId = user.school_id == null || user.school_id === '0' ? null : user.school_id;
        if (!user.user_type) {
            user.user_type = deriveUserType(user);
            await this.userRepository.save(user);
        }
        await this.rbacGroupService.ensurePersonaGroupMembership(user);
        await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            user_type: user.user_type || deriveUserType(user),
            school_id: schoolId,
            is_system_user: !!user.isSystemUser || schoolId == null,
            is_super_admin: !!user.isSuperAdmin,
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                user_type: user.user_type || deriveUserType(user),
                school_id: schoolId,
                school_name: user.school?.name,
                school_status: user.school?.status ?? null,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                isSystemUser: !!user.isSystemUser || schoolId == null,
                isSuperAdmin: !!user.isSuperAdmin,
            },
        };
    }
    invalidateUser(userId) {
        this.userCache.delete(userId);
    }
    async validateUser(payload) {
        const cached = this.userCache.get(payload.sub);
        if (cached && Date.now() - cached.at < USER_CACHE_TTL_MS) {
            if (!cached.user.isActive) {
                this.userCache.delete(payload.sub);
                throw new common_1.UnauthorizedException('User not found or inactive');
            }
            return cached.user;
        }
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: ['school'],
        });
        if (!user || !user.isActive) {
            this.userCache.delete(payload.sub);
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        try {
            await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);
        }
        catch {
        }
        this.userCache.set(payload.sub, { at: Date.now(), user });
        return user;
    }
    async refreshFromBearer(authorization) {
        const raw = authorization?.replace(/^Bearer\s+/i, '').trim();
        if (!raw) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        let payload;
        try {
            payload = this.jwtService.verify(raw, { ignoreExpiration: true });
        }
        catch {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        const now = Math.floor(Date.now() / 1000);
        const graceSeconds = Number(process.env.JWT_REFRESH_GRACE_SECONDS) || 2 * 60 * 60;
        if (typeof payload.exp === 'number' && now - payload.exp > graceSeconds) {
            throw new common_1.UnauthorizedException('Invalid or expired token');
        }
        return this.refreshToken(payload.sub);
    }
    async refreshToken(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['school'],
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const schoolId = user.school_id == null || user.school_id === '0' ? null : user.school_id;
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            user_type: user.user_type || deriveUserType(user),
            school_id: schoolId,
            is_system_user: !!user.isSystemUser || schoolId == null,
            is_super_admin: !!user.isSuperAdmin,
        };
        const access_token = this.jwtService.sign(payload);
        return {
            access_token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                user_type: user.user_type || deriveUserType(user),
                school_id: schoolId,
                school_name: user.school?.name,
                school_status: user.school?.status ?? null,
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                isSystemUser: !!user.isSystemUser || schoolId == null,
                isSuperAdmin: !!user.isSuperAdmin,
            },
        };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.id = :userId', { userId })
            .getOne();
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
        return {
            message: 'Password changed successfully',
        };
    }
    async resetPassword(email) {
        const user = await this.userRepository
            .createQueryBuilder('user')
            .addSelect('user.password')
            .where('user.email = :email', { email })
            .getOne();
        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.',
            };
        }
        const tempPassword = (0, crypto_1.randomBytes)(9).toString('base64url').slice(0, 12);
        const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
        user.password = hashedTempPassword;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
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
        return {
            message: 'If the email exists, a temporary password has been sent.',
        };
    }
    async deactivateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        user.isActive = false;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
        this.invalidateUser(userId);
        return {
            message: 'User deactivated successfully',
        };
    }
    async activateUser(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        user.isActive = true;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
        return {
            message: 'User activated successfully',
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(school_entity_1.School)),
    __param(3, (0, common_1.Inject)((0, common_1.forwardRef)(() => rbac_group_service_1.RbacGroupService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService,
        rbac_group_service_1.RbacGroupService,
        notification_dispatcher_service_1.NotificationDispatcherService])
], AuthService);
//# sourceMappingURL=auth.service.js.map