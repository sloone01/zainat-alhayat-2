import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WeeklySessionPlan } from '../entities/weekly-session-plan.entity';
import { Schedule } from '../entities/schedule.entity';

export interface CreateWeeklySessionPlanDto {
  groupId: string;
  scheduleId?: string; // Optional - if provided, use this specific schedule
  weekStartDate: string; // YYYY-MM-DD format
  title: string;
  description?: string;
  objectives?: string[];
  activities?: Array<{
    day: string;
    title: string;
    description: string;
    duration: number;
    materials: string[];
  }>;
  notes?: string;
  created_by: string;
}

export interface UpdateWeeklySessionPlanDto {
  task_title?: string;
  task_description?: string;
  is_completed?: boolean;
  completion_notes?: string;
  session_status?: string;
  completion_description?: string;
  completed_by?: string;
  completed_at?: Date | null;
}

@Injectable()
export class WeeklySessionPlanService {
  constructor(
    @InjectRepository(WeeklySessionPlan)
    private weeklySessionPlanRepository: Repository<WeeklySessionPlan>,
    @InjectRepository(Schedule)
    private scheduleRepository: Repository<Schedule>,
  ) {}

  // Helper function to calculate week end date from start date
  private calculateWeekEndDate(weekStartDate: Date): Date {
    const endDate = new Date(weekStartDate);
    endDate.setDate(endDate.getDate() + 6); // Add 6 days to get end of week
    return endDate;
  }

  // Helper function to get week start date (Sunday) from any date
  private getWeekStartDate(date: Date): Date {
    const startDate = new Date(date);
    const dayOfWeek = startDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
    startDate.setDate(startDate.getDate() - dayOfWeek); // Go back to Sunday
    return startDate;
  }

  // Helper function to build comprehensive description from DTO
  private buildFullDescription(createDto: CreateWeeklySessionPlanDto): string {
    let description = createDto.description || '';

    if (createDto.objectives && createDto.objectives.length > 0) {
      description += '\n\nObjectives:\n' + createDto.objectives.map(obj => `• ${obj}`).join('\n');
    }

    if (createDto.activities && createDto.activities.length > 0) {
      description += '\n\nActivities:\n';
      createDto.activities.forEach(activity => {
        description += `\n${activity.day}: ${activity.title}\n`;
        description += `  Description: ${activity.description}\n`;
        description += `  Duration: ${activity.duration} minutes\n`;
        if (activity.materials && activity.materials.length > 0) {
          description += `  Materials: ${activity.materials.join(', ')}\n`;
        }
      });
    }

    if (createDto.notes) {
      description += '\n\nNotes:\n' + createDto.notes;
    }

    return description.trim();
  }

  async createWeeklySessionPlan(createDto: CreateWeeklySessionPlanDto): Promise<WeeklySessionPlan> {
    let schedule;

    // If scheduleId is provided, use that specific schedule
    if (createDto.scheduleId) {
      schedule = await this.scheduleRepository.findOne({
        where: { id: createDto.scheduleId }
      });

      if (!schedule) {
        throw new NotFoundException(`Schedule with ID ${createDto.scheduleId} not found`);
      }
    } else {
      // Fallback: Find a schedule for the group (use the first one found)
      schedule = await this.scheduleRepository.findOne({
        where: { group_id: createDto.groupId }
      });

      if (!schedule) {
        throw new NotFoundException('No schedule found for this group');
      }
    }

    // Parse and validate week start date
    const weekStartDate = new Date(createDto.weekStartDate + 'T00:00:00.000Z');
    if (isNaN(weekStartDate.getTime())) {
      throw new BadRequestException(`Invalid week start date format. Received: ${createDto.weekStartDate}. Expected YYYY-MM-DD format.`);
    }

    // Ensure it's a Sunday (week start)
    const actualWeekStart = this.getWeekStartDate(weekStartDate);
    const weekEndDate = this.calculateWeekEndDate(actualWeekStart);

    // Note: We allow multiple tasks per schedule per week, so we don't check for existing plans
    // This enables users to create multiple tasks for the same session

    // Combine all the information into a comprehensive description
    const fullDescription = this.buildFullDescription(createDto);

    const weeklySessionPlan = this.weeklySessionPlanRepository.create({
      schedule_id: schedule.id,
      week_start_date: actualWeekStart,
      week_end_date: weekEndDate,
      task_title: createDto.title,
      task_description: fullDescription,
      created_by: createDto.created_by,
    });

    return await this.weeklySessionPlanRepository.save(weeklySessionPlan);
  }

