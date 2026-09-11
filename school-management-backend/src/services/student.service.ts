import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { Parent } from '../entities/parent.entity';
import { Bus } from '../entities/bus.entity';
import { Group } from '../entities/group.entity';
import { StudentPaymentService } from './student-payment.service';
import { UserService } from './user.service';
import { ParentService, type ParentRelationship } from './parent.service';
import { sanitizeUserDeep, assertSameSchool } from '../common/security/school-access';
import type { RegisterStudentInAppDto } from '../dto/student-register.dto';
import { applyBilingualName, hasCompleteBilingualName } from '../common/identity/bilingual-name';

export type StudentListFeeLevel = 'all' | 'with' | 'without';

export interface StudentListQuery {
  page?: number;
  limit?: number;
  q?: string;
  fee_level?: StudentListFeeLevel;
}

export interface PaginatedStudents {
  items: Student[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  dateOfBirth: Date;
  gender: 'male' | 'female';
  address: string;
  phone?: string;
  email?: string;
  emergencyContact: string;
  medicalInfo?: string;
  notes?: string;
  // Additional fields
  secondName?: string;
  thirdName?: string;
  nationality?: string;
  studentId?: string;
  photo?: string;
  parentIds?: string[];
  userId?: string;
  school_id?: string;
  payment_level_id?: string | null;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
  first_name_ar?: string | null;
  first_name_en?: string | null;
  last_name_ar?: string | null;
  last_name_en?: string | null;
  dateOfBirth?: Date;
  gender?: 'male' | 'female';
  address?: string;
  phone?: string;
  email?: string;
  emergencyContact?: string;
  medicalInfo?: string;
  notes?: string;
  // Additional fields
  secondName?: string;
  thirdName?: string;
  nationality?: string;
  studentId?: string;
  photo?: string;
  parentIds?: string[];
  userId?: string;
  payment_level_id?: string | null;
}

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Bus)
    private busRepository: Repository<Bus>,
    @InjectRepository(Group)
    private groupRepository: Repository<Group>,
    private readonly studentPaymentService: StudentPaymentService,
    private readonly userService: UserService,
    private readonly parentService: ParentService,
  ) {}

  async create(createStudentDto: CreateStudentDto, actorSchoolId?: string | null): Promise<Student> {
    if (!createStudentDto.payment_level_id?.trim()) {
      throw new BadRequestException(
        'Grade (payment level) is required when registering a student',
      );
    }

    const school_id =
      actorSchoolId != null ? actorSchoolId : createStudentDto.school_id;
    if (school_id == null) {
      throw new BadRequestException('school_id is required');
    }

    const names = applyBilingualName(createStudentDto);
    const student = this.studentRepository.create({
      ...createStudentDto,
      ...names,
      school_id,
    });

    // Set user if provided
    if (createStudentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createStudentDto.userId }
      });
      if (user) {
        student.user = user;
      }
    }

    // Set parents if provided
    if (createStudentDto.parentIds && createStudentDto.parentIds.length > 0) {
      const parents = await this.parentRepository.findByIds(createStudentDto.parentIds);
      student.parents = parents;
    }

    return this.studentRepository.save(student);
  }

  /**
   * Staff in-app register: student + parent (new or existing) + optional logins + class group.
   * Uses `students` create — does not require the `users` create claim.
   */
  async registerInApp(dto: RegisterStudentInAppDto, actor: User): Promise<Student> {
    const group = await this.groupRepository.findOne({ where: { id: dto.groupId } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${dto.groupId} not found`);
    }
    assertSameSchool(actor, group.school_id);

    if (!group.level_id) {
      throw new BadRequestException('Selected group has no fee level');
    }
    if (group.capacity > 0 && group.studentCount >= group.capacity) {
      throw new BadRequestException('This group is at full capacity');
    }

    const parentInput = dto.parent;
    const createNewParent = parentInput?.createNew === true;
    const existingParentId = parentInput?.existingParentId?.trim() || '';
    if (!createNewParent && !existingParentId) {
      throw new BadRequestException('A parent is required');
    }

    const createStudentUser = dto.createStudentUser === true;
    const studentEmail = (dto.studentEmail || dto.email || '').trim();
    if (createStudentUser && !studentEmail) {
      throw new BadRequestException('Student email is required to create a login');
    }

    if (createNewParent) {
      if (!hasCompleteBilingualName(parentInput || {})) {
        throw new BadRequestException('Parent Arabic and English first and last names are required');
      }
      if (parentInput?.createUser && !parentInput.email?.trim()) {
        throw new BadRequestException('Parent email is required to create a login');
      }
    }

    if (!hasCompleteBilingualName(dto)) {
      throw new BadRequestException('Student Arabic and English first and last names are required');
    }

    const schoolId = String(group.school_id);
    const emergencyContact =
      (dto.emergencyContact || parentInput?.phone || '').trim() || '—';

    const studentNames = applyBilingualName(dto);
    const student = await this.create(
      {
        ...studentNames,
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
      },
      schoolId,
    );

    const relationship: ParentRelationship = parentInput?.relationship || 'guardian';

    if (createNewParent && parentInput) {
      const parentNames = applyBilingualName(parentInput);
      const existing = await this.parentService.findExistingParent({
        civil_id: parentInput.civil_id,
        email: parentInput.email,
        phone: parentInput.phone,
      });
      if (existing) {
        await this.parentService.assignToStudent(
          existing.id,
          student.id,
          schoolId,
          relationship,
        );
      } else {
        let parentUserId: string | undefined;
        if (parentInput.createUser) {
          const parentEmail = parentInput.email!.trim();
          const parentUser = await this.userService.create(
            {
              username: await this.userService.uniqueUsernameFromEmail(parentEmail),
              email: parentEmail,
              ...parentNames,
              civil_id: parentInput.civil_id,
              phone: parentInput.phone?.trim() || undefined,
              user_type: 'parent',
              school_id: null,
            },
            actor,
          );
          parentUserId = parentUser.id;
        }

        await this.parentService.create({
          ...parentNames,
          civil_id: parentInput.civil_id,
          email: parentInput.email?.trim() || undefined,
          phone: parentInput.phone?.trim() || undefined,
          tribe: parentInput.tribe,
          workplace: parentInput.workplace,
          workPhone: parentInput.workPhone,
          maritalStatus: parentInput.maritalStatus,
          organizationName: parentInput.organizationName,
          responsiblePerson: parentInput.responsiblePerson,
          responsiblePhone: parentInput.responsiblePhone,
          userId: parentUserId,
          studentIds: [student.id],
          relationship,
        }, schoolId);
      }
    } else if (existingParentId) {
      await this.parentService.assignToStudent(
        existingParentId,
        student.id,
        schoolId,
        relationship,
      );
    }

    if (createStudentUser) {
      const studentUser = await this.userService.create(
        {
          username: await this.userService.uniqueUsernameFromEmail(studentEmail),
          email: studentEmail,
          firstName: student.firstName,
          lastName: student.lastName,
          first_name_ar: student.first_name_ar,
          first_name_en: student.first_name_en,
          last_name_ar: student.last_name_ar,
          last_name_en: student.last_name_en,
          user_type: 'student',
          school_id: schoolId,
        },
        actor,
      );
      student.user_id = studentUser.id;
      student.email = studentEmail;
      await this.studentRepository.save(student);
    }

    return this.assignToGroup(student.id, group.id, {
      paymentLevelId: group.level_id,
    });
  }

  async findAll(schoolId?: string | null): Promise<Student[]> {
    const where = schoolId != null ? { school_id: schoolId } : {};
    // List view only — skip attendances/progress (huge payload; timeouts on mobile).
    const rows = await this.studentRepository.find({
      where,
      relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'paymentLevel'],
      order: { firstName: 'ASC', lastName: 'ASC' },
    });
    return sanitizeUserDeep(rows);
  }

  /**
   * Server-paged student list for heavy screens (e.g. /students/payments).
   * Search matches student or parent name; fee_level filters fee-level linkage.
   */
  async findPage(
    schoolId: string | null | undefined,
    query: StudentListQuery = {},
  ): Promise<PaginatedStudents> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const feeLevel: StudentListFeeLevel =
      query.fee_level === 'with' || query.fee_level === 'without' ? query.fee_level : 'all';
    const q = (query.q || '').trim().toLowerCase();

    const idQb = this.studentRepository
      .createQueryBuilder('student')
      .select('student.id', 'id');

    if (schoolId != null) {
      idQb.andWhere('student.school_id = :schoolId', { schoolId });
    }

    if (q) {
      idQb
        .leftJoin('student.parents', 'parent')
        .andWhere(
          new Brackets((w) => {
            w.where('LOWER(student.firstName) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(student.lastName) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(student.first_name_ar) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(student.first_name_en) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(student.last_name_ar) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(student.last_name_en) LIKE :term', { term: `%${q}%` })
              .orWhere(
                `LOWER(CONCAT(COALESCE(student.firstName, ''), ' ', COALESCE(student.lastName, ''))) LIKE :term`,
                { term: `%${q}%` },
              )
              .orWhere('LOWER(parent.firstName) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(parent.lastName) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(parent.first_name_ar) LIKE :term', { term: `%${q}%` })
              .orWhere('LOWER(parent.first_name_en) LIKE :term', { term: `%${q}%` });
          }),
        );
    }

    if (feeLevel === 'with') {
      idQb.andWhere(
        new Brackets((w) => {
          w.where('student.payment_level_id IS NOT NULL').orWhere(
            `EXISTS (
              SELECT 1 FROM student_groups sg
              INNER JOIN groups g ON g.id = sg.group_id
              WHERE sg.student_id = student.id AND g.level_id IS NOT NULL
            )`,
          );
        }),
      );
    } else if (feeLevel === 'without') {
      idQb
        .andWhere('student.payment_level_id IS NULL')
        .andWhere(
          `NOT EXISTS (
            SELECT 1 FROM student_groups sg
            INNER JOIN groups g ON g.id = sg.group_id
            WHERE sg.student_id = student.id AND g.level_id IS NOT NULL
          )`,
        );
    }

    // Distinct id list when parent join multiplies rows.
    const totalRow = await idQb.clone().select('COUNT(DISTINCT student.id)', 'cnt').getRawOne();
    const total = Number(totalRow?.cnt || 0);
    const pages = Math.max(1, Math.ceil(total / limit) || 1);
    const safePage = Math.min(page, pages);

    // GROUP BY avoids PostgreSQL DISTINCT + ORDER BY column mismatches when parents join.
    const idRows = await idQb
      .clone()
      .select('student.id', 'id')
      .addSelect('MIN(student.firstName)', 'sort_first')
      .addSelect('MIN(student.lastName)', 'sort_last')
      .groupBy('student.id')
      .orderBy('sort_first', 'ASC')
      .addOrderBy('sort_last', 'ASC')
      .addOrderBy('student.id', 'ASC')
      .offset((safePage - 1) * limit)
      .limit(limit)
      .getRawMany();
    const ids = idRows.map((r) => String(r.id));

    if (!ids.length) {
      return { items: [], total, page: safePage, limit, pages };
    }

    const rows = await this.studentRepository.find({
      where: { id: In(ids) },
      relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'paymentLevel'],
    });
    const byId = new Map(rows.map((s) => [String(s.id), s]));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as Student[];

    return {
      items: sanitizeUserDeep(ordered),
      total,
      page: safePage,
      limit,
      pages,
    };
  }

  async findOne(id: string, schoolId?: string | null): Promise<Student> {
    const where: Record<string, unknown> = { id };
    if (schoolId != null) where.school_id = schoolId;
    const student = await this.studentRepository.findOne({
      where,
      relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    await this.attachParentRelationships(student);
    return sanitizeUserDeep(student);
  }

  /** Merge `student_parents.relationship` onto each parent on the student. */
  private async attachParentRelationships(student: Student): Promise<void> {
    if (!student?.id || !student.parents?.length) return;
    const rows: Array<{ parent_id: string; relationship: string }> =
      await this.studentRepository.query(
        `SELECT parent_id, relationship FROM student_parents WHERE student_id = $1`,
        [student.id],
      );
    const byId = new Map(
      rows.map((r) => [Number(r.parent_id), r.relationship || 'guardian']),
    );
    for (const parent of student.parents) {
      (parent as Parent & { relationship?: string }).relationship =
        byId.get(Number(parent.id)) || 'guardian';
    }
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    // Update basic fields
    Object.assign(student, updateStudentDto);
    Object.assign(student, applyBilingualName({ ...student, ...updateStudentDto }));

    // Update user if provided
    if (updateStudentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateStudentDto.userId }
      });
      if (user) {
        student.user = user;
      }
    }

    // Update parents if provided
    if (updateStudentDto.parentIds) {
      if (updateStudentDto.parentIds.length > 0) {
        const parents = await this.parentRepository.findByIds(updateStudentDto.parentIds);
        student.parents = parents;
      } else {
        student.parents = [];
      }
    }

    return this.studentRepository.save(student);
  }

  async remove(id: string): Promise<void> {
    const student = await this.findOne(id);
    await this.studentRepository.remove(student);
  }

  async findByGroup(groupId: string, schoolId?: string | null): Promise<Student[]> {
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
    return sanitizeUserDeep(await qb.getMany());
  }

  async findByBus(busId: string, schoolId?: string | null): Promise<Student[]> {
    const qb = this.studentRepository
      .createQueryBuilder('student')
      .where(
        `EXISTS (SELECT 1 FROM student_buses sb WHERE sb.student_id = student.id AND sb.bus_id = :busId)`,
        { busId },
      )
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parents', 'parents')
      .leftJoinAndSelect('student.groups', 'groups')
      .leftJoinAndSelect('student.buses', 'buses')
      .orderBy('student.lastName', 'ASC')
      .addOrderBy('student.firstName', 'ASC');
    if (schoolId != null) {
      qb.andWhere('student.school_id = :schoolId', { schoolId });
    }
    return sanitizeUserDeep(await qb.getMany());
  }

  async findByParent(parentId: string, schoolId?: string | null): Promise<Student[]> {
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
    return sanitizeUserDeep(await qb.getMany());
  }

  async searchStudents(query: string, schoolId?: string | null): Promise<Student[]> {
    const qb = this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parents', 'parents')
      .where(
        '(student.firstName ILIKE :query OR student.lastName ILIKE :query OR student.first_name_ar ILIKE :query OR student.first_name_en ILIKE :query OR student.last_name_ar ILIKE :query OR student.last_name_en ILIKE :query OR student.email ILIKE :query OR student.phone ILIKE :query)',
        { query: `%${query}%` },
      );
    if (schoolId != null) {
      qb.andWhere('student.school_id = :schoolId', { schoolId });
    }
    return sanitizeUserDeep(await qb.getMany());
  }

  async getStudentProgress(studentId: string): Promise<Student | null> {
    return this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['progress', 'progress.milestone', 'progress.milestone.phase', 'progress.milestone.phase.course']
    });
  }

  async assignToGroup(
    studentId: string,
    groupId: string,
    options?: { paymentLevelId?: string | null; replaceExistingGroups?: boolean },
  ): Promise<Student> {
    const student = await this.findOne(studentId);
    const group = await this.groupRepository.findOne({ where: { id: groupId } });
    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    const paymentLevelId = options?.paymentLevelId ?? undefined;
    if (paymentLevelId) {
      if (!group.level_id || group.level_id !== paymentLevelId) {
        throw new BadRequestException('The selected group does not belong to this fee level');
      }
      student.payment_level_id = paymentLevelId;
    } else if (group.level_id) {
      student.payment_level_id = group.level_id;
    }

    if (options?.replaceExistingGroups) {
      const current = student.groups ?? [];
      for (const g of current) {
        await this.studentRepository.createQueryBuilder().relation(Student, 'groups').of(studentId).remove(g.id);
      }
    }

    await this.studentRepository.createQueryBuilder().relation(Student, 'groups').of(studentId).add(groupId);
    if (student.payment_level_id) {
      await this.studentRepository.update(studentId, {
        payment_level_id: student.payment_level_id,
      });
    }

    await this.studentPaymentService.ensureForStudent(studentId);
    return this.findOne(studentId);
  }

  async removeFromGroup(studentId: string, groupId: string): Promise<Student> {
    const student = await this.findOne(studentId);

    await this.studentRepository
      .createQueryBuilder()
      .relation(Student, 'groups')
      .of(studentId)
      .remove(groupId);

    // Return updated student with relations
    return this.findOne(studentId);
  }

  async assignToBus(studentId: string, busId: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id: studentId },
      relations: ['buses'],
    });
    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    const bus = await this.busRepository.findOne({
      where: { id: busId },
      relations: ['students'],
    });
    if (!bus) {
      throw new NotFoundException(`Bus with ID ${busId} not found`);
    }

    const currentIds = student.buses?.map((b) => b.id) ?? [];
    const alreadyOnThisBus = currentIds.includes(busId);

    if (alreadyOnThisBus && currentIds.length === 1) {
      return this.findOne(studentId);
    }

    if (!alreadyOnThisBus) {
      const count = bus.students?.length ?? 0;
      if (count >= bus.capacity) {
        throw new BadRequestException('This bus is at full capacity');
      }
    }

    const rel = this.studentRepository
      .createQueryBuilder()
      .relation(Student, 'buses')
      .of(studentId);

    if (currentIds.length > 0) {
      await rel.remove(currentIds);
    }
    await rel.add(busId);

    return this.findOne(studentId);
  }

  async removeFromBus(studentId: string, busId: string): Promise<Student> {
    const student = await this.findOne(studentId);
    if (!student.buses?.some((b) => b.id === busId)) {
      return student;
    }
    await this.studentRepository
      .createQueryBuilder()
      .relation(Student, 'buses')
      .of(studentId)
      .remove(busId);
    return this.findOne(studentId);
  }

  async findByBusWithPickup(
    busId: string,
    schoolId?: string | null,
  ): Promise<Array<Student & {
    pickup_lat?: number | null;
    pickup_lng?: number | null;
    pickup_source?: string | null;
    pickup_updated_at?: string | null;
  }>> {
    const students = await this.findByBus(busId, schoolId);
    const pickups = await this.listBusPickups(busId);
    return students.map((s) => {
      const p = pickups.get(s.id);
      return {
        ...s,
        pickup_lat: p?.pickup_lat ?? null,
        pickup_lng: p?.pickup_lng ?? null,
        pickup_source: p?.pickup_source ?? null,
        pickup_updated_at: p?.pickup_updated_at ?? null,
      };
    });
  }

  async listBusPickups(busId: string): Promise<
    Map<
      string,
      {
        pickup_lat: number | null;
        pickup_lng: number | null;
        pickup_source: string | null;
        pickup_updated_at: string | null;
      }
    >
  > {
    const rows: Array<{
      student_id: string;
      pickup_lat: string | number | null;
      pickup_lng: string | number | null;
      pickup_source: string | null;
      pickup_updated_at: Date | string | null;
    }> = await this.studentRepository.manager.query(
      `SELECT student_id, pickup_lat, pickup_lng, pickup_source, pickup_updated_at
       FROM student_buses WHERE bus_id = $1`,
      [busId],
    );
    const map = new Map<
      string,
      {
        pickup_lat: number | null;
        pickup_lng: number | null;
        pickup_source: string | null;
        pickup_updated_at: string | null;
      }
    >();
    for (const row of rows) {
      map.set(String(row.student_id), {
        pickup_lat: row.pickup_lat == null || row.pickup_lat === '' ? null : Number(row.pickup_lat),
        pickup_lng: row.pickup_lng == null || row.pickup_lng === '' ? null : Number(row.pickup_lng),
        pickup_source: row.pickup_source ?? null,
        pickup_updated_at: row.pickup_updated_at
          ? new Date(row.pickup_updated_at).toISOString()
          : null,
      });
    }
    return map;
  }

  async setBusPickup(
    studentId: string,
    busId: string,
    dto: {
      pickup_lat: number | null;
      pickup_lng: number | null;
      pickup_source?: string | null;
    },
  ): Promise<{
    student_id: string;
    bus_id: string;
    pickup_lat: number | null;
    pickup_lng: number | null;
    pickup_source: string | null;
    pickup_updated_at: string | null;
  }> {
    const student = await this.findOne(studentId);
    if (!student.buses?.some((b) => b.id === busId)) {
      throw new BadRequestException('Student is not assigned to this bus');
    }

    const clear = dto.pickup_lat == null || dto.pickup_lng == null;
    if (!clear) {
      const lat = Number(dto.pickup_lat);
      const lng = Number(dto.pickup_lng);
      if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        throw new BadRequestException('Invalid coordinates');
      }
      const source = (dto.pickup_source || 'staff').slice(0, 32);
      await this.studentRepository.manager.query(
        `UPDATE student_buses
         SET pickup_lat = $1, pickup_lng = $2, pickup_source = $3, pickup_updated_at = NOW()
         WHERE student_id = $4 AND bus_id = $5`,
        [lat, lng, source, studentId, busId],
      );
    } else {
      await this.studentRepository.manager.query(
        `UPDATE student_buses
         SET pickup_lat = NULL, pickup_lng = NULL, pickup_source = NULL, pickup_updated_at = NULL
         WHERE student_id = $1 AND bus_id = $2`,
        [studentId, busId],
      );
    }

    const pickups = await this.listBusPickups(busId);
    const p = pickups.get(studentId);
    return {
      student_id: studentId,
      bus_id: busId,
      pickup_lat: p?.pickup_lat ?? null,
      pickup_lng: p?.pickup_lng ?? null,
      pickup_source: p?.pickup_source ?? null,
      pickup_updated_at: p?.pickup_updated_at ?? null,
    };
  }

  /** Parent self: set pickup for a linked child on their current bus. */
  async setPickupAsParent(
    parentUserId: string,
    studentId: string,
    dto: { pickup_lat: number; pickup_lng: number },
  ) {
    const viaJoin: Array<{ ok: number }> = await this.studentRepository.manager.query(
      `SELECT 1 AS ok
       FROM student_parents sp
       INNER JOIN parents p ON p.id = sp.parent_id
       WHERE sp.student_id = $1 AND p.user_id = $2
       LIMIT 1`,
      [studentId, parentUserId],
    );
    if (!viaJoin.length) {
      throw new BadRequestException('Student is not linked to this parent');
    }
    const student = await this.findOne(studentId);
    const busId = student.buses?.[0]?.id;
    if (!busId) {
      throw new BadRequestException('Student is not assigned to a bus');
    }
    return this.setBusPickup(studentId, busId, {
      pickup_lat: dto.pickup_lat,
      pickup_lng: dto.pickup_lng,
      pickup_source: 'parent_share',
    });
  }
}

