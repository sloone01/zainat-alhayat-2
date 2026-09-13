import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Phase } from '../entities/phase.entity';
import { Course } from '../entities/course.entity';
import { Milestone } from '../entities/milestone.entity';
import { StudentProgress } from '../entities/student-progress.entity';

export interface CreatePhaseDto {
  name: string;
  description?: string;
  order: number;
  courseId: string;
  duration_weeks?: number;
}

export interface UpdatePhaseDto {
  name?: string;
  description?: string;
  order?: number;
  courseId?: string;
  duration_weeks?: number;
}

@Injectable()
export class PhaseService {
  constructor(
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(StudentProgress)
    private progressRepository: Repository<StudentProgress>,
  ) {}

  private assertPhaseCapable(course: Course) {
    const kind = course.course_kind || 'milestone';
    if (kind === 'graded') {
      throw new BadRequestException(
        'Graded courses use assessment criteria, not phases. Use milestone or standalone courses for phases.',
      );
    }
  }

  async create(createPhaseDto: CreatePhaseDto): Promise<Phase> {
    const course = await this.courseRepository.findOne({
      where: { id: createPhaseDto.courseId }
    });

    if (!course) {
      throw new NotFoundException(`Course with ID ${createPhaseDto.courseId} not found`);
    }
    this.assertPhaseCapable(course);

    const { courseId: _courseId, ...rest } = createPhaseDto;
    const phase = this.phaseRepository.create({
      ...rest,
      course,
    });

    return this.phaseRepository.save(phase);
  }

  async findAll(schoolId?: string | null): Promise<Phase[]> {
    // phases carry no school_id; the course they belong to does.
    return this.phaseRepository.find({
      where: schoolId == null ? {} : { course: { school_id: schoolId } },
      relations: ['course', 'milestones'],
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string, schoolId?: string | null): Promise<Phase> {
    const phase = await this.phaseRepository.findOne({
      where: schoolId == null ? { id } : { id, course: { school_id: schoolId } },
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

  async update(
    id: string,
    updatePhaseDto: UpdatePhaseDto,
    schoolId?: string | null,
  ): Promise<Phase> {
    const phase = await this.findOne(id, schoolId);

    if (updatePhaseDto.courseId) {
      const course = await this.courseRepository.findOne({
        where: { id: updatePhaseDto.courseId }
      });

      if (!course) {
        throw new NotFoundException(`Course with ID ${updatePhaseDto.courseId} not found`);
      }
      this.assertPhaseCapable(course);

      phase.course = course;
    }

    const { courseId: _courseId, ...rest } = updatePhaseDto;
    Object.assign(phase, rest);
    return this.phaseRepository.save(phase);
  }

  async remove(id: string, schoolId?: string | null): Promise<void> {
    const phase = await this.findOne(id, schoolId);
    const milestones = await this.milestoneRepository.find({
      where: { phase_id: id },
      select: ['id'],
    });
    const milestoneIds = milestones.map((m) => m.id);
    if (milestoneIds.length) {
      await this.progressRepository.delete({ milestone_id: In(milestoneIds) });
      await this.milestoneRepository.delete({ id: In(milestoneIds) });
    }
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

