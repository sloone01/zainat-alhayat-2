import {
  Controller,
  Get,
  Query,
  UseGuards,
  ParseDatePipe,
} from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@Controller('statistics')
@UseGuards(JwtAuthGuard, RolesGuard)
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard')
  @Roles('admin', 'teacher')
  async getDashboardStats() {
    try {
      const stats = await this.statisticsService.getDashboardStats();
      return {
        success: true,
        data: stats,
        message: 'Dashboard statistics retrieved successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('student-progress')
  @Roles('admin', 'teacher')
  async getStudentProgressStats(@Query('courseId') courseId?: string) {
    try {
      const stats = await this.statisticsService.getStudentProgressStats(courseId);
      return {
        success: true,
        data: stats,
        message: 'Student progress statistics retrieved successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('attendance')
  @Roles('admin', 'teacher')
  async getAttendanceStats(
    @Query('groupId') groupId?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    try {
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : undefined;
      
      const stats = await this.statisticsService.getAttendanceStats(groupId, start, end);
      return {
        success: true,
        data: stats,
        message: 'Attendance statistics retrieved successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }

  @Get('courses')
  @Roles('admin', 'teacher')
  async getCourseStats() {
    try {
      const stats = await this.statisticsService.getCourseStats();
      return {
        success: true,
        data: stats,
        message: 'Course statistics retrieved successfully'
      };
    } catch (error) {
      // Rethrow: swallowing here reported HTTP 200 for failed requests.
      throw error;
    }
  }
}

