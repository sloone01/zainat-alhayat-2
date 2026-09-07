import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { GradedCriterionTaskService } from '../services/graded-criterion-task.service';
import {
  AppendGradedCriterionTaskDto,
  PatchGradedCriterionTaskDto,
  SaveMarksGridDto,
  SyncGradedCriterionTasksDto,
} from '../dto/graded-criterion-task.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('graded-criterion-tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin', 'teacher')
export class GradedCriterionTaskController {
  constructor(private readonly taskService: GradedCriterionTaskService) {}

  private schoolOf(req: { user: User }, requested: number): number {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Get('eligible-courses')
  async eligibleCourses(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.getEligibleGradedCoursesForTeacher(
      teacherId,
      schoolId,
    );
    return { success: true, data, count: data.length };
  }

  @Get('marks-grid')
  async marksGrid(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('group_id', ParseUUIDPipe) groupId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
    @Query('graded_criterion_id', ParseUUIDPipe) criterionId: string,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.getMarksGrid(
      teacherId,
      schoolId,
      groupId,
      courseId,
      criterionId,
    );
    return { success: true, data };
  }

  @Get('courses/:courseId/summary')
  async summary(
    @Request() req: { user: User },
    @Param('courseId', ParseUUIDPipe) courseId: string,
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.getCourseTaskSummary(
      courseId,
      schoolId,
      teacherId,
    );
    return { success: true, data };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async append(
    @Request() req: { user: User },
    @Body() body: AppendGradedCriterionTaskDto,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.appendTask(teacherId, body);
    return { success: true, data, message: 'Task created' };
  }

  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async sync(
    @Request() req: { user: User },
    @Body() body: SyncGradedCriterionTasksDto,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.syncTasks(teacherId, body);
    return { success: true, data, message: 'Tasks synced' };
  }

  @Post('marks-grid')
  @HttpCode(HttpStatus.OK)
  async saveMarksGrid(
    @Request() req: { user: User },
    @Query('school_id', ParseIntPipe) requestedSchoolId: number,
    @Body() body: SaveMarksGridDto,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.saveMarksGrid(teacherId, schoolId, body);
    return { success: true, data, message: 'Marks saved' };
  }

  @Patch(':taskId')
  async patch(
    @Request() req: { user: User },
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Body() body: PatchGradedCriterionTaskDto,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    const data = await this.taskService.patchTask(teacherId, taskId, body);
    return { success: true, data, message: 'Task updated' };
  }

  @Delete(':taskId')
  async remove(
    @Request() req: { user: User },
    @Param('taskId', ParseUUIDPipe) taskId: string,
    @Query('for_teacher_id') forTeacherId?: string,
  ) {
    const teacherId = this.taskService.resolveTeacherId(req.user, forTeacherId);
    await this.taskService.deleteTask(teacherId, taskId);
    return { success: true, message: 'Task deleted' };
  }
}
