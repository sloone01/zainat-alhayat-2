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
import { GroupService } from '../services/group.service';
import type { CreateGroupDto, UpdateGroupDto } from '../services/group.service';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { Req } from '@nestjs/common';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('groups')
@RequireClaim('groups', 'view')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }, requested?: number | string | null) {
    const n = requested == null || requested === '' ? undefined : Number(requested);
    return resolveActorSchoolId(req.user, Number.isNaN(n as number) ? undefined : n);
  }

  @Post()
  @RequireClaim('groups', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupDto: CreateGroupDto,
    @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.groupService.create(createGroupDto, this.schoolOf(req)),
      message: 'Group created successfully',
    };
  }

  @Get()
  async findAll(
    @Req() req: { user: User },
    @Query('school_id') schoolId?: string,
    @Query('is_active') isActive?: string,
    @Query('payment_level_id') paymentLevelId?: string,
  ) {
    // Derived from the token: omitting ?school_id used to return every school's rows.
    const schoolIdNum = this.schoolOf(req, schoolId) ?? undefined;
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
    @Param('year') year: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    return {
      success: true,
      data: await this.groupService.findByAcademicYear(schoolId, year),
      message: 'Groups for academic year retrieved successfully',
    };
  }

  @Get('supervisor/:supervisorId')
  async findBySupervisor(@Param('supervisorId', ParseIntPipe) supervisorId: number) {
    return {
      success: true,
      data: await this.groupService.findBySupervisor(supervisorId),
      message: 'Groups for supervisor retrieved successfully',
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.groupService.findOne(id, this.schoolOf(req)),
      message: 'Group retrieved successfully',
    };
  }

  @Get(':id/capacity')
  async getCapacity(@Param('id') id: string) {
    return {
      success: true,
      data: await this.groupService.getGroupCapacity(id),
      message: 'Group capacity retrieved successfully',
    };
  }

  @Get(':id/statistics')
  async getStatistics(@Param('id') id: string) {
    return {
      success: true,
      data: await this.groupService.getGroupStatistics(id),
      message: 'Group statistics retrieved successfully',
    };
  }

  @Patch(':id')
  @RequireClaim('groups', 'edit')
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
    @Req() req: { user: User },
  ) {
    return {
      success: true,
      data: await this.groupService.update(id, updateGroupDto, this.schoolOf(req)),
      message: 'Group updated successfully',
    };
  }

  @Patch(':id/student-count')
  @RequireClaim('groups', 'edit')
  async updateStudentCount(@Param('id') id: string, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.groupService.updateStudentCount(id, this.schoolOf(req)),
      message: 'Group student count updated successfully',
    };
  }

  @Patch(':id/deactivate')
  @RequireClaim('groups', 'edit')
  async deactivate(@Param('id') id: string, @Req() req: { user: User }) {
    return {
      success: true,
      data: await this.groupService.deactivate(id, this.schoolOf(req)),
      message: 'Group deactivated successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('groups', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @Req() req: { user: User }) {
    await this.groupService.remove(id, this.schoolOf(req));
    return {
      success: true,
      message: 'Group deleted successfully',
    };
  }
}

