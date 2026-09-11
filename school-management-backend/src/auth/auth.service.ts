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
import { Staff } from '../entities/staff.entity';
import { LoginDto, RegisterDto } from '../dto/auth.dto';
import { RbacGroupService } from '../rbac/rbac-group.service';
import { RbacPermissionService } from '../rbac/rbac-permission.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { isParentOrStudentActor, resolveActorSchoolId } from '../common/security/school-access';
import { ensureStaffMembership, hasStaffMembership } from '../common/identity/staff-membership';
import { isLetterApprovalPayload } from '../common/security/letter-approval-token';

export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  user_type?: 'staff' | 'parent' | 'student' | 'platform';
  school_id: string | null;
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
  if (user.role === 'parent') return 'parent';
  if (user.role === 'student') return 'student';
  if (user.isSuperAdmin || user.isSystemUser) return 'platform';
  return 'staff';
}

function jwtIsSystemUser(
  user: {
    user_type?: string;
    role?: string;
    isSuperAdmin?: boolean;
    isSystemUser?: boolean;
  },
  schoolId: string | null,
): boolean {
  if (isParentOrStudentActor({ user_type: user.user_type || deriveUserType(user), role: user.role })) {
    return false;
  }
  return !!user.isSystemUser || schoolId == null;
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
    @InjectRepository(Staff)
    private staffRepository: Repository<Staff>,
    private jwtService: JwtService,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
    @Inject(forwardRef(() => RbacPermissionService))
    private readonly permissionService: RbacPermissionService,
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
    if (userType === 'staff') {
      await ensureStaffMembership(this.userRepository.manager, savedUser.id, schoolId);
    }
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

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // School-scoped users may only sign in when at least one membership school allows it.
    if (!user.isSuperAdmin && !user.isSystemUser && !isParentOrStudentActor(user)) {
      await this.applyLoginSchool(user);
    }

    if (
      !user.isSuperAdmin &&
      !user.isSystemUser &&
      user.school_id != null &&
      user.school_id !== '0'
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

    // Update last login
    user.lastLogin = new Date();
    await this.userRepository.save(user);

    if (!user.user_type) {
      user.user_type = deriveUserType(user);
      await this.userRepository.save(user);
    } else if (
      this.staffSessionAllowed(user) &&
      user.user_type !== 'staff' &&
      user.user_type !== 'platform'
    ) {
      user.user_type = 'staff';
      await this.userRepository.update(user.id, { user_type: 'staff' });
    }
    await this.rbacGroupService.ensurePersonaGroupMembership(user);
    await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);

    return this.buildAuthResponse(user);
  }

  invalidateUser(userId: string) {
    this.userCache.delete(userId);
    this.permissionService.invalidateUser(userId);
  }

  private staffSessionAllowed(user: User): boolean {
    const type = user.user_type || deriveUserType(user);
    return type === 'staff' || user.role === 'admin' || user.role === 'teacher';
  }

  private schoolAllowsStaffLogin(school?: School | null): boolean {
    if (!school) return false;
    const status = school.status || 'active';
    return status === 'active' || status === 'pending_payment';
  }

  async listStaffSchools(user: User): Promise<
    Array<{
      id: string;
      name: string;
      name_ar: string | null;
      name_en: string | null;
      status: string | null;
    }>
  > {
    if (!this.staffSessionAllowed(user) || isParentOrStudentActor(user)) {
      return [];
    }
    await ensureStaffMembership(this.userRepository.manager, user.id, user.school_id);
    const rows = await this.staffRepository.find({
      where: { user_id: user.id },
      relations: ['school'],
    });
    const seen = new Set<string>();
    const schools: Array<{
      id: string;
      name: string;
      name_ar: string | null;
      name_en: string | null;
      status: string | null;
    }> = [];
    for (const row of rows) {
      const school = row.school;
      if (!school || seen.has(school.id)) continue;
      seen.add(school.id);
      schools.push({
        id: school.id,
        name: school.name,
        name_ar: school.name_ar ?? null,
        name_en: school.name_en ?? null,
        status: school.status ?? null,
      });
    }
    return schools;
  }

  private async applyLoginSchool(user: User): Promise<void> {
    await ensureStaffMembership(this.userRepository.manager, user.id, user.school_id);
    const rows = await this.staffRepository.find({
      where: { user_id: user.id },
      relations: ['school'],
    });
    const schools = rows.map((r) => r.school).filter((s): s is School => !!s);
    const current = schools.find((s) => s.id === user.school_id) || user.school || null;
    if (this.schoolAllowsStaffLogin(current)) {
      if (current) user.school = current;
      return;
    }
    const fallback = schools.find((s) => this.schoolAllowsStaffLogin(s));
    if (fallback) {
      user.school_id = fallback.id;
      user.school = fallback;
      await this.userRepository.update(user.id, { school_id: fallback.id });
      this.invalidateUser(user.id);
    }
  }

  async switchSchool(actor: User, schoolId: string): Promise<any> {
    if (
      isParentOrStudentActor(actor) ||
      actor.isSuperAdmin ||
      actor.isSystemUser ||
      actor.user_type === 'platform'
    ) {
      throw new ForbiddenException('School switching is only for school staff');
    }
    if (!(await hasStaffMembership(this.userRepository.manager, actor.id, schoolId))) {
      throw new ForbiddenException('You are not a member of this school');
    }
    const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
    if (!school) {
      throw new ForbiddenException('You are not a member of this school');
    }
    if (school.status === 'pending') {
      throw new ForbiddenException('This school is pending approval');
    }
    if (school.status === 'suspended') {
      throw new ForbiddenException('This school account is suspended');
    }
    if (school.status === 'rejected') {
      throw new ForbiddenException('This school was not approved');
    }

    actor.school_id = school.id;
    actor.school = school;
    await this.userRepository.update(actor.id, { school_id: school.id });
    this.invalidateUser(actor.id);

    const fresh = await this.userRepository.findOne({
      where: { id: actor.id },
      relations: ['school'],
    });
    if (!fresh || !fresh.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }
    return this.buildAuthResponse(fresh);
  }

  private async buildAuthResponse(user: User) {
    const schoolId =
      user.school_id == null || user.school_id === '0' ? null : user.school_id;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      user_type: user.user_type || deriveUserType(user),
      school_id: schoolId,
      is_system_user: jwtIsSystemUser(user, schoolId),
      is_super_admin: !!user.isSuperAdmin,
    };
    const access_token = this.jwtService.sign(payload);
    const schools = await this.listStaffSchools(user);
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
        isSystemUser: jwtIsSystemUser(user, schoolId),
        isSuperAdmin: !!user.isSuperAdmin,
        schools,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<User> {
    if (isLetterApprovalPayload(payload)) {
      throw new UnauthorizedException('Invalid or expired token');
    }
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

    try {
      await this.rbacGroupService.ensureSchoolAdminMembershipIfMissing(user);
    } catch {
      // Side-effect only — must not turn a valid JWT into 401.
    }
    this.userCache.set(payload.sub, { at: Date.now(), user });
    return user;
  }

  /**
   * Issue a new access token. Accepts a token that is still valid, or expired
   * within a short grace window so in-flight use is not logged out.
   */
  async refreshFromBearer(authorization?: string): Promise<any> {
    const raw = authorization?.replace(/^Bearer\s+/i, '').trim();
    if (!raw) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    let payload: JwtPayload;
    try {
      payload = this.jwtService.verify<JwtPayload>(raw, { ignoreExpiration: true });
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
    if (isLetterApprovalPayload(payload)) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const now = Math.floor(Date.now() / 1000);
    const graceSeconds = Number(process.env.JWT_REFRESH_GRACE_SECONDS) || 2 * 60 * 60;
    if (typeof payload.exp === 'number' && now - payload.exp > graceSeconds) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return this.refreshToken(payload.sub);
  }

  async refreshToken(userId: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['school'],
    });

    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return this.buildAuthResponse(user);
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

