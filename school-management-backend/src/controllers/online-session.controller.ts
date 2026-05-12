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
import { OnlineSessionService } from '../services/online-session.service';
import {
  CreateOnlineSessionDto,
  OnlineSessionPresenceDto,
} from '../dto/online-session.dto';

@Controller('online-sessions')
@UseGuards(JwtAuthGuard)
export class OnlineSessionController {
  constructor(private readonly onlineSessionService: OnlineSessionService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrGet(@Body() dto: CreateOnlineSessionDto, @Request() req: any) {
    const data = await this.onlineSessionService.createOrGetSession(req.user, dto);
    return {
      success: true,
      data,
      message: data.created ? 'Online room created' : 'Joined existing online room',
    };
  }

  @Get('resolve')
  async resolve(
    @Query('schedule_id', ParseUUIDPipe) scheduleId: string,
    @Query('week_start_date') weekStart: string,
    @Request() req: any,
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
  async join(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
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
    @Request() req: any,
  ) {
    const data = await this.onlineSessionService.logPresence(req.user, id, body.action);
    return {
      success: true,
      data,
      message: 'Presence updated',
    };
  }

  @Get(':id/attendance')
  async attendance(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
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
  async studentAttendance(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    const data = await this.onlineSessionService.listStudentRoll(req.user, id);
    return {
      success: true,
      data,
      count: data.length,
      message: 'Student attendance',
    };
  }
}
