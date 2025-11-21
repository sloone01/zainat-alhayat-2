import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
  BadRequestException
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { WeeklySessionPlanService } from '../services/weekly-session-plan.service';
import type { CreateWeeklySessionPlanDto, UpdateWeeklySessionPlanDto } from '../services/weekly-session-plan.service';

@Controller('weekly-session-plans')
@UseGuards(JwtAuthGuard)
export class WeeklySessionPlanController {
  constructor(private readonly weeklySessionPlanService: WeeklySessionPlanService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createWeeklySessionPlan(
    @Body() createDto: Omit<CreateWeeklySessionPlanDto, 'created_by'>,
    @Request() req: any
  ) {
    try {
      const plan = await this.weeklySessionPlanService.createWeeklySessionPlan({
        ...createDto,
        created_by: req.user?.id || 'e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5' // Use admin user ID as fallback
      });

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan created successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get()
  async getWeeklySessionPlans(
    @Query('group_id') groupId?: string,
    @Query('week_start_date') weekStartDate?: string,
    @Query('schedule_id') scheduleId?: string
  ) {
    try {
      const plans = await this.weeklySessionPlanService.getWeeklySessionPlans(
        groupId,
        weekStartDate,
        scheduleId
      );

      return {
        success: true,
        data: plans,
        count: plans.length,
        message: 'Weekly session plans retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get('group/:groupId/week/:weekStartDate')
  async getGroupWeeklyPlanning(
    @Param('groupId') groupId: string,
    @Param('weekStartDate') weekStartDate: string
  ) {
    try {
      const planning = await this.weeklySessionPlanService.getGroupWeeklyPlanning(
        groupId,
        weekStartDate
      );

      return {
        success: true,
        data: planning,
        message: 'Group weekly planning retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id')
  async getWeeklySessionPlanById(@Param('id') id: string) {
    try {
      const plan = await this.weeklySessionPlanService.getWeeklySessionPlanById(id);

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan retrieved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Put(':id')
  async updateWeeklySessionPlan(
    @Param('id') id: string,
    @Body() updateDto: UpdateWeeklySessionPlanDto
  ) {
    try {
      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, updateDto);

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Put(':id/complete')
  async markSessionComplete(
    @Param('id') id: string,
    @Body() body: { completion_notes?: string }
  ) {
    try {
      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
        is_completed: true,
        completion_notes: body.completion_notes
      });

      return {
        success: true,
        data: plan,
        message: 'Session marked as completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Put(':id/incomplete')
  async markSessionIncomplete(@Param('id') id: string) {
    try {
      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
        is_completed: false,
        completion_notes: undefined
      });

      return {
        success: true,
        data: plan,
        message: 'Session marked as incomplete successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Delete(':id')
  async deleteWeeklySessionPlan(@Param('id') id: string) {
    try {
      await this.weeklySessionPlanService.deleteWeeklySessionPlan(id);

      return {
        success: true,
        message: 'Weekly session plan deleted successfully',
        data: null
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
        error: error.name
      });
    }
  }

  @Post('copy-from-previous-week')
  async copyFromPreviousWeek(
    @Body() body: { currentWeekStartDate: string },
    @Request() req: any
  ) {
    try {
      const newPlans = await this.weeklySessionPlanService.copyFromPreviousWeek(
        undefined, // Copy for all groups
        body.currentWeekStartDate,
        req.user?.id || 'e9ec7b64-edf0-4acb-8ab7-f76522a9a4a5' // Use admin user ID as fallback
      );

      return {
        success: true,
        data: newPlans,
        count: newPlans.length,
        message: `Copied ${newPlans.length} plans from previous week`
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Put('tasks/:taskId')
  async updateTaskStatus(
    @Param('taskId') taskId: string,
    @Body() body: { status: string; updated_by?: number }
  ) {
    try {
      const plan = await this.weeklySessionPlanService.updateTaskStatus(taskId, body.status);

      return {
        success: true,
        data: {
          id: plan.id,
          title: plan.task_title,
          description: plan.task_description,
          status: plan.is_completed ? 'completed' : 'pending',
          created_at: plan.created_at,
          updated_at: plan.updated_at
        },
        message: 'Task status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':planId/complete')
  async completeSession(
    @Param('planId') planId: string,
    @Body() body: { completion_description: string; completed_by: string }
  ) {
    try {
      const plan = await this.weeklySessionPlanService.completeSession(planId, body);

      return {
        success: true,
        data: plan,
        message: 'Session completed successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':planId/status')
  async updateSessionStatus(
    @Param('planId') planId: string,
    @Body() body: {
      session_status: string;
      completion_description?: string;
      completed_by?: string
    }
  ) {
    try {
      const plan = await this.weeklySessionPlanService.updateSessionStatus(
        planId,
        body.session_status,
        {
          completion_description: body.completion_description,
          completed_by: body.completed_by
        }
      );

      return {
        success: true,
        data: plan,
        message: 'Session status updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }
}
