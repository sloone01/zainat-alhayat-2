import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { User } from '../entities/user.entity';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { RequestedSchoolIdPipe } from '../common/security/school-access';
import { ScheduleAutoService } from '../services/schedule-auto.service';
import {
  CreateScheduleLessonDemandDto,
  GenerateTimetableDto,
  ReplaceScheduleLessonDemandsDto,
  UpdateScheduleLessonDemandDto,
} from '../dto/schedule-auto.dto';

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

@Controller('schedules/auto')
@RequireClaim('schedules', 'view')
export class ScheduleAutoController {
  constructor(private readonly scheduleAutoService: ScheduleAutoService) {}

  @Get('demands')
  async listDemands(
    @Req() req: { user: User },
    @Query('group_id') groupId?: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const scopedGroupId = groupId?.trim() || undefined;
    if (scopedGroupId && !UUID_RE.test(scopedGroupId)) {
      throw new BadRequestException('group_id must be a UUID');
    }
    return {
      success: true,
      data: await this.scheduleAutoService.listDemands(req.user, scopedGroupId, requestedSchoolId),
    };
  }

  @Post('demands')
  @RequireClaim('schedules', 'create')
  @HttpCode(HttpStatus.CREATED)
  async createDemand(
    @Req() req: { user: User },
    @Body() dto: CreateScheduleLessonDemandDto,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.scheduleAutoService.createDemand(req.user, dto, requestedSchoolId),
    };
  }

  @Patch('demands/:id')
  @RequireClaim('schedules', 'edit')
  async updateDemand(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateScheduleLessonDemandDto,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.scheduleAutoService.updateDemand(req.user, id, dto, requestedSchoolId),
    };
  }

  @Post('demands/replace')
  @RequireClaim('schedules', 'create')
  async replaceDemands(
    @Req() req: { user: User },
    @Body() dto: ReplaceScheduleLessonDemandsDto,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.scheduleAutoService.replaceDemands(req.user, dto, requestedSchoolId),
    };
  }

  @Delete('demands/:id')
  @RequireClaim('schedules', 'delete')
  async deleteDemand(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    await this.scheduleAutoService.deleteDemand(req.user, id, requestedSchoolId);
    return { success: true };
  }

  @Post('generate')
  @RequireClaim('schedules', 'create')
  async generate(
    @Req() req: { user: User },
    @Body() dto: GenerateTimetableDto,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.scheduleAutoService.generate(req.user, dto, requestedSchoolId),
    };
  }
}
