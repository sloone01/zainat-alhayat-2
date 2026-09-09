import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { ScheduleService } from '../services/schedule.service';
import type { UpdateScheduleDto } from '../services/schedule.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import { CreateScheduleDto } from '../dto/create-core-records.dto';

@Controller('schedules')
@RequireClaim('schedules', 'view')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @RequireClaim('schedules', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return {
      success: true,
      data: await this.scheduleService.create(createScheduleDto),
      message: 'Schedule created successfully',
    };
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    return {
      success: true,
      data: await this.scheduleService.findAll(this.schoolOf(req)),
      message: 'Schedules retrieved successfully',
    };
  }

  @Get('group/:groupId')
  async findByGroup(@Param('groupId') groupId: string) {
    return {
      success: true,
      data: await this.scheduleService.findByGroup(groupId),
      message: 'Group schedules retrieved successfully',
    };
  }

  @Get('teacher/:teacherId')
  async findByTeacher(@Param('teacherId') teacherId: string) {
    return {
      success: true,
      data: await this.scheduleService.findByTeacher(teacherId),
      message: 'Teacher schedules retrieved successfully',
    };
  }

  @Get('teacher/:teacherId/courses')
  async findTeacherCourses(@Param('teacherId') teacherId: string) {
    return {
      success: true,
      data: await this.scheduleService.findTeacherCourses(teacherId),
      message: 'Teacher courses retrieved successfully',
    };
  }

  @Get('room/:roomId')
  async findByRoom(@Param('roomId', ParseIntPipe) roomId: number) {
    return {
      success: true,
      data: await this.scheduleService.findByRoom(roomId),
      message: 'Room schedules retrieved successfully',
    };
  }

  @Get('day/:dayOfWeek')
  async findByDay(@Param('dayOfWeek') dayOfWeek: string) {
    return {
      success: true,
      data: await this.scheduleService.findByDay(dayOfWeek),
      message: 'Daily schedules retrieved successfully',
    };
  }

  @Get('weekly')
  async getWeeklySchedule(
    @Query('group_id') groupId?: string,
    @Query('teacher_id') teacherId?: string,
  ) {
    return {
      success: true,
      data: await this.scheduleService.getWeeklySchedule(groupId, teacherId),
      message: 'Weekly schedule retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.scheduleService.findOne(id, this.schoolOf(req)),
      message: 'Schedule retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('schedules', 'edit')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.scheduleService.update(id, updateScheduleDto, this.schoolOf(req)),
      message: 'Schedule updated successfully',
    };
  }

  @Patch(':id/cancel')
  @RequireClaim('schedules', 'edit')
  async cancel(@Param('id') id: string) {
    return {
      success: true,
      data: await this.scheduleService.cancelSchedule(id),
      message: 'Schedule cancelled successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('schedules', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    await this.scheduleService.remove(id, this.schoolOf(req));
    return {
      success: true,
      message: 'Schedule deleted successfully',
    };
  }
}

