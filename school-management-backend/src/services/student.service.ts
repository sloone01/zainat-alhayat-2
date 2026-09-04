import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { Parent } from '../entities/parent.entity';
import { Bus } from '../entities/bus.entity';
import { Group } from '../entities/group.entity';
import { StudentPaymentService } from './student-payment.service';

export interface CreateStudentDto {
  firstName: string;
  lastName: string;
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
  school_id?: number;
  payment_level_id?: string | null;
}

export interface UpdateStudentDto {
  firstName?: string;
  lastName?: string;
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
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
    if (!createStudentDto.payment_level_id?.trim()) {
      throw new BadRequestException(
        'Grade (payment level) is required when registering a student',
      );
    }

    const student = this.studentRepository.create(createStudentDto);

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

  async findAll(): Promise<Student[]> {
    return this.studentRepository.find({
      relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'parents', 'groups', 'groups.level', 'buses', 'attendances', 'progress', 'paymentLevel'],
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }

  async update(id: string, updateStudentDto: UpdateStudentDto): Promise<Student> {
    const student = await this.findOne(id);

    // Update basic fields
    Object.assign(student, updateStudentDto);

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

  async findByGroup(groupId: string): Promise<Student[]> {
    return this.studentRepository.find({
      where: {
        groups: {
          id: groupId
        }
      },
      relations: ['user', 'parents', 'groups', 'buses']
    });
  }

  async findByBus(busId: string): Promise<Student[]> {
    return this.studentRepository
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
      .addOrderBy('student.firstName', 'ASC')
      .getMany();
  }

  async findByParent(parentId: number): Promise<Student[]> {
    return this.studentRepository.find({
      where: {
        parents: {
          id: parentId
        }
      },
      relations: ['user', 'parents', 'groups', 'buses']
    });
  }

  async searchStudents(query: string): Promise<Student[]> {
    return this.studentRepository
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.user', 'user')
      .leftJoinAndSelect('student.parents', 'parents')
      .where('student.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('student.lastName ILIKE :query', { query: `%${query}%` })
      .orWhere('student.email ILIKE :query', { query: `%${query}%` })
      .orWhere('student.phone ILIKE :query', { query: `%${query}%` })
      .getMany();
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
    await this.studentRepository.save(student);

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
}

