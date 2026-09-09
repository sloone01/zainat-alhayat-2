import {
  BadRequestException,
  Controller,
  Get,
  Header,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { basename, resolve } from 'path';
import { randomUUID } from 'crypto';
import { FileUploadService } from '../services/file-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { Student } from '../entities/student.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { resolveActorSchoolId, assertOwnedBySchool } from '../common/security/school-access';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  /** School the caller may act in; derived from the token, never from the request. */
  private schoolOf(req: { user: User }) {
    return resolveActorSchoolId(req.user);
  }

  @Post('student/:studentId/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, './uploads/students');
        },
        filename: (req, file, cb) => {
          const studentId = basename(String(req.params.studentId || 'x'));
          const ext = basename(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
          cb(null, `student_${studentId}_${Date.now()}_${randomUUID()}.${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Only PNG, JPEG, GIF, or WebP images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadStudentPhoto(
    @Param('studentId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: { user: User },
  ) {
    if (!file) throw new BadRequestException('No file provided');
    // The student must be the caller's; otherwise a school could overwrite another
    // school's student photo.
    const student = await this.studentRepo.findOne({ where: { id: studentId } });
    assertOwnedBySchool(this.schoolOf(req), [
      { label: `Student with ID ${studentId}`, schoolId: student?.school_id },
    ]);
    await this.fileUploadService.processStudentPhoto(file, studentId);
    return {
      success: true,
      data: {
        filename: file.filename,
        url: `/api/files/students/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
      },
      message: 'Student photo uploaded successfully',
    };
  }

  @Post('staff/:staffId/photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, './uploads/staff');
        },
        filename: (req, file, cb) => {
          const staffId = basename(String(req.params.staffId || 'x'));
          const ext = basename(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
          cb(null, `staff_${staffId}_${Date.now()}_${randomUUID()}.${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
          return cb(new BadRequestException('Only PNG, JPEG, GIF, or WebP images are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadStaffPhoto(
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    await this.fileUploadService.processStaffPhoto(file, staffId);
    return {
      success: true,
      data: {
        filename: file.filename,
        url: `/api/files/staff/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
      },
      message: 'Staff photo uploaded successfully',
    };
  }

  @Post('documents')
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          cb(null, './uploads/documents');
        },
        filename: (_req, file, cb) => {
          const ext = basename(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
          cb(null, `document_${Date.now()}_${randomUUID()}.${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = new Set([
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ]);
        if (!allowed.has(file.mimetype)) {
          return cb(new BadRequestException('File type not allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('No file provided');
    return {
      success: true,
      data: {
        filename: file.filename,
        url: `/api/files/documents/${file.filename}`,
        originalName: file.originalname,
        size: file.size,
      },
      message: 'Document uploaded successfully',
    };
  }

  /** Authenticated download only — static public mount was removed. */
  @Get(':category/:filename')
  @Header('Cache-Control', 'private, no-store')
  async getFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const filePath = this.fileUploadService.getFilePath(filename, category);
    const absolute = resolve(filePath);

    if (!existsSync(absolute)) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'File not found',
      });
    }

    // Force download disposition for non-images to reduce stored XSS risk.
    // SVG is deliberately excluded: inline SVG can carry scripts, so it downloads as a file.
    const lower = filename.toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(lower);
    if (!isImage) {
      res.setHeader('Content-Disposition', `attachment; filename="${basename(filename)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    return res.sendFile(absolute);
  }
}
