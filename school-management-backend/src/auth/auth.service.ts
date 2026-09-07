import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { RbacGroupService } from '../rbac/rbac-group.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { resolveActorSchoolId } from '../common/security/school-access';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  user_type?: 'staff' | 'parent' | 'student' | 'platform';
  school_id: number | null;
  is_system_user?: boolean;
  is_super_admin?: boolean;
  iat?: number;
  exp?: number;
}

function deriveUserType(user: {
  user_type?: string;
  role?: string;
  isSuperAdmin?: boolean;
  isSystemUser?: boolean;
}): 'staff' | 'parent' | 'student' | 'platform' {
  if (user.user_type === 'staff' || user.user_type === 'parent' || user.user_type === 'student' || user.user_type === 'platform') {
    return user.user_type;
  }
  if (user.isSuperAdmin || user.isSystemUser) return 'platform';
  if (user.role === 'parent') return 'parent';
  if (user.role === 'student') return 'student';
  return 'staff';
}

const USER_CACHE_TTL_MS = 30_000;

@Injectable()
export class AuthService {
  private readonly userCache = new Map<string, { at: number; user: User }>();

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  async register(registerDto: RegisterDto, actor: User): Promise<any> {
    if (!actor) {
      throw new ForbiddenException('Authentication required');
    }

    // Never allow self-serve admin / platform creation via this endpoint
    const allowedRoles: Array<'teacher' | 'student' | 'parent'> = [
      'teacher',
      'student',
      'parent',
    ];
    if (!allowedRoles.includes(registerDto.user_type as 'teacher' | 'student' | 'parent')) {
      throw new BadRequestException(
        'user_type must be teacher, parent, or student. Create admins via Users with proper claims.',
      );
    }

    const schoolId = resolveActorSchoolId(actor, registerDto.school_id ?? actor.school_id);
    if (schoolId == null) {
      throw new BadRequestException('School context required');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    const legacyRole = registerDto.user_type as 'teacher' | 'student' | 'parent';
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

    const payload: JwtPayload = {
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

  private async findUserForAuth(email: string): Promise<User | null> {
    return this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .leftJoinAndSelect('user.school', 'school')
      .where('user.email = :email', { email })
      .getOne();
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.findUserForAuth(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      const schoolStatus = user.school?.status;
      if (schoolStatus === 'pending') {
        throw new UnauthorizedException(
          'Your school registration is pending approval. You can sign in after it is approved.',
        );
      }
      if (schoolStatus === 'rejected') {
        throw new UnauthorizedException(
          'Your school registration was not approved. Please contact support.',
        );
      }
      throw new UnauthorizedException('Account is deactivated. Please contact administrator.');
    }

    // School-scoped users may only sign in when the school is active
    if (
      !user.isSuperAdmin &&
      !user.isSystemUser &&
      user.school_id != null &&
      user.school_id !== 0
    ) {
      const schoolStatus = user.school?.status || 'active';
      if (schoolStatus === 'pending') {
        throw new UnauthorizedException(
          'Your school registration is pending approval. You can sign in after it is approved.',
        );
      }
      if (schoolStatus === 'suspended') {
        throw new UnauthorizedException('This school account is suspended. Please contact support.');
      }
      if (schoolStatus === 'rejected') {
        throw new UnauthorizedException(
          'Your school registration was not approved. Please contact support.',
        );
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    const schoolId =
      user.school_id === 0 || user.school_id == null ? null : user.school_id;

    if (!user.user_type) {
      user.user_type = deriveUserType(user);
      await this.userRepository.save(user);
    }
    await this.rbacGroupService.ensurePersonaGroupMembership(user);
    await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);

    // Generate JWT token
    const payload: JwtPayload = {
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

  invalidateUser(userId: string) {
    this.userCache.delete(userId);
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    const cached = this.userCache.get(payload.sub);
    if (cached && Date.now() - cached.at < USER_CACHE_TTL_MS) {
      if (!cached.user.isActive) {
        this.userCache.delete(payload.sub);
        throw new UnauthorizedException('User not found or inactive');
      }
      return cached.user;
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: ['school'],
    });

    if (!user || !user.isActive) {
      this.userCache.delete(payload.sub);
      throw new UnauthorizedException('User not found or inactive');
    }

    await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);
    this.userCache.set(payload.sub, { at: Date.now(), user });
    return user;
  }

  async refreshToken(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    const payload: JwtPayload = {
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

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify old password
    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    user.password = hashedNewPassword;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'Password changed successfully',
    };
  }

  async resetPassword(email: string): Promise<any> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate temporary password (crypto-strong; emailed — never returned in HTTP body)
    const tempPassword = randomBytes(9).toString('base64url').slice(0, 12);
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
      templateKey: NOTIFICATION_TEMPLATE_KEYS.AUTH_PASSWORD_RESET,
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

  async deactivateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.isActive = false;
    user.updatedAt = new Date();
    await this.userRepository.save(user);
    this.invalidateUser(userId);

    return {
      message: 'User deactivated successfully',
    };
  }

  async activateUser(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    user.isActive = true;
    user.updatedAt = new Date();
    await this.userRepository.save(user);

    return {
      message: 'User activated successfully',
    };
  }
}

