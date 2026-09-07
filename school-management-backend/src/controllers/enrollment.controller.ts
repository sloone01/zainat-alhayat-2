import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
  HttpCode,
  ValidationPipe,
  UsePipes,
  UseGuards,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Public } from '../auth/public.decorator';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { EnrollmentService } from '../services/enrollment.service';
import { DocumentGeneratorService } from '../services/document-generator.service';
import { CreateEnrollmentDto, UpdateEnrollmentDto } from '../dto/enrollment.dto';

@Controller('enrollments')
export class EnrollmentController {
  constructor(
    private readonly enrollmentService: EnrollmentService,
    private readonly documentGeneratorService: DocumentGeneratorService,
  ) {}

  // Public endpoint for enrollment submission (no auth required)
  @Post()
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    try {
      const enrollment = await this.enrollmentService.create(createEnrollmentDto);
      return {
        success: true,
        data: enrollment,
        message: 'Enrollment application submitted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  // Admin endpoints (auth required)
  @Get()
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'view')
  async findAll(@Query('status') status?: 'pending' | 'approved' | 'rejected' | 'enrolled') {
    try {
      let enrollments;
      if (status) {
        enrollments = await this.enrollmentService.findByStatus(status);
      } else {
        enrollments = await this.enrollmentService.findAll();
      }

      return {
        success: true,
        data: enrollments,
        count: enrollments.length
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'view')
  async findOne(@Param('id') id: string) {
    try {
      const enrollment = await this.enrollmentService.findOne(id);
      return {
        success: true,
        data: enrollment
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'edit')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async update(@Param('id') id: string, @Body() updateEnrollmentDto: UpdateEnrollmentDto) {
    try {
      const enrollment = await this.enrollmentService.update(id, updateEnrollmentDto);
      return {
        success: true,
        data: enrollment,
        message: 'Enrollment updated successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/approve')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'approve')
  async approve(@Param('id') id: string, @Body('notes') notes?: string) {
    try {
      const enrollment = await this.enrollmentService.approveEnrollment(id, notes);
      return {
        success: true,
        data: enrollment,
        message: 'Enrollment approved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Patch(':id/reject')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'approve')
  async reject(@Param('id') id: string, @Body('notes') notes: string) {
    try {
      if (!notes) {
        return {
          success: false,
          message: 'Rejection reason is required'
        };
      }

      const enrollment = await this.enrollmentService.rejectEnrollment(id, notes);
      return {
        success: true,
        data: enrollment,
        message: 'Enrollment rejected successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }

  @Get(':id/document')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'export')
  async generateDocument(@Param('id') id: string, @Res() res: Response) {
    try {
      const enrollment = await this.enrollmentService.findOne(id);
      if (!enrollment) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'Enrollment not found'
        });
      }

      const document = await this.documentGeneratorService.generateEnrollmentForm(enrollment);

      // Set headers for Word document download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="enrollment-form-${id}.docx"`);
      res.setHeader('Content-Length', document.length);

      res.send(document);
    } catch (error) {
      console.error('Document generation error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to generate document',
        error: error.message
      });
    }
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @RequireClaim('enrollments', 'delete')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    try {
      await this.enrollmentService.remove(id);
      return {
        success: true,
        message: 'Enrollment deleted successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name
      };
    }
  }
}