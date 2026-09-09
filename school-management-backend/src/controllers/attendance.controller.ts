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
import { RequireClaim } from '../rbac/require-claim.decorator';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';
import type {
  CreateAttendanceDto,
  UpdateAttendanceDto,
  BulkAttendanceDto
} from '../services/attendance.service';

@Controller('attendance')
@RequireClaim('attendance', 'view')
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @RequireClaim('attendance', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createAttendanceDto: CreateAttendanceDto) {
    return {
      success: true,
      data: await this.attendanceService.create(createAttendanceDto),
      message: 'Attendance record created successfully',
    };
  }

  @Post('bulk')
  @RequireClaim('attendance', 'create')
  @HttpCode(HttpStatus.CREATED)
  async bulkCreate(@Body() bulkAttendanceDto: BulkAttendanceDto) {
    return {
      success: true,
      data: await this.attendanceService.bulkCreate(bulkAttendanceDto),
      message: 'Bulk attendance records created successfully',
    };
  }

  @Get()
  async findAll(@Req() req: { user: User }) {
    return {
      success: true,
      data: await this.attendanceService.findAll(this.schoolOf(req)),
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
  async findOne(@Param('id', ParseIntPipe) id: number, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.attendanceService.findOne(id, this.schoolOf(req)),
      message: 'Attendance record retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('attendance', 'edit')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAttendanceDto: UpdateAttendanceDto,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.attendanceService.update(id, updateAttendanceDto, this.schoolOf(req)),
      message: 'Attendance record updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('attendance', 'edit')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: { user: User }) {
    await this.attendanceService.remove(id, this.schoolOf(req));
    return {
      success: true,
      message: 'Attendance record deleted successfully',
    };
  }
}

