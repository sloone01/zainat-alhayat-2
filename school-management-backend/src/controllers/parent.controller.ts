import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ParentService } from '../services/parent.service';
import type { CreateParentDto, UpdateParentDto } from '../services/parent.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(private readonly parentService: ParentService) {}

  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createParentDto: CreateParentDto,
    @Request() req: { user: User },
  ) {
    try {
      const parent = await this.parentService.create(createParentDto, this.schoolOf(req));
      return {
        success: true,
        data: parent,
        message: 'Parent created successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Get()
  async findAll(@Request() req: { user: User }) {
    const parents = await this.parentService.findAll(this.schoolOf(req));
    return {
      success: true,
      data: parents,
      count: parents.length,
    };
  }

  @Get('search')
  async search(@Query('q') query: string, @Request() req: { user: User }) {
    try {
      if (!query) {
        throw new BadRequestException('Search query is required');
      }

      const parents = await this.parentService.searchParents(query, this.schoolOf(req));
      return {
        success: true,
        data: parents,
        count: parents.length
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number, @Request() req: { user: User }) {
    try {
      const parent = await this.parentService.findOne(id, this.schoolOf(req));
      return {
        success: true,
        data: parent
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateParentDto: UpdateParentDto,
    @Request() req: { user: User },
  ) {
    try {
      const parent = await this.parentService.update(
        id,
        updateParentDto,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: parent,
        message: 'Parent updated successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Patch(':id/assign-student')
  async assignToStudent(
    @Param('id', ParseIntPipe) id: number,
    @Body('studentId') studentId: string,
    @Request() req: { user: User },
  ) {
    try {
      const parent = await this.parentService.assignToStudent(
        id,
        studentId,
        this.schoolOf(req),
      );
      return {
        success: true,
        data: parent,
        message: 'Parent assigned to student successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  /** Admin-only: set a new login password for the parent's account. */
  @Patch(':id/reset-password')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async resetPassword(
    @Param('id', ParseIntPipe) id: number,
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
  async removeFromStudent(
    @Param('id', ParseIntPipe) id: number,
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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number, @Request() req: { user: User }) {
    try {
      await this.parentService.remove(id, this.schoolOf(req));
      return {
        success: true,
        message: 'Parent deleted successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Get('dashboard/my-data')
  async getMyDashboardData(@Request() req) {
    try {
      const userId = req.user.id;
      const dashboardData = await this.parentService.getParentDashboardData(userId);
      return {
        success: true,
        data: dashboardData
      };
    } catch (error) {
      // Rethrow: swallowing here reported 200/201 for failed requests.
      throw error;
    }
  }

  @Get('dashboard/attendance')
  async getMyAttendance(
    @Request() req,
    @Query('offset') offsetRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    try {
      const userId = req.user.id;
      const offset = Math.max(0, parseInt(offsetRaw ?? '0', 10) || 0);
      const limit = Math.min(50, Math.max(1, parseInt(limitRaw ?? '5', 10) || 5));
      const data = await this.parentService.getParentAttendanceView(userId, offset, limit);
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('dashboard/activities')
  async getMyAssignedActivities(@Request() req) {
    try {
      const userId = req.user.id;
      const data = await this.parentService.getParentAssignedActivities(userId);
      return {
        success: true,
        data,
        count: data.length,
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('dashboard/bus-movements')
  async getMyBusMovements(
    @Request() req,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('date') date?: string,
    @Query('limit') limitRaw?: string,
  ) {
    try {
      const userId = req.user.id;
      const limit = Math.min(100, Math.max(1, parseInt(limitRaw ?? '30', 10) || 30));
      const data = await this.parentService.getParentBusMovementLogs(userId, schoolId, {
        date,
        limit,
      });
      return {
        success: true,
        data,
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}