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
import { Brackets, ILike, Repository } from 'typeorm';
import { randomBytes } from 'crypto';
import { User } from '../entities/user.entity';
import { School } from '../entities/school.entity';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { RbacGroupService } from '../rbac/rbac-group.service';
import * as bcrypt from 'bcryptjs';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { sanitizeUser, sanitizeUserDeep } from '../common/security/school-access';
import { applyBilingualName, normalizeCivilId, normalizeEmail } from '../common/identity/bilingual-name';
import { ensureStaffMembership, hasStaffMembership } from '../common/identity/staff-membership';
import { AuthService } from '../auth/auth.service';

export type AppUserType = 'staff' | 'parent' | 'student' | 'platform';

export interface CreateUserDto {
  username: string;
  email: string;
  /** Optional — generated and emailed when omitted. */
  password?: string;
  firstName: string;
  lastName: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  civil_id?: string;
  /** Legacy single role (admin|teacher|student|parent) — mapped to user_type when needed. */
  role?: 'admin' | 'teacher' | 'student' | 'parent';
  roles?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  school_id?: string | null;
  /** Practical persona: staff | parent | student | platform */
  user_type?: AppUserType;
  /** Staff user-group IDs (rbac_groups). Ignored for parent/student. */
  groupIds?: string[];
  /** Notification language preference. */
  preferred_language?: 'ar' | 'en';
  /**
   * Parent and student accounts: the student record to link the new account to. School admins
   * must provide it — a parent is only visible to a school through a linked student, and a
   * student login is only usable once it is attached to a student record.
   */
  studentId?: string;
  relationship?: 'father' | 'mother' | 'guardian';
  /** Parent accounts: link to several students at once (replaces studentId + relationship). */
  links?: { student_id: string; relationship?: 'father' | 'mother' | 'guardian' }[];
  /**
   * Parent accounts: the caller confirmed that an already-registered parent (same email, phone
   * or civil id) should only be linked to the students, without creating a new account.
   */
  link_existing?: boolean;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  civil_id?: string;
  role?: 'admin' | 'teacher' | 'student' | 'parent';
  roles?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: Date;
  isActive?: boolean;
  user_type?: AppUserType;
  groupIds?: string[];
  preferred_language?: 'ar' | 'en';
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @Inject(forwardRef(() => RbacGroupService))
    private readonly rbacGroupService: RbacGroupService,
    private readonly notifications: NotificationDispatcherService,
    @Inject(forwardRef(() => AuthService))
    private readonly authService: AuthService,
  ) {}

  private generateTempPassword(): string {
    return randomBytes(9).toString('base64url').slice(0, 12);
  }

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

  async create(
    createUserDto: CreateUserDto,
    actor?: User,
    opts?: { requireParentStudentLink?: boolean; requireStudentRecordLink?: boolean },
  ): Promise<User> {
    const userType = this.mapLegacyRoleToUserType(
      createUserDto.role,
      createUserDto.user_type,
    );

    let schoolId: string | undefined =
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

    let linkStudent: Student | null = null;
    const parentLinks: { student: Student; relationship?: string }[] = [];
    if (userType === 'parent') {
      const studentId = createUserDto.studentId?.trim();
      const seen = new Set<string>();
      for (const link of createUserDto.links ?? []) {
        const id = String(link?.student_id ?? '').trim();
        if (!id || seen.has(id)) continue;
        seen.add(id);
        parentLinks.push({
          student: await this.findLinkableStudent(id, schoolId, actor),
          relationship: link.relationship,
        });
      }
      if (parentLinks.length) {
        linkStudent = parentLinks[0].student;
      } else if (studentId) {
        linkStudent = await this.findLinkableStudent(studentId, schoolId, actor);
      } else if (
        opts?.requireParentStudentLink &&
        actor &&
        !actor.isSuperAdmin &&
        !actor.isSystemUser
      ) {
        throw new BadRequestException('A student must be selected to link the parent to');
      }
      schoolId = undefined;
    }

    // Student accounts: attach the login to an existing student record, otherwise the account is
    // an orphan users row that never shows up against the student in the school's lists.
    let linkStudentRecord: Student | null = null;
    if (userType === 'student') {
      const studentId = createUserDto.studentId?.trim();
      if (studentId) {
        linkStudentRecord = await this.findLinkableStudent(studentId, schoolId, actor);
      } else if (
        opts?.requireStudentRecordLink &&
        actor &&
        !actor.isSuperAdmin &&
        !actor.isSystemUser
      ) {
        throw new BadRequestException('A student must be selected to link the account to');
      }
    }

    if (userType === 'staff' && schoolId) {
      const linked = await this.linkExistingStaff(createUserDto, schoolId, actor);
      if (linked) return linked;
    }

    // Registered parent (email, phone or civil id): never create a second account. The caller
    // must confirm first; then only the links to this school's students are added.
    if (userType === 'parent' && parentLinks.length) {
      const registered = await this.findRegisteredParent({
        email: createUserDto.email,
        phone: createUserDto.phone,
        civil_id: createUserDto.civil_id,
      });
      if (registered) {
        if (!createUserDto.link_existing) {
          throw new ConflictException('PARENT_EXISTS');
        }
        const withParents = await this.studentsWithParents(
          parentLinks.map((link) => link.student.id),
          actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null,
        );
        if (withParents.length) {
          throw new BadRequestException('STUDENT_HAS_PARENT');
        }
        for (const link of parentLinks) {
          await this.linkParentUserToStudent(registered, link.student, link.relationship);
        }
        await this.rbacGroupService.ensurePersonaGroupMembership(registered);
        return { ...(sanitizeUser(registered) as User), linked_existing: true } as User;
      }
    }

    const existingUser = await this.userRepository.findOne({
      where: [
        { username: createUserDto.username },
        { email: createUserDto.email },
      ],
    });

    // Existing parent account with this email (e.g. created earlier without a student link):
    // link it to the chosen student instead of failing, as the add-student flow does.
    if (
      existingUser &&
      linkStudent &&
      existingUser.user_type === 'parent' &&
      normalizeEmail(existingUser.email) === normalizeEmail(createUserDto.email)
    ) {
      await this.linkParentUserToStudent(existingUser, linkStudent, createUserDto.relationship);
      return sanitizeUser(existingUser) as User;
    }

    // Same for an existing student account: attach it to the chosen student record instead of
    // failing, so accounts created before this link existed can be recovered.
    if (
      existingUser &&
      linkStudentRecord &&
      existingUser.user_type === 'student' &&
      normalizeEmail(existingUser.email) === normalizeEmail(createUserDto.email)
    ) {
      await this.linkUserToStudentRecord(existingUser, linkStudentRecord);
      return sanitizeUser(existingUser) as User;
    }

    if (existingUser) {
      throw new ConflictException('User with this username or email already exists');
    }

    // Fail before creating an orphan login when the student already has one.
    if (linkStudentRecord?.user_id) {
      throw new BadRequestException('This student already has a linked account');
    }

    const issuedTemp = !createUserDto.password?.trim();
    const plainPassword =
      createUserDto.password?.trim() || this.generateTempPassword();
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    const legacyRole = this.legacyRoleFromUserType(userType, createUserDto.role);

    const names = applyBilingualName(createUserDto);
    const preferred =
      createUserDto.preferred_language === 'en' || createUserDto.preferred_language === 'ar'
        ? createUserDto.preferred_language
        : 'ar';
    const user = this.userRepository.create({
      username: createUserDto.username,
      email: createUserDto.email,
      password: hashedPassword,
      ...names,
      civil_id: normalizeCivilId(createUserDto.civil_id),
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
    } as Partial<User>);

    const saved = await this.userRepository.save(user);
    if (userType === 'staff' && schoolId) {
      await ensureStaffMembership(this.userRepository.manager, saved.id, schoolId);
    }

    if (userType === 'parent' && parentLinks.length) {
      for (const link of parentLinks) {
        await this.linkParentUserToStudent(saved, link.student, link.relationship);
      }
    } else if (userType === 'parent' && linkStudent) {
      await this.linkParentUserToStudent(saved, linkStudent, createUserDto.relationship);
    }

    if (userType === 'student' && linkStudentRecord) {
      await this.linkUserToStudentRecord(saved, linkStudentRecord);
    }

    if (userType === 'parent' || userType === 'student') {
      await this.rbacGroupService.ensurePersonaGroupMembership(saved);
    } else if (userType === 'staff' && createUserDto.groupIds?.length) {
      const assignActor = actor || saved;
      for (const groupId of createUserDto.groupIds) {
        await this.rbacGroupService.assignUserToGroup(assignActor, saved.id, groupId);
      }
    }

    void this.notifyAccountCreated(saved, plainPassword);
    return sanitizeUser(saved) as User;
  }

  /** A parent account that already exists on the platform with this email, phone or civil id. */
  private async findRegisteredParent(input: {
    email?: string;
    phone?: string;
    civil_id?: string;
  }): Promise<User | null> {
    const email = normalizeEmail(input.email ?? '') || '';
    const phone = String(input.phone ?? '').replace(/\s+/g, '');
    const civil = normalizeCivilId(input.civil_id) || '';
    if (!email && !phone && !civil) return null;
    const qb = this.userRepository
      .createQueryBuilder('u')
      // Match parents created via any flow (some legacy rows set role but not user_type).
      .where("(u.user_type = 'parent' OR u.role = 'parent')")
      .andWhere(
        new Brackets((w) => {
          if (email) w.orWhere('LOWER(u.email) = :email', { email });
          if (phone) w.orWhere("REPLACE(u.phone, ' ', '') = :phone", { phone });
          if (civil) w.orWhere('u.civil_id = :civil', { civil });
        }),
      );
    return qb.getOne();
  }

  /** Students (of this school) that already have a parent linked. */
  private async studentsWithParents(studentIds: string[], schoolId?: string | null): Promise<string[]> {
    if (!studentIds.length) return [];
    const rows: { student_id: string }[] = await this.userRepository.query(
      `SELECT DISTINCT sp.student_id
         FROM student_parents sp
         INNER JOIN students st ON st.id = sp.student_id
        WHERE sp.student_id = ANY($1::uuid[])
          AND ($2::uuid IS NULL OR st.school_id = $2::uuid)`,
      [studentIds, schoolId ?? null],
    );
    return rows.map((r) => r.student_id);
  }

  /** Lets the add-parent form warn before linking an already-registered parent. */
  async lookupParent(
    actor: User | undefined,
    input: { email?: string; phone?: string; civil_id?: string; student_ids?: string[] },
  ) {
    const parent = await this.findRegisteredParent(input);
    if (!parent) return { exists: false };
    const maskEmail = (v?: string | null) => {
      const [name, domain] = String(v ?? '').split('@');
      return domain ? `${name.slice(0, 1)}***@${domain}` : null;
    };
    const maskPhone = (v?: string | null) => {
      const digits = String(v ?? '');
      return digits.length > 3 ? `***${digits.slice(-3)}` : null;
    };
    let linkedStudentIds: string[] = [];
    const schoolId = actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null;
    if (schoolId) {
      const rows: { student_id: string }[] = await this.userRepository.query(
        `SELECT sp.student_id
           FROM student_parents sp
           INNER JOIN parents p ON p.id = sp.parent_id
           INNER JOIN students st ON st.id = sp.student_id
          WHERE p.user_id = $1 AND st.school_id = $2`,
        [parent.id, schoolId],
      );
      linkedStudentIds = rows.map((r) => r.student_id);
    }
    return {
      exists: true,
      name_ar: [parent.first_name_ar, parent.last_name_ar].filter(Boolean).join(' ') || null,
      name_en: [parent.first_name_en, parent.last_name_en].filter(Boolean).join(' ') || null,
      name: `${parent.firstName ?? ''} ${parent.lastName ?? ''}`.trim(),
      email: maskEmail(parent.email),
      phone: maskPhone(parent.phone),
      linked_student_ids: linkedStudentIds,
      students_with_parents: await this.studentsWithParents(
        input.student_ids ?? [],
        actor && !actor.isSuperAdmin && !actor.isSystemUser ? actor.school_id : null,
      ),
    };
  }

  /** Load a student the actor may link an account to (school-scoped for school users). */
  private async findLinkableStudent(
    studentId: string,
    schoolId: string | undefined,
    actor?: User,
  ): Promise<Student> {
    const studentSchoolId =
      actor && !actor.isSuperAdmin && !actor.isSystemUser ? schoolId : undefined;
    const student = await this.userRepository.manager.getRepository(Student).findOne({
      where: studentSchoolId ? { id: studentId, school_id: studentSchoolId } : { id: studentId },
    });
    if (!student) {
      throw new BadRequestException('Student not found in this school');
    }
    return student;
  }

  /** Attach a student login to its student record (students.user_id). */
  private async linkUserToStudentRecord(user: User, student: Student): Promise<void> {
    if (student.user_id && student.user_id !== user.id) {
      throw new BadRequestException('This student already has a linked account');
    }
    student.user_id = user.id;
    if (!student.email?.trim() && user.email) {
      student.email = user.email;
    }
    await this.userRepository.manager.getRepository(Student).save(student);
  }

  /** Ensure a parents profile exists for this user and link it to the student. */
  private async linkParentUserToStudent(
    user: User,
    student: Student,
    relationship?: string,
  ): Promise<void> {
    const parentRepo = this.userRepository.manager.getRepository(Parent);
    let parent = await parentRepo.findOne({ where: { user_id: user.id } });
    if (!parent) {
      const email = normalizeEmail(user.email);
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
    } else {
      parent = await parentRepo.save(
        parentRepo.create({
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
        } as Partial<Parent>),
      );
    }
    const rel =
      relationship === 'father' || relationship === 'mother' ? relationship : 'guardian';
    await parentRepo.query(
      `DELETE FROM student_parents WHERE student_id = $1 AND parent_id = $2`,
      [student.id, parent.id],
    );
    await parentRepo.query(
      `INSERT INTO student_parents (student_id, parent_id, relationship) VALUES ($1, $2, $3)`,
      [student.id, parent.id, rel],
    );
  }

  async findAll(
    actor?: User,
    audience?: 'staff' | 'parent' | 'student',
  ): Promise<User[]> {
    const qb = this.userRepository.createQueryBuilder('u');

    // Parents (and some students) keep users.school_id null; school scope is via linked students.
    // Staff may be active at this school via staff membership while users.school_id is another school.
    if (actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null) {
      const schoolId = actor.school_id;
      qb.where(
        new Brackets((w) => {
          w.where('u.school_id = :schoolId', { schoolId })
            .orWhere(
              `u.id IN (SELECT s.user_id FROM staff s WHERE s.school_id = :schoolId)`,
              { schoolId },
            )
            .orWhere(
              `u.id IN (
                SELECT p.user_id FROM parents p
                WHERE p.user_id IS NOT NULL
                  AND EXISTS (
                    SELECT 1 FROM student_parents sp
                    INNER JOIN students st ON st.id = sp.student_id
                    WHERE sp.parent_id = p.id AND st.school_id = :schoolId
                  )
              )`,
              { schoolId },
            )
            .orWhere(
              `u.id IN (
                SELECT stu.user_id FROM students stu
                WHERE stu.school_id = :schoolId AND stu.user_id IS NOT NULL
              )`,
              { schoolId },
            );
        }),
      );
    }

    if (audience === 'staff') {
      qb.andWhere(
        new Brackets((w) => {
          w.where("u.user_type = 'staff'").orWhere("u.role IN ('admin', 'teacher')");
          if (actor?.school_id) {
            w.orWhere(
              `u.id IN (SELECT s.user_id FROM staff s WHERE s.school_id = :staffSchoolId)`,
              { staffSchoolId: actor.school_id },
            );
          }
        }),
      );
    } else if (audience === 'parent') {
      qb.andWhere(
        new Brackets((w) => {
          w.where("u.user_type = 'parent'").orWhere("u.role = 'parent'");
        }),
      );
    } else if (audience === 'student') {
      qb.andWhere(
        new Brackets((w) => {
          w.where("u.user_type = 'student'").andWhere("u.role NOT IN ('admin', 'teacher')");
        }),
      );
    }

    qb.orderBy('u.createdAt', 'DESC');
    return sanitizeUserDeep(await qb.getMany()) as User[];
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

  /** Unique login name from the email local-part (parent/student register). */
  async uniqueUsernameFromEmail(email: string): Promise<string> {
    const local =
      (email.split('@')[0] || 'user').replace(/[^a-zA-Z0-9._-]/g, '').slice(0, 40) || 'user';
    let candidate = local;
    let n = 0;
    for (;;) {
      const taken = await this.userRepository.findOne({ where: { username: candidate } });
      if (!taken) return candidate;
      n += 1;
      candidate = `${local}${n}`;
    }
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

    const { groupIds, user_type: _ut, role: _r, civil_id, preferred_language, ...rest } =
      updateUserDto;
    Object.assign(user, rest);
    if (civil_id !== undefined) {
      user.civil_id = normalizeCivilId(civil_id);
    }
    if (preferred_language === 'en' || preferred_language === 'ar') {
      user.preferred_language = preferred_language;
    }
    Object.assign(user, applyBilingualName({ ...user, ...rest }));
    const saved = await this.userRepository.save(user);

    if (saved.user_type === 'parent' || saved.user_type === 'student') {
      await this.rbacGroupService.ensurePersonaGroupMembership(saved);
    } else if (groupIds && actor) {
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

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const saltRounds = Number(process.env.BCRYPT_SALT_ROUNDS) || 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    await this.userRepository.update(id, {
      password: hashedPassword,
      must_change_password: true,
    });
  }

  /** Admin reset: email a one-time link. Does not change the current password. */
  async resetPasswordAndNotify(id: string, actor?: User): Promise<void> {
    const user = await this.findOne(id);
    if (user.user_type === 'parent' && !actor?.isSuperAdmin && !actor?.isSystemUser) {
      throw new ForbiddenException('A parent password cannot be reset from a school');
    }
    if (!user.email) {
      throw new BadRequestException('This user has no email, so a reset link cannot be sent.');
    }
    await this.authService.issuePasswordResetLink(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  async findByRole(role: string, actor?: User): Promise<User[]> {
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
    ] as const;

    if (actor && !actor.isSuperAdmin && !actor.isSystemUser && actor.school_id != null) {
      const schoolId = actor.school_id;
      const qb = this.userRepository
        .createQueryBuilder('u')
        .select(select.map((c) => `u.${c}`))
        .where('u.role = :role', { role })
        .andWhere(
          `(
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
          )`,
          { schoolId },
        )
        .orderBy('u."createdAt"', 'DESC');
      return qb.getMany();
    }

    return this.userRepository.find({
      where: { role: role as User['role'] },
      select: [...select],
      order: { createdAt: 'DESC' },
    });
  }

  async toggleActive(id: string): Promise<User> {
    const user = await this.findOne(id);
    user.isActive = !user.isActive;
    return this.userRepository.save(user);
  }

  private isStaffAccount(user: User): boolean {
    if (user.user_type === 'staff') return true;
    return user.role === 'admin' || user.role === 'teacher';
  }

  private async findExistingStaffUser(dto: CreateUserDto): Promise<User | null> {
    const email = normalizeEmail(dto.email);
    if (email) {
      const byEmail = await this.userRepository.findOne({
        where: { email: ILike(email) },
      });
      if (byEmail) return byEmail;
    }
    const civil = normalizeCivilId(dto.civil_id);
    if (!civil) return null;
    return this.userRepository.findOne({
      where: { civil_id: civil, user_type: 'staff' },
    });
  }

  private async linkExistingStaff(
    dto: CreateUserDto,
    schoolId: string,
    actor?: User,
  ): Promise<User | null> {
    const existing = await this.findExistingStaffUser(dto);
    if (!existing) return null;
    if (!this.isStaffAccount(existing)) {
      throw new ConflictException('User with this username or email already exists');
    }
    if (await hasStaffMembership(this.userRepository.manager, existing.id, schoolId)) {
      throw new ConflictException('User with this username or email already exists');
    }
    await ensureStaffMembership(this.userRepository.manager, existing.id, schoolId);
    const civil = normalizeCivilId(dto.civil_id);
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
    return sanitizeUser(existing) as User;
  }

  private async notifyAccountCreated(user: User, tempPassword: string): Promise<void> {
    if (!user.email && !user.phone) return;
    const school = user.school_id
      ? await this.schoolRepository.findOne({ where: { id: user.school_id } })
      : null;
    await this.notifications.notifySafe({
      schoolId: user.school_id ?? null,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.AUTH_ACCOUNT_CREATED,
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
}
