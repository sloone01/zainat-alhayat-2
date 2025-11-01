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
import { AttendanceService } from '../services/attendance.service';
import type {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkAttendanceDto
} from '../services/attendance.service';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return {
      success: true,
      data: await this.attendanceService.create(createAttendanceDto),
      message: 'Attendance record created successfully',
    };
  }

  @Post('bulk')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    return {
      success: true,
      data: await this.attendanceService.bulkCreate(bulkAttendanceDto),
      message: 'Bulk attendance records created successfully',
    };
  }

  @Get()
  async findAll() {
    return {
      success: true,
      data: await this.attendanceService.findAll(),
      message: 'Attendance records retrieved successfully',
    };
  }

  @Get('group/:groupId')
  async findByGroup(
    @Param('groupId') groupId: string,
    @Query('date') date?: string,
  ) {
    const attendanceDate = date ? new Date(date) : undefined;
    return {
      success: true,
      data: await this.attendanceService.findByGroup(groupId, attendanceDate),
      message: 'Group attendance records retrieved successfully',
    };
  }

  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    const start = startDate ? new Date(startDate) : undefined;
    const end = endDate ? new Date(endDate) : undefined;

    return {
      success: true,
      data: await this.attendanceService.findByStudent(studentId, start, end),
      message: 'Student attendance records retrieved successfully',
    };
  }

  @Get('date/:date')
  async findByDate(@Param('date') date: string) {
    return {
      success: true,
      data: await this.attendanceService.findByDate(new Date(date)),
      message: 'Daily attendance records retrieved successfully',
    };
  }

  @Get('statistics/group/:groupId')
  async getGroupStatistics(
    @Param('groupId') groupId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return {
      success: true,
      data: await this.attendanceService.getAttendanceStatistics(
        groupId,
        new Date(startDate),
        new Date(endDate),
      ),
      message: 'Group attendance statistics retrieved successfully',
    };
  }

  @Get('statistics/student/:studentId')
  async getStudentStatistics(
    @Param('studentId') studentId: string,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return {
      success: true,
      data: await this.attendanceService.getStudentAttendanceRate(
        studentId,
        new Date(startDate),
        new Date(endDate),
      ),
      message: 'Student attendance statistics retrieved successfully',
    };
  }

  @Get('report/daily/:date')
  async getDailyReport(@Param('date') date: string) {
    return {
      success: true,
      data: await this.attendanceService.getDailyAttendanceReport(new Date(date)),
      message: 'Daily attendance report retrieved successfully',
    };
  }

  @Get('check/:studentId/:date')
  async checkExisting(
    @Param('studentId') studentId: string,
    @Param('date') date: string,
  ) {
    return {
      success: true,
      data: await this.attendanceService.checkExistingAttendance(studentId, new Date(date)),
      message: 'Attendance check completed successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return {
      success: true,
      data: await this.attendanceService.findOne(id),
      message: 'Attendance record retrieved successfully',
    };
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
  ) {
    return {
      success: true,
      data: await this.attendanceService.update(id, updateAttendanceDto),
      message: 'Attendance record updated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.attendanceService.remove(id);
    return {
      success: true,
      message: 'Attendance record deleted successfully',
    };
  }
}

