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
const user_entity_1 = require("../entities/user.entity");
const rbac_group_service_1 = require("../rbac/rbac-group.service");
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
let AuthService = class AuthService {
    userRepository;
    jwtService;
    rbacGroupService;
    constructor(userRepository, jwtService, rbacGroupService) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.rbacGroupService = rbacGroupService;
    }
    async register(registerDto) {
        const existingUser = await this.userRepository.findOne({
            where: { email: registerDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        const saltRounds = 12;
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
            school_id: registerDto.school_id,
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
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
            relations: ['school'],
        });
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
            user.school_id !== 0) {
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
        const schoolId = user.school_id === 0 || user.school_id == null ? null : user.school_id;
        if (!user.user_type) {
            user.user_type = deriveUserType(user);
            await this.userRepository.save(user);
        }
        await this.rbacGroupService.ensurePersonaGroupMembership(user);
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
                isActive: user.isActive,
                lastLogin: user.lastLogin,
                isSystemUser: !!user.isSystemUser || schoolId == null,
                isSuperAdmin: !!user.isSuperAdmin,
            },
        };
    }
    async validateUser(payload) {
        console.log('JWT Validation - Payload received:', {
            sub: payload.sub,
            email: payload.email,
            role: payload.role,
            school_id: payload.school_id,
            iat: payload.iat,
            exp: payload.exp
        });
        const user = await this.userRepository.findOne({
            where: { id: payload.sub },
            relations: ['school'],
        });
        console.log('JWT Validation - Database query result:', {
            userFound: !!user,
            userId: user?.id,
            userEmail: user?.email,
            userActive: user?.isActive,
            searchedId: payload.sub
        });
        if (!user || !user.isActive) {
            console.log('JWT Validation - Rejecting user:', {
                reason: !user ? 'User not found' : 'User inactive',
                userExists: !!user,
                userActive: user?.isActive
            });
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        console.log('JWT Validation - Success for user:', user.email);
        return user;
    }
    async refreshToken(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['school'],
        });
        if (!user || !user.isActive) {
            throw new common_1.UnauthorizedException('User not found or inactive');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            user_type: user.user_type || deriveUserType(user),
            school_id: user.school_id,
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
                school_id: user.school_id,
                school_name: user.school?.name,
                isActive: user.isActive,
            },
        };
    }
    async changePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
        if (!isOldPasswordValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
        user.password = hashedNewPassword;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
        return {
            message: 'Password changed successfully',
        };
    }
    async resetPassword(email) {
        const user = await this.userRepository.findOne({
            where: { email },
        });
        if (!user) {
            return {
                message: 'If the email exists, a password reset link has been sent.',
            };
        }
        const tempPassword = Math.random().toString(36).slice(-8);
        const saltRounds = 12;
        const hashedTempPassword = await bcrypt.hash(tempPassword, saltRounds);
        user.password = hashedTempPassword;
        user.updatedAt = new Date();
        await this.userRepository.save(user);
        return {
            message: 'Temporary password generated',
            temp_password: tempPassword,
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
    __param(2, (0, common_1.Inject)((0, common_1.forwardRef)(() => rbac_group_service_1.RbacGroupService))),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        jwt_1.JwtService,
        rbac_group_service_1.RbacGroupService])
], AuthService);
//# sourceMappingURL=auth.service.js.map