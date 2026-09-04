import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MeetingRoomService } from '../services/meeting-room.service';
import { CreateMeetingRoomDto } from '../dto/meeting-room.dto';
import { User } from '../entities/user.entity';

@Controller('meeting-rooms')
@UseGuards(JwtAuthGuard)
export class MeetingRoomController {
  constructor(private readonly meetingRoomService: MeetingRoomService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMeetingRoomDto, @Request() req: { user: User }) {
    const data = await this.meetingRoomService.create(req.user, dto);
    return {
      success: true,
      data,
      message: 'Meeting room created',
    };
  }

  @Get('mine')
  async mine(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Request() req: { user: User },
  ) {
    const data = await this.meetingRoomService.listMine(req.user, schoolId);
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get()
  async list(
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Request() req: { user: User },
  ) {
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
