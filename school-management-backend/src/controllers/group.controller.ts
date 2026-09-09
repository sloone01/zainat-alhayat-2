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
  Request,
  BadRequestException,
  ParseUUIDPipe,
} from '@nestjs/common';
import { GroupService } from '../services/group.service';
import type { CreateGroupDto, UpdateGroupDto } from '../services/group.service';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId, assertSameSchool } from '../common/security/school-access';

@Controller('groups')
@RequireClaim('groups', 'view')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Post()
  @RequireClaim('groups', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Request() req: { user: User },
    @Body() createGroupDto: CreateGroupDto,
  ) {
    const schoolId = this.schoolOf(req, createGroupDto.school_id);
    createGroupDto.school_id = schoolId;
    return {
      success: true,
      data: await this.groupService.create(createGroupDto),
      message: 'Group created successfully',
    };
  }

  /** Shared picker for schedules, attendance, students, etc. (not only Groups page). */
  @Get()
  @RequireAnyClaim(
    { page: 'groups', action: 'view' },
    { page: 'schedules', action: 'view' },
    { page: 'attendance', action: 'view' },
    { page: 'attendance_sessions', action: 'view' },
    { page: 'students', action: 'view' },
    { page: 'activities', action: 'view' },
    { page: 'progress', action: 'view' },
    { page: 'reports', action: 'view' },
    { page: 'weekly_session_plans', action: 'view' },
    { page: 'chat', action: 'view' },
  )
  async findAll(
    @Request() req: { user: User },
    @Query('school_id') schoolId?: string,
    @Query('is_active') isActive?: string,
    @Query('payment_level_id') paymentLevelId?: string,
  ) {
    const requested = schoolId ? String(schoolId) : undefined;
    const schoolIdNum = this.schoolOf(req, requested);
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;

    try {
      const groups = await this.groupService.findAll(schoolIdNum, isActiveBool, paymentLevelId);
      return {
        success: true,
        data: groups,
        message: groups.length > 0 ? 'Groups retrieved successfully' : 'No groups found in database',
        count: groups.length
      };
    } catch (error) {
      console.error(`GET /groups - Database error: ${error.message}`, error.stack);
      // Rethrow: an empty list with HTTP 200 hid the failure from the caller.
      throw error;
    }
  }

  @Get('academic-year/:year')
  async findByAcademicYear(
    @Request() req: { user: User },
    @Param('year') year: string,
    @Query('school_id', ParseUUIDPipe) schoolId: string,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    return {
      success: true,
      data: await this.groupService.findByAcademicYear(scopedSchoolId, year),
      message: 'Groups for academic year retrieved successfully',
    };
  }

  @Get('supervisor/:supervisorId')
  async findBySupervisor(
    @Request() req: { user: User },
    @Param('supervisorId', ParseIntPipe) supervisorId: number,
  ) {
    this.schoolOf(req);
    return {
      success: true,
      data: await this.groupService.findBySupervisor(supervisorId),
      message: 'Groups for supervisor retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: group,
      message: 'Group retrieved successfully',
    };
  }

  @Get(':id/capacity')
  async getCapacity(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: await this.groupService.getGroupCapacity(id),
      message: 'Group capacity retrieved successfully',
    };
  }

  @Get(':id/statistics')
  async getStatistics(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: await this.groupService.getGroupStatistics(id),
      message: 'Group statistics retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('groups', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: await this.groupService.update(id, updateGroupDto),
      message: 'Group updated successfully',
    };
  }

  @Patch(':id/student-count')
  @RequireClaim('groups', 'edit')
  async updateStudentCount(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: await this.groupService.updateStudentCount(id),
      message: 'Group student count updated successfully',
    };
  }

  @Patch(':id/deactivate')
  @RequireClaim('groups', 'edit')
  async deactivate(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    return {
      success: true,
      data: await this.groupService.deactivate(id),
      message: 'Group deactivated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('groups', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    const group = await this.groupService.findOne(id);
    assertSameSchool(req.user, group.school_id);
    await this.groupService.remove(id);
    return {
      success: true,
      message: 'Group deleted successfully',
    };
  }
}
