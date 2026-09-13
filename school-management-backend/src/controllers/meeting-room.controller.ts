import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireAnyClaim, RequireClaim } from '../rbac/require-claim.decorator';
import { MeetingRoomService } from '../services/meeting-room.service';
import { CreateMeetingRoomDto } from '../dto/meeting-room.dto';
import { User } from '../entities/user.entity';
import {
  isParentOrStudentActor,
  RequestedSchoolIdPipe,
  resolveActorSchoolId,
} from '../common/security/school-access';

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

  @Patch(':id')
  @RequireAnyClaim(
    { page: 'admin_meeting_rooms', action: 'create' },
    { page: 'admin_meeting_rooms', action: 'edit' },
  )
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateMeetingRoomDto,
    @Request() req: { user: User },
  ) {
    const schoolId = this.resolveSchool(req, dto.school_id);
    const data = await this.meetingRoomService.update(req.user, id, { ...dto, school_id: schoolId });
    return {
      success: true,
      data,
      message: 'Meeting room updated',
    };
  }

  @Get('mine')
  @RequireClaim('my_meeting_rooms', 'view')
  async mine(
    @Query('school_id', RequestedSchoolIdPipe) requested: string | undefined,
    @Request() req: { user: User },
  ) {
    // Parents/students are school-less on JWT; list invites for this user only.
    if (isParentOrStudentActor(req.user)) {
      const data = await this.meetingRoomService.listMine(req.user, requested ?? null);
      return {
        success: true,
        data,
        count: data.length,
      };
    }
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
    @Query('school_id', RequestedSchoolIdPipe) requested: string | undefined,
    @Request() req: { user: User },
  ) {
    const schoolId = this.resolveSchool(req, requested);
    const data = await this.meetingRoomService.listForAdmin(req.user, schoolId);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get(':id')
  @RequireAnyClaim(
    { page: 'my_meeting_rooms', action: 'view' },
    { page: 'admin_meeting_rooms', action: 'view' },
  )
  async getOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.getOne(req.user, id);
    return {
      success: true,
      data,
    };
  }

  @Post(':id/join')
  @RequireAnyClaim(
    { page: 'my_meeting_rooms', action: 'view' },
    { page: 'admin_meeting_rooms', action: 'view' },
  )
  @HttpCode(HttpStatus.OK)
  async join(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.mintJoinToken(req.user, id);
    return {
      success: true,
      data,
      message: 'Token issued',
    };
  }

  @Post(':id/end')
  @RequireAnyClaim(
    { page: 'my_meeting_rooms', action: 'view' },
    { page: 'admin_meeting_rooms', action: 'view' },
  )
  @HttpCode(HttpStatus.OK)
  async end(@Param('id', ParseUUIDPipe) id: string, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.endMeeting(req.user, id);
    return {
      success: true,
      data,
      message: 'Meeting ended',
    };
  }
}
