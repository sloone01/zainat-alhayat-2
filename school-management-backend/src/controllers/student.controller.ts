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
import { StudentService } from '../services/student.service';
import type { CreateStudentDto, UpdateStudentDto } from '../services/student.service';
import { RegisterStudentInAppDto } from '../dto/student-register.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('students')
@UseGuards(JwtAuthGuard)
@RequireClaim('students', 'view')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post()
  @RequireClaim('students', 'create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Request() req: { user: User }, @Body() createStudentDto: CreateStudentDto) {
    const schoolId = this.schoolOf(req);
    const student = await this.studentService.create(createStudentDto, schoolId);
    return {
      success: true,
      data: student,
      message: 'Student created successfully',
    };
  }

  @Post('register')
  @RequireClaim('students', 'create')
  @HttpCode(HttpStatus.CREATED)
  async registerInApp(
    @Request() req: { user: User },
    @Body() dto: RegisterStudentInAppDto,
  ) {
    const student = await this.studentService.registerInApp(dto, req.user);
    return {
      success: true,
      data: student,
      message: 'Student registered successfully',
    };
  }

  @Get()
  async findAll(@Request() req: { user: User }) {
    const students = await this.studentService.findAll(this.schoolOf(req));
    return {
      success: true,
      data: students,
      count: students.length,
    };
  }

  @Get('search')
  async search(@Request() req: { user: User }, @Query('q') query: string) {
    if (!query) {
      throw new BadRequestException('Search query is required');
    }
    const students = await this.studentService.searchStudents(query, this.schoolOf(req));
    return {
      success: true,
      data: students,
      count: students.length,
    };
  }

  @Get('group/:groupId')
  async findByGroup(@Request() req: { user: User }, @Param('groupId') groupId: string) {
    const students = await this.studentService.findByGroup(groupId, this.schoolOf(req));
    return { success: true, data: students, count: students.length };
  }

  @Get('bus/:busId')
  @RequireAnyClaim(
    { page: 'students', action: 'view' },
    { page: 'transportation', action: 'view' },
  )
  async findByBus(@Request() req: { user: User }, @Param('busId') busId: string) {
    const students = await this.studentService.findByBus(busId, this.schoolOf(req));
    return { success: true, data: students, count: students.length };
  }

  @Get('parent/:parentId')
  async findByParent(
    @Request() req: { user: User },
    @Param('parentId', ParseIntPipe) parentId: number,
  ) {
    const students = await this.studentService.findByParent(parentId, this.schoolOf(req));
    return { success: true, data: students, count: students.length };
  }

  @Get(':id')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const student = await this.studentService.findOne(id, this.schoolOf(req));
    return { success: true, data: student };
  }

  @Get(':id/progress')
  async getProgress(@Request() req: { user: User }, @Param('id') id: string) {
    await this.studentService.findOne(id, this.schoolOf(req));
    const studentProgress = await this.studentService.getStudentProgress(id);
    return { success: true, data: studentProgress };
  }

  @Patch(':id')
  @RequireClaim('students', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    await this.studentService.findOne(id, this.schoolOf(req));
    const student = await this.studentService.update(id, updateStudentDto);
    return {
      success: true,
      data: student,
      message: 'Student updated successfully',
    };
  }

  @Patch(':id/assign-group')
  @RequireClaim('students', 'edit')
  async assignToGroup(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body()
    body: {
      groupId: string;
      paymentLevelId?: string | null;
      replaceExistingGroups?: boolean;
    },
  ) {
    await this.studentService.findOne(id, this.schoolOf(req));
    const student = await this.studentService.assignToGroup(id, body.groupId, {
      paymentLevelId: body.paymentLevelId,
      replaceExistingGroups: body.replaceExistingGroups === true,
    });
    return {
      success: true,
      data: student,
      message: 'Student assigned to group successfully',
    };
  }

  @Patch(':id/assign-bus')
  @RequireAnyClaim(
    { page: 'students', action: 'edit' },
    { page: 'transportation', action: 'edit' },
  )
  async assignToBus(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body('busId') busId: string,
  ) {
    await this.studentService.findOne(id, this.schoolOf(req));
    const student = await this.studentService.assignToBus(id, busId);
    return {
      success: true,
      data: student,
      message: 'Student assigned to bus successfully',
    };
  }

  @Patch(':id/remove-bus')
  @RequireAnyClaim(
    { page: 'students', action: 'edit' },
    { page: 'transportation', action: 'edit' },
  )
  async removeFromBus(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body('busId') busId: string,
  ) {
    await this.studentService.findOne(id, this.schoolOf(req));
    const student = await this.studentService.removeFromBus(id, busId);
    return {
      success: true,
      data: student,
      message: 'Student removed from bus successfully',
    };
  }

  @Delete(':id')
  @RequireClaim('students', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    await this.studentService.findOne(id, this.schoolOf(req));
    await this.studentService.remove(id);
    return {
      success: true,
      message: 'Student deleted successfully',
    };
  }
}

