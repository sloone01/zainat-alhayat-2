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
  Res,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';
import type { Response } from 'express';
import { ParentService } from '../services/parent.service';
import { AbsenceExcuseService } from '../services/absence-excuse.service';
import type { CreateParentDto, UpdateParentDto } from '../services/parent.service';
import { StudentService } from '../services/student.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId, RequestedSchoolIdPipe } from '../common/security/school-access';

@Controller('parents')
@UseGuards(JwtAuthGuard)
export class ParentController {
  constructor(
    private readonly parentService: ParentService,
    private readonly studentService: StudentService,
    private readonly absenceExcuses: AbsenceExcuseService,
  ) {}

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

  @Get('dashboard/weekly-plans')
  async getMyWeeklyPlans(@Request() req: { user: User }) {
    const data = await this.parentService.getParentWeeklyPlans(req.user.id);
    return { success: true, data };
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
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
    @Query('date') date?: string,
    @Query('limit') limitRaw?: string,
  ) {
    // Parent self-route: no JWT school — scope by linked students (optional school filter).
    const limit = Math.min(100, Math.max(1, parseInt(limitRaw ?? '30', 10) || 30));
    const data = await this.parentService.getParentBusMovementLogs(req.user.id, {
      schoolId: requestedSchoolId ?? null,
      date,
      limit,
    });
    return { success: true, data };
  }

  /** Parent self: last known live position of each linked child's bus. */
  @Get('dashboard/bus-positions')
  async getMyBusPositions(@Request() req: { user: User }) {
    const data = await this.parentService.getParentBusPositions(req.user.id);
    return { success: true, data, count: data.length };
  }

  /** Parent self: share pickup location for a linked child (uses child's current bus). */
  @Patch('dashboard/students/:studentId/bus-pickup')
  async shareChildBusPickup(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Body() body: { pickup_lat?: number; pickup_lng?: number },
  ) {
    if (body.pickup_lat == null || body.pickup_lng == null) {
      throw new BadRequestException('pickup_lat and pickup_lng are required');
    }
    const data = await this.studentService.setPickupAsParent(req.user.id, studentId, {
      pickup_lat: Number(body.pickup_lat),
      pickup_lng: Number(body.pickup_lng),
    });
    return { success: true, data, message: 'Pickup location shared' };
  }

  /** Parent self: submitted absence excuses for linked children. */
  @Get('dashboard/absence-excuses')
  async listMyAbsenceExcuses(@Request() req: { user: User }) {
    const data = await this.absenceExcuses.listForParent(req.user.id);
    return { success: true, data };
  }

  @Post('dashboard/absence-excuses')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/absence-excuses';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname || '').toLowerCase() || '.bin';
          cb(null, `excuse_${Date.now()}_${Math.random().toString(36).slice(2, 10)}${ext}`);
        },
      }),
      limits: { fileSize: 8 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.doc', '.docx'];
        if (!allowed.includes(ext)) {
          return cb(new BadRequestException('Invalid file type') as any, false);
        }
        cb(null, true);
      },
    }),
  )
  async createMyAbsenceExcuse(
    @Request() req: { user: User },
    @UploadedFile() file: { filename: string; originalname: string; mimetype: string } | undefined,
    @Body() body: { student_id?: string; absence_date?: string; explanation?: string },
  ) {
    const data = await this.absenceExcuses.createForParent(
      req.user,
      {
        student_id: String(body?.student_id || ''),
        absence_date: String(body?.absence_date || ''),
        explanation: String(body?.explanation || ''),
      },
      file,
    );
    return { success: true, data };
  }

  @Get('dashboard/absence-excuses/:id/file')
  async downloadMyAbsenceExcuse(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.absenceExcuses.openFileForParent(req.user.id, id);
    res.setHeader('Content-Type', file.mime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.filename)}"`,
    );
    return new StreamableFile(file.stream);
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
