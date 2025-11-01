import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Phase } from '../entities/phase.entity';
import { Course } from '../entities/course.entity';

export interface CreatePhaseDto {
  name: string;
  description?: string;
  order: number;
  courseId: string;
}

export interface UpdatePhaseDto {
  name?: string;
  description?: string;
  order?: number;
  courseId?: string;
}

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
  ) {}

  async create(createPhaseDto: CreatePhaseDto): Promise<Phase> {
    const course = await this.courseRepository.findOne({
      where: { id: createPhaseDto.courseId }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createPhaseDto.courseId} not found`);
    }

    const phase = this.phaseRepository.create({
      ...createPhaseDto,
      course
    });

    return this.phaseRepository.save(phase);
  }

  async findAll(): Promise<Phase[]> {
    return this.phaseRepository.find({
      relations: ['course', 'milestones'],
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Phase> {
    const phase = await this.phaseRepository.findOne({
      where: { id },
      relations: ['course', 'milestones']
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${id} not found`);
    }

    return phase;
  }

  async findByCourse(courseId: string): Promise<Phase[]> {
    return this.phaseRepository.find({
      where: { course: { id: courseId } },
      relations: ['milestones'],
      order: { order: 'ASC' }
    });
  }

  async update(id: string, updatePhaseDto: UpdatePhaseDto): Promise<Phase> {
    const phase = await this.findOne(id);

    if (updatePhaseDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updatePhaseDto.courseId }
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${updatePhaseDto.courseId} not found`);
      }

      phase.course = course;
    }

    Object.assign(phase, updatePhaseDto);
    return this.phaseRepository.save(phase);
  }

  async remove(id: string): Promise<void> {
    const phase = await this.findOne(id);
    await this.phaseRepository.remove(phase);
  }

  async reorderPhases(courseId: string, phaseOrders: { id: string; order: number }[]): Promise<Phase[]> {
    const phases = await this.findByCourse(courseId);
    
    for (const phaseOrder of phaseOrders) {
      const phase = phases.find(p => p.id === phaseOrder.id);
      if (phase) {
        phase.order = phaseOrder.order;
        await this.phaseRepository.save(phase);
      }
    }

    return this.findByCourse(courseId);
  }

  async getNextOrder(courseId: string): Promise<number> {
    const lastPhase = await this.phaseRepository.findOne({
      where: { course: { id: courseId } },
      order: { order: 'DESC' }
    });

    return lastPhase ? lastPhase.order + 1 : 1;
  }

  async duplicatePhase(id: string, newName?: string): Promise<Phase> {
    const originalPhase = await this.findOne(id);
    
    const newOrder = await this.getNextOrder(originalPhase.course.id);
    
    const duplicatedPhase = this.phaseRepository.create({
      name: newName || `${originalPhase.name} (Copy)`,
      description: originalPhase.description,
      order: newOrder,
      course: originalPhase.course
    });

    return this.phaseRepository.save(duplicatedPhase);
  }

}

