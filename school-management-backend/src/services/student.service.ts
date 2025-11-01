import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { Parent } from '../entities/parent.entity';

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
  ) {}

  async create(createStudentDto: CreateStudentDto): Promise<Student> {
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
      relations: ['user', 'parents', 'groups', 'attendances', 'progress']
    });
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.studentRepository.findOne({
      where: { id },
      relations: ['user', 'parents', 'groups', 'attendances', 'progress']
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
      relations: ['user', 'parents', 'groups']
    });
  }

  async findByParent(parentId: number): Promise<Student[]> {
    return this.studentRepository.find({
      where: {
        parents: {
          id: parentId
        }
      },
      relations: ['user', 'parents', 'groups']
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

  async assignToGroup(studentId: string, groupId: string): Promise<Student> {
    const student = await this.findOne(studentId);

    // Import Group entity at the top and inject Group repository if needed
    // For now, we'll use raw query builder to add the relationship

    await this.studentRepository
      .createQueryBuilder()
      .relation(Student, 'groups')
      .of(studentId)
      .add(groupId);

    // Return updated student with relations
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
}

