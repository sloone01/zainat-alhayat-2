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
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { EnrollmentService } from '../services/enrollment.service';
import { DocumentGeneratorService } from '../services/document-generator.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../dto/enrollment.dto';
import { User } from '../entities/user.entity';
import { resolveActorSchoolId } from '../common/security/school-access';

@Controller('enrollments')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly documentGeneratorService: DocumentGeneratorService,
  ) {}

  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    const enrollment = await this.enrollmentService.create(createEnrollmentDto);
    return {
      success: true,
      data: enrollment,
      message: 'Enrollment application submitted successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'view')
  async findAll(
    @Request() req: { user: User },
    @Query('status') status?: 'pending' | 'approved' | 'rejected' | 'enrolled',
  ) {
    const schoolId = this.schoolOf(req);
    const enrollments = status
      ? await this.enrollmentService.findByStatus(status, schoolId)
      : await this.enrollmentService.findAll(schoolId);

    return {
      success: true,
      data: enrollments,
      count: enrollments.length,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'view')
  async findOne(@Request() req: { user: User }, @Param('id') id: string) {
    const enrollment = await this.enrollmentService.findOne(id, req.user);
    return { success: true, data: enrollment };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ) {
    await this.enrollmentService.findOne(id, req.user);
    const enrollment = await this.enrollmentService.update(id, updateEnrollmentDto);
    return {
      success: true,
      data: enrollment,
      message: 'Enrollment updated successfully',
    };
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'approve')
  async approve(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body('notes') notes?: string,
  ) {
    const enrollment = await this.enrollmentService.approveEnrollment(id, notes, req.user);
    return {
      success: true,
      data: enrollment,
      message: 'Enrollment approved successfully',
    };
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'approve')
  async reject(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Body('notes') notes: string,
  ) {
    if (!notes) {
      throw new BadRequestException('Rejection reason is required');
    }
    const enrollment = await this.enrollmentService.rejectEnrollment(id, notes, req.user);
    return {
      success: true,
      data: enrollment,
      message: 'Enrollment rejected successfully',
    };
  }

  @Get(':id/document')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'export')
  async generateDocument(
    @Request() req: { user: User },
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    const enrollment = await this.enrollmentService.findOne(id, req.user);
    const document = await this.documentGeneratorService.generateEnrollmentForm(enrollment);
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    );
    res.setHeader('Content-Disposition', `attachment; filename="enrollment-form-${id}.docx"`);
    res.setHeader('Content-Length', document.length);
    res.send(document);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Request() req: { user: User }, @Param('id') id: string) {
    await this.enrollmentService.findOne(id, req.user);
    await this.enrollmentService.remove(id);
    return { success: true, message: 'Enrollment deleted successfully' };
  }
}
