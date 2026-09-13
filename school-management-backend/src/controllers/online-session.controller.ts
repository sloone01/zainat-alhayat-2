import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { OnlineSessionService } from '../services/online-session.service';
import {
  CreateOnlineSessionDto,
  ListSessionAttendanceRecordsQueryDto,
  OnlineSessionPresenceDto,
} from '../dto/online-session.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('online-sessions')
@UseGuards(JwtAuthGuard)
export class OnlineSessionController {
  constructor(private readonly onlineSessionService: OnlineSessionService) {}

  @Post()
  @RequireAnyClaim(
    { page: 'schedules', action: 'create' },
    { page: 'attendance_sessions', action: 'create' },
  )
  @HttpCode(HttpStatus.OK)
  async createOrGet(@Body() dto: CreateOnlineSessionDto, @Request() req: { user: User }) {
    const data = await this.onlineSessionService.createOrGetSession(req.user, dto);
    return {
      success: true,
      data,
      message: data.created ? 'Online room created' : 'Joined existing online room',
    };
  }

  @Get('attendance-records')
  @RequireClaim('attendance_sessions', 'view')
  async attendanceRecords(
    @Query() query: ListSessionAttendanceRecordsQueryDto,
    @Request() req: { user: User },
  ) {
    const schoolId = resolveActorSchoolId(req.user, query.school_id);
    const data = await this.onlineSessionService.listAttendanceRecords(req.user, {
      ...query,
      school_id: schoolId ?? undefined,
    });
    return {
      success: true,
      data,
      count: data.length,
      message: 'Session attendance records',
    };
  }

  @Get('resolve')
  async resolve(
    @Query('schedule_id', ParseUUIDPipe) scheduleId: string,
    @Query('week_start_date') weekStart: string,
    @Request() req: { user: User },
  ) {
    if (!weekStart?.trim()) {
      throw new BadRequestException('week_start_date is required');
    }
    const data = await this.onlineSessionService.resolve(req.user, scheduleId, weekStart.trim());
    return {
      success: true,
      data,
      message: 'Resolved',
    };
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async join(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.onlineSessionService.mintJoinToken(req.user, id);
    return {
      success: true,
      data,
      message: 'Token issued',
    };
  }

  @Post(':id/presence')
  @HttpCode(HttpStatus.OK)
  async presence(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: OnlineSessionPresenceDto,
    @Request() req: { user: User },
  ) {
    const data = await this.onlineSessionService.logPresence(req.user, id, body.action);
    return {
      success: true,
      data,
      message: 'Presence updated',
    };
  }

  @Get(':id/attendance')
  @RequireClaim('attendance_sessions', 'view')
  async attendance(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.onlineSessionService.getAttendance(req.user, id);
    return {
      success: true,
      data,
      count: data.length,
      message: 'Attendance',
    };
  }

  /** Per-student attended/not_attended for this video session only (separate from daily attendances) */
  @Get(':id/student-attendance')
  @RequireClaim('attendance_sessions', 'view')
  async studentAttendance(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.onlineSessionService.listStudentRoll(req.user, id);
    return {
      success: true,
      data,
      count: data.length,
      message: 'Student attendance',
    };
  }
}
