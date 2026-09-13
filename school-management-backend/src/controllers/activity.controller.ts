import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ActivityService } from '../services/activity.service';
import { ActivityQueryDto, CreateActivityDto, UpdateActivityDto } from '../dto/activity.dto';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('activities')
@RequireClaim('activities', 'view')
export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @RequireClaim('activities', 'create')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Request() req: { user: User }, @Body() createActivityDto: CreateActivityDto) {
    createActivityDto.school_id = this.schoolOf(req, createActivityDto.school_id ?? null);
    const activity = await this.activityService.create(createActivityDto);
    return {
      success: true,
      data: activity,
      message: 'Activity created successfully',
    };
  }

  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async findAll(@Request() req: { user: User }, @Query() query: ActivityQueryDto) {
    const schoolId = this.schoolOf(req, query.school_id);
    const activities = await this.activityService.findAll({ ...query, school_id: schoolId });
    return {
      success: true,
      data: activities,
      count: activities.length,
    };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const activity = await this.activityService.findOne(id);
    assertSameSchool(req.user, activity.school_id);
    return {
      success: true,
      data: activity,
    };
  }

  @Patch(':id')
  @RequireClaim('activities', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateActivityDto: UpdateActivityDto,
  ) {
    const existing = await this.activityService.findOne(id);
    assertSameSchool(req.user, existing.school_id);
    const activity = await this.activityService.update(id, updateActivityDto);
    return {
      success: true,
      data: activity,
      message: 'Activity updated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('activities', 'delete')
  @HttpCode(HttpStatus.OK)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    const existing = await this.activityService.findOne(id);
    assertSameSchool(req.user, existing.school_id);
    await this.activityService.remove(id);
    return {
      success: true,
      message: 'Activity deleted successfully',
    };
  }
}
