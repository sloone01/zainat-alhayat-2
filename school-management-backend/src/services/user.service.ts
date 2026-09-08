import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { RbacGroupService } from '../rbac/rbac-group.service';
import * as bcrypt from 'bcryptjs';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { sanitizeUser } from '../common/security/school-access';

export type AppUserType = 'staff' | 'parent' | 'student' | 'platform';

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  /** Legacy single role (admin|teacher|student|parent) — mapped to user_type when needed. */
  role?: 'admin' | 'teacher' | 'student' | 'parent';
  roles?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  school_id?: number | null;
  /** Practical persona: staff | parent | student | platform */
  user_type?: AppUserType;
  /** Staff user-group IDs (rbac_groups). Ignored for parent/student. */
  groupIds?: string[];
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'admin' | 'teacher' | 'student' | 'parent';
  roles?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  user_type?: AppUserType;
  groupIds?: string[];
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
    private readonly notifications: NotificationDispatcherService,
  ) {}

  private mapLegacyRoleToUserType(
    role?: string,
    explicit?: AppUserType,
  ): AppUserType {
    if (explicit) return explicit;
    if (role === 'parent') return 'parent';
    if (role === 'student') return 'student';
    return 'staff';
  }

  private legacyRoleFromUserType(userType: AppUserType, role?: string): User['role'] {
    if (userType === 'parent') return 'parent';
    if (userType === 'student') return 'student';
    if (role === 'admin' || role === 'teacher') return role;
    return 'teacher';
  }

  async create(createUserDto: CreateUserDto, actor?: User): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    if (existingUser) {
      throw new ConflictException('User with this username or email already exists');
    }

    const userType = this.mapLegacyRoleToUserType(
      createUserDto.role,
      createUserDto.user_type,
    );

    let schoolId: number | undefined =
      createUserDto.school_id != null
        ? createUserDto.school_id
        : actor?.school_id ?? undefined;

    if (userType === 'platform') {
      if (!actor?.isSuperAdmin) {
        throw new ForbiddenException('Only super admin can create platform users');
      }
      schoolId = undefined;
    } else if (actor && !actor.isSuperAdmin && !actor.isSystemUser) {
      schoolId = actor.school_id ?? undefined;
      if (schoolId == null) {
        throw new BadRequestException('School context required');
      }
    }

    if (userType === 'staff' && schoolId == null) {
      throw new BadRequestException('Staff users require a school');
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(createUserDto.password, saltRounds);

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
    } as Partial<User>);

    const saved = await this.userRepository.save(user);

    if (userType === 'parent' || userType === 'student') {
      await this.rbacGroupService.ensurePersonaGroupMembership(saved);
    } else if (userType === 'staff' && createUserDto.groupIds?.length) {
      const assignActor = actor || saved;
      for (const groupId of createUserDto.groupIds) {
        await this.rbacGroupService.assignUserToGroup(assignActor, saved.id, groupId);
      }
    }

    void this.notifyAccountCreated(saved);
    return sanitizeUser(saved) as User;
  }

  async findAll(actor?: User): Promise<User[]> {
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
    ] as const;
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

  async findOne(id: string): Promise<User> {
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
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByUsername(username: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { username },
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto, actor?: User): Promise<User> {
    const user = await this.findOne(id);

    if (updateUserDto.username || updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: [
          { username: updateUserDto.username },
          { email: updateUserDto.email },
        ],
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('User with this username or email already exists');
      }
    }

    if (updateUserDto.user_type) {
      user.user_type = updateUserDto.user_type;
      user.role = this.legacyRoleFromUserType(updateUserDto.user_type, updateUserDto.role || user.role);
    } else if (updateUserDto.role) {
      user.role = updateUserDto.role;
      user.user_type = this.mapLegacyRoleToUserType(updateUserDto.role);
    }

    const { groupIds, user_type: _ut, role: _r, ...rest } = updateUserDto;
    Object.assign(user, rest);
    const saved = await this.userRepository.save(user);

    if (saved.user_type === 'parent' || saved.user_type === 'student') {
      await this.rbacGroupService.ensurePersonaGroupMembership(saved);
    } else if (groupIds && actor) {
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

  async updatePassword(id: string, newPassword: string, actor?: User): Promise<void> {
    const password = (newPassword ?? '').trim();
    if (password.length < 8) {
      throw new BadRequestException('Password must be at least 8 characters long');
    }

    // Scope the lookup: an unscoped update by id crossed school boundaries, so an admin
    // of one school could reset an account in another.
    const schoolId =
      actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null
        ? actor.school_id
        : null;
    const user = await this.userRepository.findOne({
      where: schoolId == null ? { id } : { id, school_id: schoolId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    await this.userRepository.update(user.id, { password: hashedPassword });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByRole(role: string, actor?: User): Promise<User[]> {
    const where: Record<string, unknown> = { role: role as User['role'] };
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

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }

  private async notifyAccountCreated(user: User): Promise<void> {
    if (!user.email && !user.phone) return;
    await this.notifications.notifySafe({
      schoolId: user.school_id ?? null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.AUTH_ACCOUNT_CREATED,
      locale: 'ar',
      variables: {
        recipientName: `${user.firstName} ${user.lastName}`.trim() || user.email,
        email: user.email || '',
      },
      recipients: [{ email: user.email, phone: user.phone, userId: user.id, name: user.firstName }],
    });
  }
}