  async getWeeklySessionPlans(
    groupId?: string,
    weekStartDate?: string,
    scheduleId?: string
  ): Promise<WeeklySessionPlan[]> {
    const queryBuilder = this.weeklySessionPlanRepository
      .createQueryBuilder('wsp')
      .leftJoinAndSelect('wsp.schedule', 'schedule')
      .leftJoinAndSelect('schedule.group', 'group')
      .leftJoinAndSelect('schedule.course', 'course')
      .leftJoinAndSelect('schedule.teacher', 'teacher')
      .leftJoinAndSelect('wsp.createdBy', 'createdBy')
      .leftJoinAndSelect('wsp.media', 'media');

    if (groupId) {
      queryBuilder.andWhere('schedule.group_id = :groupId', { groupId });
    }

    if (scheduleId) {
      queryBuilder.andWhere('wsp.schedule_id = :scheduleId', { scheduleId });
    }

    if (weekStartDate) {
      const weekStart = new Date(weekStartDate);
      const actualWeekStart = this.getWeekStartDate(weekStart);
      queryBuilder.andWhere('wsp.week_start_date = :weekStartDate', { 
        weekStartDate: actualWeekStart 
      });
    }

    queryBuilder.orderBy('wsp.week_start_date', 'DESC')
      .addOrderBy('schedule.day_of_week', 'ASC')
      .addOrderBy('schedule.start_time', 'ASC');

    return await queryBuilder.getMany();
  }

  async getWeeklySessionPlanById(id: string): Promise<WeeklySessionPlan> {
    const plan = await this.weeklySessionPlanRepository.findOne({
      where: { id },
      relations: ['schedule', 'schedule.group', 'schedule.course', 'schedule.teacher', 'createdBy', 'media']
    });

    if (!plan) {
      throw new NotFoundException('Weekly session plan not found');
    }

    return plan;
  }

  async updateWeeklySessionPlan(
    id: string, 
    updateDto: UpdateWeeklySessionPlanDto
  ): Promise<WeeklySessionPlan> {
    const plan = await this.getWeeklySessionPlanById(id);

    // If marking as completed, set completion date
    if (updateDto.is_completed === true && !plan.is_completed) {
      updateDto['completion_date'] = new Date();
    }

    // If marking as not completed, clear completion date and notes
    if (updateDto.is_completed === false) {
      updateDto['completion_date'] = null;
      updateDto.completion_notes = undefined;
    }

    Object.assign(plan, updateDto);
    return await this.weeklySessionPlanRepository.save(plan);
  }

  async deleteWeeklySessionPlan(id: string): Promise<void> {
    const plan = await this.getWeeklySessionPlanById(id);
    await this.weeklySessionPlanRepository.remove(plan);
  }

