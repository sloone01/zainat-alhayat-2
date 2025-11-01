import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Milestone } from '../entities/milestone.entity';
import { Phase } from '../entities/phase.entity';

export interface CreateMilestoneDto {
  name: string;
  description?: string;
  order: number;
  phaseId: string;
  isRequired?: boolean;
  points?: number;
}

export interface UpdateMilestoneDto {
  name?: string;
  description?: string;
  order?: number;
  phaseId?: string;
  isRequired?: boolean;
  points?: number;
}

@Injectable()
export class MilestoneService {
  constructor(
    @InjectRepository(Milestone)
    private milestoneRepository: Repository<Milestone>,
    @InjectRepository(Phase)
    private phaseRepository: Repository<Phase>,
  ) {}

  async create(createMilestoneDto: CreateMilestoneDto): Promise<Milestone> {
    const phase = await this.phaseRepository.findOne({
      where: { id: createMilestoneDto.phaseId }
    });

    if (!phase) {
      throw new NotFoundException(`Phase with ID ${createMilestoneDto.phaseId} not found`);
    }

    const milestone = this.milestoneRepository.create({
      ...createMilestoneDto,
      phase
    });

    return this.milestoneRepository.save(milestone);
  }

  async findAll(): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      relations: ['phase', 'phase.course', 'progress'],
      order: { order: 'ASC' }
    });
  }

  async findOne(id: string): Promise<Milestone> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id },
      relations: ['phase', 'phase.course', 'progress']
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${id} not found`);
    }

    return milestone;
  }

  async findByPhase(phaseId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { phase: { id: phaseId } },
      relations: ['progress'],
      order: { order: 'ASC' }
    });
  }

  async findByCourse(courseId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { phase: { course: { id: courseId } } },
      relations: ['phase', 'progress'],
      order: { phase: { order: 'ASC' }, order: 'ASC' }
    });
  }

  async update(id: string, updateMilestoneDto: UpdateMilestoneDto): Promise<Milestone> {
    const milestone = await this.findOne(id);

    if (updateMilestoneDto.phaseId) {
      const phase = await this.phaseRepository.findOne({
        where: { id: updateMilestoneDto.phaseId }
      });

      if (!phase) {
        throw new NotFoundException(`Phase with ID ${updateMilestoneDto.phaseId} not found`);
      }

      milestone.phase = phase;
    }

    Object.assign(milestone, updateMilestoneDto);
    return this.milestoneRepository.save(milestone);
  }

  async remove(id: string): Promise<void> {
    const milestone = await this.findOne(id);
    await this.milestoneRepository.remove(milestone);
  }

  async reorderMilestones(phaseId: string, milestoneOrders: { id: string; order: number }[]): Promise<Milestone[]> {
    const milestones = await this.findByPhase(phaseId);
    
    for (const milestoneOrder of milestoneOrders) {
      const milestone = milestones.find(m => m.id === milestoneOrder.id);
      if (milestone) {
        milestone.order = milestoneOrder.order;
        await this.milestoneRepository.save(milestone);
      }
    }

    return this.findByPhase(phaseId);
  }

  async getNextOrder(phaseId: string): Promise<number> {
    const lastMilestone = await this.milestoneRepository.findOne({
      where: { phase: { id: phaseId } },
      order: { order: 'DESC' }
    });

    return lastMilestone ? lastMilestone.order + 1 : 1;
  }

  async duplicateMilestone(id: string, newName?: string): Promise<Milestone> {
    const originalMilestone = await this.findOne(id);
    
    const newOrder = await this.getNextOrder(originalMilestone.phase.id);
    
    const duplicatedMilestone = this.milestoneRepository.create({
      name: newName || `${originalMilestone.name} (Copy)`,
      description: originalMilestone.description,
      order: newOrder,
      isRequired: originalMilestone.isRequired,
      points: originalMilestone.points,
      phase: originalMilestone.phase
    });

    return this.milestoneRepository.save(duplicatedMilestone);
  }

  async getRequiredMilestones(phaseId: string): Promise<Milestone[]> {
    return this.milestoneRepository.find({
      where: { 
        phase: { id: phaseId },
        isRequired: true 
      },
      order: { order: 'ASC' }
    });
  }

  async getMilestoneStats(milestoneId: string): Promise<{
    totalStudents: number;
    completedStudents: number;
    completionRate: number;
  }> {
    const milestone = await this.milestoneRepository.findOne({
      where: { id: milestoneId },
      relations: ['progress', 'progress.student']
    });

    if (!milestone) {
      throw new NotFoundException(`Milestone with ID ${milestoneId} not found`);
    }

    const totalStudents = milestone.progress.length;
    const completedStudents = milestone.progress.filter(p => p.status === 'completed').length;
    const completionRate = totalStudents > 0 ? (completedStudents / totalStudents) * 100 : 0;

    return {
      totalStudents,
      completedStudents,
      completionRate: Math.round(completionRate * 100) / 100
    };
  }
}

