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
import type { CreateScheduleDto, UpdateScheduleDto } from '../services/schedule.service';

@Controller('schedules')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createScheduleDto: CreateScheduleDto) {
    return {
      success: true,
      data: await this.scheduleService.create(createScheduleDto),
      message: 'Schedule created successfully',
    };
  }

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.scheduleService.findAll(),
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
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.scheduleService.findOne(id),
      message: 'Schedule retrieved successfully',
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return {
      success: true,
      data: await this.scheduleService.update(id, updateScheduleDto),
      message: 'Schedule updated successfully',
    };
  }

  @Patch(':id/cancel')
  async cancel(@Param('id') id: string) {
    return {
      success: true,
      data: await this.scheduleService.cancelSchedule(id),
      message: 'Schedule cancelled successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.scheduleService.remove(id);
    return {
      success: true,
      message: 'Schedule deleted successfully',
    };
  }
}