  // Get all schedules for a group with their weekly plans for a specific week
  async getGroupWeeklyPlanning(groupId: string, weekStartDate: string) {
    const weekStart = new Date(weekStartDate);
    const actualWeekStart = this.getWeekStartDate(weekStart);

    // Get all schedules for the group
    const schedules = await this.scheduleRepository.find({
      where: { group_id: groupId, status: 'active' },
      relations: ['course', 'teacher', 'group'],
      order: { day_of_week: 'ASC', start_time: 'ASC' }
    });

    // Get weekly plans for this week
    const weeklyPlans = await this.getWeeklySessionPlans(groupId, weekStartDate);

    // Map schedules with their weekly plans
    const schedulesWithPlans = schedules.map(schedule => {
      const weeklyPlan = weeklyPlans.find(plan => plan.schedule_id === schedule.id);
      return {
        ...schedule,
        weeklyPlan: weeklyPlan || null
      };
    });

    return {
      week_start_date: actualWeekStart,
      week_end_date: this.calculateWeekEndDate(actualWeekStart),
      schedules: schedulesWithPlans
    };
  }

  // Copy plans from previous week
  async copyFromPreviousWeek(groupId: string | undefined, currentWeekStart: string, createdBy: string) {
    const currentWeek = new Date(currentWeekStart + 'T00:00:00.000Z');
    const actualCurrentWeek = this.getWeekStartDate(currentWeek);
    
    // Calculate previous week
    const previousWeek = new Date(actualCurrentWeek);
    previousWeek.setDate(previousWeek.getDate() - 7);

    // Get previous week's plans
    const previousPlans = await this.getWeeklySessionPlans(groupId || undefined, previousWeek.toISOString().split('T')[0]);

    const newPlans: WeeklySessionPlan[] = [];
    for (const prevPlan of previousPlans) {
      try {
        // Find the group for this schedule
        const schedule = await this.scheduleRepository.findOne({
          where: { id: prevPlan.schedule_id },
          relations: ['group']
        });

        if (schedule) {
          const newPlan = await this.createWeeklySessionPlan({
            groupId: schedule.group_id,
            weekStartDate: actualCurrentWeek.toISOString().split('T')[0],
            title: prevPlan.task_title,
            description: prevPlan.task_description,
            created_by: createdBy
          });
          newPlans.push(newPlan);
        }
      } catch (error) {
        // Skip if plan already exists
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
    }

    return newPlans;
  }

  // Update task status (treating each WeeklySessionPlan as a task)
  async updateTaskStatus(taskId: string, status: string): Promise<WeeklySessionPlan> {
    const plan = await this.getWeeklySessionPlanById(taskId);

    // Map status to is_completed boolean
    const isCompleted = status === 'completed';

    const updateData: UpdateWeeklySessionPlanDto = {
      is_completed: isCompleted
    };

    // Set completion date if marking as completed
    if (isCompleted && !plan.is_completed) {
      updateData['completion_date'] = new Date();
    }

    // Clear completion date if marking as not completed
    if (!isCompleted && plan.is_completed) {
      updateData['completion_date'] = null;
    }

    return await this.updateWeeklySessionPlan(taskId, updateData);
  }

  // Session completion methods
  async completeSession(planId: string, data: {
    completion_description: string;
    completed_by: string;
  }): Promise<WeeklySessionPlan> {
    const updateData: UpdateWeeklySessionPlanDto = {
      session_status: 'completed',
      completion_description: data.completion_description,
      completed_by: data.completed_by,
      completed_at: new Date(),
      is_completed: true
    };

    return await this.updateWeeklySessionPlan(planId, updateData);
  }

  async updateSessionStatus(planId: string, status: string, data?: {
    completion_description?: string;
    completed_by?: string;
  }): Promise<WeeklySessionPlan> {
    const updateData: UpdateWeeklySessionPlanDto = {
      session_status: status
    };

    if (data?.completion_description) {
      updateData.completion_description = data.completion_description;
    }

    if (data?.completed_by) {
      updateData.completed_by = data.completed_by;
    }

    if (status === 'completed') {
      updateData.completed_at = new Date();
      updateData.is_completed = true;
    } else if (status === 'pending') {
      updateData.completed_at = null;
      updateData.is_completed = false;
    }

    return await this.updateWeeklySessionPlan(planId, updateData);
  }
}
