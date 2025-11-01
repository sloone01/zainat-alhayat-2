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

@Controller('groups')
export class GroupController {
  constructor(private readonly groupService: GroupService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createGroupDto: CreateGroupDto) {
    return {
      success: true,
      data: await this.groupService.create(createGroupDto),
      message: 'Group created successfully',
    };
  }

  @Get()
  async findAll(
    @Query('school_id') schoolId?: string,
    @Query('is_active') isActive?: string
  ) {
    const schoolIdNum = schoolId ? parseInt(schoolId) : undefined;
    const isActiveBool = isActive !== undefined ? isActive === 'true' : undefined;

    return {
      success: true,
      data: await this.groupService.findAll(schoolIdNum, isActiveBool),
      message: 'Groups retrieved successfully',
    };
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
  async findOne(@Param('id') id: string) {
    return {
      success: true,
      data: await this.groupService.findOne(id),
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
  async update(
    @Param('id') id: string,
    @Body() updateGroupDto: UpdateGroupDto,
  ) {
    return {
      success: true,
      data: await this.groupService.update(id, updateGroupDto),
      message: 'Group updated successfully',
    };
  }

  @Patch(':id/student-count')
  async updateStudentCount(@Param('id') id: string) {
    return {
      success: true,
      data: await this.groupService.updateStudentCount(id),
      message: 'Group student count updated successfully',
    };
  }

  @Patch(':id/deactivate')
  async deactivate(@Param('id') id: string) {
    return {
      success: true,
      data: await this.groupService.deactivate(id),
      message: 'Group deactivated successfully',
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.groupService.remove(id);
    return {
      success: true,
      message: 'Group deleted successfully',
    };
  }
}

