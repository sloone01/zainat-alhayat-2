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
import { RequireClaim } from '../rbac/require-claim.decorator';
import { MeetingRoomService } from '../services/meeting-room.service';
import { CreateMeetingRoomDto } from '../dto/meeting-room.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('meeting-rooms')
@UseGuards(JwtAuthGuard)
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  private resolveSchool(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @RequireClaim('admin_meeting_rooms', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMeetingRoomDto, @Request() req: { user: User }) {
    const schoolId = this.resolveSchool(req, dto.school_id);
    const data = await this.meetingRoomService.create(req.user, { ...dto, school_id: schoolId });
    return {
      success: true,
      data,
      message: 'Meeting room created',
    };
  }

  @Get('mine')
  @RequireClaim('my_meeting_rooms', 'view')
  async mine(
    @Query('school_id') schoolIdRaw: string | undefined,
    @Request() req: { user: User },
  ) {
    const requested = schoolIdRaw != null && schoolIdRaw !== '' ? String(schoolIdRaw) : undefined;
    const schoolId = this.resolveSchool(req, requested);
    const data = await this.meetingRoomService.listMine(req.user, schoolId);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get()
  @RequireClaim('admin_meeting_rooms', 'view')
  async list(
    @Query('school_id') schoolIdRaw: string | undefined,
    @Request() req: { user: User },
  ) {
    const requested = schoolIdRaw != null && schoolIdRaw !== '' ? String(schoolIdRaw) : undefined;
    const schoolId = this.resolveSchool(req, requested);
    const data = await this.meetingRoomService.listForAdmin(req.user, schoolId);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get(':id')
  async getOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.getOne(req.user, id);
    return {
      success: true,
      data,
    };
  }

  @Post(':id/join')
  @HttpCode(HttpStatus.OK)
  async join(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.mintJoinToken(req.user, id);
    return {
      success: true,
      data,
      message: 'Token issued',
    };
  }
}
