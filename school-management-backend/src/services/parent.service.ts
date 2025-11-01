import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';

export interface CreateParentDto {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  userId?: number;
  studentIds?: number[];
}

export interface UpdateParentDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  userId?: number;
  studentIds?: number[];
}

@Injectable()
export class ParentService {
  constructor(
    @InjectRepository(Parent)
    private parentRepository: Repository<Parent>,
    @InjectRepository(Student)
    private studentRepository: Repository<Student>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createParentDto: CreateParentDto): Promise<Parent> {
    const parent = this.parentRepository.create(createParentDto);

    // Set user if provided
    if (createParentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: createParentDto.userId.toString() }
      });
      if (user) {
        parent.user = user;
      }
    }

    // Set students if provided
    if (createParentDto.studentIds && createParentDto.studentIds.length > 0) {
      const students = await this.studentRepository.findByIds(createParentDto.studentIds);
      parent.students = students;
    }

    return this.parentRepository.save(parent);
  }

  async findAll(): Promise<Parent[]> {
    return this.parentRepository.find({
      relations: ['user', 'students']
    });
  }

  async findOne(id: number): Promise<Parent> {
    const parent = await this.parentRepository.findOne({
      where: { id },
      relations: ['user', 'students']
    });

    if (!parent) {
      throw new NotFoundException(`Parent with ID ${id} not found`);
    }

    return parent;
  }

  async update(id: number, updateParentDto: UpdateParentDto): Promise<Parent> {
    const parent = await this.findOne(id);

    // Update basic fields
    Object.assign(parent, updateParentDto);

    // Update user if provided
    if (updateParentDto.userId) {
      const user = await this.userRepository.findOne({
        where: { id: updateParentDto.userId.toString() }
      });
      if (user) {
        parent.user = user;
      }
    }

    // Update students if provided
    if (updateParentDto.studentIds) {
      if (updateParentDto.studentIds.length > 0) {
        const students = await this.studentRepository.findByIds(updateParentDto.studentIds);
        parent.students = students;
      } else {
        parent.students = [];
      }
    }

    return this.parentRepository.save(parent);
  }

  async remove(id: number): Promise<void> {
    const parent = await this.findOne(id);
    await this.parentRepository.remove(parent);
  }

  async searchParents(query: string): Promise<Parent[]> {
    return this.parentRepository
      .createQueryBuilder('parent')
      .leftJoinAndSelect('parent.user', 'user')
      .leftJoinAndSelect('parent.students', 'students')
      .where('parent.firstName ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.lastName ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.email ILIKE :query', { query: `%${query}%` })
      .orWhere('parent.phone ILIKE :query', { query: `%${query}%` })
      .getMany();
  }

  async assignToStudent(parentId: number, studentId: string): Promise<Parent> {
    const parent = await this.findOne(parentId);
    const student = await this.studentRepository.findOne({ where: { id: studentId } });

    if (!student) {
      throw new NotFoundException(`Student with ID ${studentId} not found`);
    }

    // Use relation builder to add the relationship
    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .add(studentId);

    // Return updated parent with relations
    return this.findOne(parentId);
  }

  async removeFromStudent(parentId: number, studentId: string): Promise<Parent> {
    const parent = await this.findOne(parentId);

    await this.parentRepository
      .createQueryBuilder()
      .relation(Parent, 'students')
      .of(parentId)
      .remove(studentId);

    // Return updated parent with relations
    return this.findOne(parentId);
  }
}