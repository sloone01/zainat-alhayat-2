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
  BadRequestException,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { WeeklySessionPlanService } from '../services/weekly-session-plan.service';
import type { CreateWeeklySessionPlanDto, UpdateWeeklySessionPlanDto } from '../services/weekly-session-plan.service';
import { GroupService } from '../services/group.service';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('weekly-session-plans')
@UseGuards(JwtAuthGuard)
@RequireAnyClaim(
  { page: 'weekly_session_plans', action: 'view' },
  { page: 'teacher_weekly_sessions', action: 'view' },
)
export class WeeklySessionPlanController {
  constructor(
    private readonly weeklySessionPlanService: WeeklySessionPlanService,
    private readonly groupService: GroupService,
  ) {}

  private schoolOf(req: { user: User }, requested?: number | null) {
    return resolveActorSchoolId(req.user, requested);
  }

  private async assertGroupSchool(user: User, groupId: string) {
    const group = await this.groupService.findOne(groupId);
    assertSameSchool(user, group.school_id);
    return group;
  }

  private async assertPlanSchool(user: User, planId: string) {
    const plan = await this.weeklySessionPlanService.getWeeklySessionPlanById(planId);
    assertSameSchool(user, plan.schedule?.group?.school_id);
    return plan;
  }

  @Post()
  @RequireClaim('weekly_session_plans', 'create')
  @HttpCode(HttpStatus.CREATED)
  async createWeeklySessionPlan(
    @Body() createDto: Omit<CreateWeeklySessionPlanDto, 'created_by'>,
    @Request() req: { user: User },
  ) {
    try {
      await this.assertGroupSchool(req.user, createDto.groupId);

      const plan = await this.weeklySessionPlanService.createWeeklySessionPlan({
        ...createDto,
        created_by: req.user.id,
      });

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan created successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get()
  async getWeeklySessionPlans(
    @Request() req: { user: User },
    @Query('group_id') groupId?: string,
    @Query('week_start_date') weekStartDate?: string,
    @Query('schedule_id') scheduleId?: string,
    @Query('school_id') schoolIdRaw?: string,
  ) {
    try {
      const requestedSchoolId = schoolIdRaw != null ? parseInt(schoolIdRaw, 10) : undefined;
      const schoolId = this.schoolOf(req, requestedSchoolId);

      if (groupId) {
        await this.assertGroupSchool(req.user, groupId);
      }

      const plans = await this.weeklySessionPlanService.getWeeklySessionPlans(
        groupId,
        weekStartDate,
        scheduleId,
        schoolId,
      );

      return {
        success: true,
        data: plans,
        count: plans.length,
        message: 'Weekly session plans retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get('group/:groupId/week/:weekStartDate')
  async getGroupWeeklyPlanning(
    @Request() req: { user: User },
    @Param('groupId') groupId: string,
    @Param('weekStartDate') weekStartDate: string,
  ) {
    try {
      await this.assertGroupSchool(req.user, groupId);

      const planning = await this.weeklySessionPlanService.getGroupWeeklyPlanning(
        groupId,
        weekStartDate,
      );

      return {
        success: true,
        data: planning,
        message: 'Group weekly planning retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get(':id')
  async getWeeklySessionPlanById(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    try {
      const plan = await this.assertPlanSchool(req.user, id);

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Put(':id')
  @RequireClaim('weekly_session_plans', 'edit')
  async updateWeeklySessionPlan(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateDto: UpdateWeeklySessionPlanDto,
  ) {
    try {
      await this.assertPlanSchool(req.user, id);

      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, updateDto);

      return {
        success: true,
        data: plan,
        message: 'Weekly session plan updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Put(':id/complete')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async markSessionComplete(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() body: { completion_notes?: string },
  ) {
    try {
      await this.assertPlanSchool(req.user, id);

      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
        is_completed: true,
        completion_notes: body.completion_notes,
      });

      return {
        success: true,
        data: plan,
        message: 'Session marked as completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Put(':id/incomplete')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async markSessionIncomplete(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    try {
      await this.assertPlanSchool(req.user, id);

      const plan = await this.weeklySessionPlanService.updateWeeklySessionPlan(id, {
        is_completed: false,
        completion_notes: undefined,
      });

      return {
        success: true,
        data: plan,
        message: 'Session marked as incomplete successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Delete(':id')
  @RequireClaim('weekly_session_plans', 'delete')
  async deleteWeeklySessionPlan(
    @Request() req: { user: User },
    @Param('id') id: string,
  ) {
    try {
      await this.assertPlanSchool(req.user, id);
      await this.weeklySessionPlanService.deleteWeeklySessionPlan(id);

      return {
        success: true,
        message: 'Weekly session plan deleted successfully',
        data: null,
      };
    } catch (error) {
      throw new BadRequestException({
        success: false,
        message: error.message,
        error: error.name,
      });
    }
  }

  @Post('copy-from-previous-week')
  @RequireClaim('weekly_session_plans', 'create')
  async copyFromPreviousWeek(
    @Body() body: { currentWeekStartDate: string; group_id?: string; school_id?: number },
    @Request() req: { user: User },
  ) {
    try {
      const schoolId = this.schoolOf(req, body.school_id);
      if (body.group_id) {
        await this.assertGroupSchool(req.user, body.group_id);
      }

      const newPlans = await this.weeklySessionPlanService.copyFromPreviousWeek(
        body.group_id,
        body.currentWeekStartDate,
        req.user.id,
        schoolId,
      );

      return {
        success: true,
        data: newPlans,
        count: newPlans.length,
        message: `Copied ${newPlans.length} plans from previous week`,
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Put('tasks/:taskId')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async updateTaskStatus(
    @Request() req: { user: User },
    @Param('taskId') taskId: string,
    @Body() body: { status: string },
  ) {
    try {
      await this.assertPlanSchool(req.user, taskId);

      const plan = await this.weeklySessionPlanService.updateTaskStatus(taskId, body.status);

      return {
        success: true,
        data: {
          id: plan.id,
          title: plan.task_title,
          description: plan.task_description,
          status: plan.is_completed ? 'completed' : 'pending',
          created_at: plan.created_at,
          updated_at: plan.updated_at,
        },
        message: 'Task status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':planId/complete')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async completeSession(
    @Request() req: { user: User },
    @Param('planId') planId: string,
    @Body() body: { completion_description: string },
  ) {
    try {
      await this.assertPlanSchool(req.user, planId);

      const plan = await this.weeklySessionPlanService.completeSession(planId, {
        completion_description: body.completion_description,
        completed_by: req.user.id,
      });

      return {
        success: true,
        data: plan,
        message: 'Session completed successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Patch(':planId/status')
  @RequireAnyClaim(
    { page: 'weekly_session_plans', action: 'edit' },
    { page: 'teacher_weekly_sessions', action: 'edit' },
  )
  async updateSessionStatus(
    @Request() req: { user: User },
    @Param('planId') planId: string,
    @Body() body: {
      session_status: string;
      completion_description?: string;
    },
  ) {
    try {
      await this.assertPlanSchool(req.user, planId);

      const plan = await this.weeklySessionPlanService.updateSessionStatus(
        planId,
        body.session_status,
        {
          completion_description: body.completion_description,
          completed_by: req.user.id,
        },
      );

      return {
        success: true,
        data: plan,
        message: 'Session status updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }
}
