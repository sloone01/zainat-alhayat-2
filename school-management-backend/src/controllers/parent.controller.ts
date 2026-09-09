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
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ParentService } from '../services/parent.service';
import type { CreateParentDto, UpdateParentDto } from '../services/parent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  /** Parent self — must be registered before `:id` routes. */
  @Get('dashboard/my-data')
  async getMyDashboardData(@Request() req: { user: User }) {
    const dashboardData = await this.parentService.getParentDashboardData(req.user.id);
    return { success: true, data: dashboardData };
  }

  @Get('dashboard/attendance')
  async getMyAttendance(
    @Request() req: { user: User },
    @Query('offset') offsetRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const offset = Math.max(0, parseInt(offsetRaw ?? '0', 10) || 0);
    const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? '5', 10) || 5));
    const data = await this.parentService.getParentAttendanceView(
      req.user.id,
      offset,
      limit,
    );
    return { success: true, data };
  }

  @Get('dashboard/activities')
  async getMyAssignedActivities(@Request() req: { user: User }) {
    const data = await this.parentService.getParentAssignedActivities(req.user.id);
    return { success: true, data, count: data.length };
  }

  @Get('dashboard/bus-movements')
  async getMyBusMovements(
    @Request() req: { user: User },
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
    @Query('date') date?: string,
    @Query('limit') limitRaw?: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw ?? '30', 10) || 30));
    const data = await this.parentService.getParentBusMovementLogs(req.user.id, schoolId, {
      date,
      limit,
    });
    return { success: true, data };
  }

  @Post()
  @RequireClaim('students', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: { user: User }, @Body() createParentDto: CreateParentDto) {
    const parent = await this.parentService.create(createParentDto, this.schoolOf(req));
    return {
      success: true,
      data: parent,
      message: 'Parent created successfully',
    };
  }

  @Get()
  @RequireClaim('students', 'view')
  async findAll(@Request() req: { user: User }) {
    const parents = await this.parentService.findAll(this.schoolOf(req));
    return {
      success: true,
      data: parents,
      count: parents.length,
    };
  }

  @Get('search')
  @RequireClaim('students', 'view')
  async search(@Request() req: { user: User }, @Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const parents = await this.parentService.searchParents(query, this.schoolOf(req));
    return {
      success: true,
      data: parents,
      count: parents.length,
    };
  }

  @Get(':id')
  @RequireClaim('students', 'view')
  async findOne(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    const parent = await this.parentService.findOne(id, this.schoolOf(req));
    return { success: true, data: parent };
  }

  @Patch(':id')
  @RequireClaim('students', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateParentDto: UpdateParentDto,
  ) {
    const parent = await this.parentService.update(id, updateParentDto, this.schoolOf(req));
    return {
      success: true,
      data: parent,
      message: 'Parent updated successfully',
    };
  }

  @Patch(':id/assign-student')
  @RequireClaim('students', 'edit')
  async assignToStudent(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body()
    body: { studentId?: string; relationship?: 'father' | 'mother' | 'guardian' },
  ) {
    if (!body?.studentId) {
      throw new BadRequestException('studentId is required');
    }
    const parent = await this.parentService.assignToStudent(
      id,
      body.studentId,
      this.schoolOf(req),
      body.relationship || 'guardian',
    );
    return {
      success: true,
      data: parent,
      message: 'Parent assigned to student successfully',
    };
  }

  @Patch(':id/unassign-student')
  @RequireClaim('students', 'edit')
  async unassignFromStudent(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body('studentId') studentId: string,
  ) {
    if (!studentId) {
      throw new BadRequestException('studentId is required');
    }
    const parent = await this.parentService.removeFromStudent(
      id,
      studentId,
      this.schoolOf(req),
    );
    return {
      success: true,
      data: parent,
      message: 'Parent unassigned from student successfully',
    };
  }

  /** Admin-only: set a new login password for the parent's account. */
  @Patch(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async resetPassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('newPassword') newPassword: string,
    @Request() req: { user: User },
  ) {
    const result = await this.parentService.resetPassword(
      id,
      newPassword,
      this.schoolOf(req),
    );
    return {
      success: true,
      data: result,
      message: 'Password reset successfully',
    };
  }

  @Delete(':id/students/:studentId')
  @RequireClaim('students', 'edit')
  async removeFromStudent(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('studentId') studentId: string,
    @Request() req: { user: User },
  ) {
    const parent = await this.parentService.removeFromStudent(
      id,
      studentId,
      this.schoolOf(req),
    );
    return {
      success: true,
      data: parent,
      message: 'Parent unlinked from student successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('students', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    await this.parentService.remove(id, this.schoolOf(req));
    return {
      success: true,
      message: 'Parent deleted successfully',
    };
  }
}
