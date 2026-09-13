import {
  Controller,
  Post,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Res,
  HttpStatus,
  BadRequestException,
  Header,
  Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { basename, resolve } from 'path';
import { randomUUID } from 'crypto';
import { FileUploadService } from '../services/file-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { StudentService } from '../services/student.service';
import { UserService } from '../services/user.service';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FileUploadController {
  constructor(
    private readonly fileUploadService: FileUploadService,
    private readonly studentService: StudentService,
    private readonly userService: UserService,
  ) {}

  @Post('student/:studentId/photo')
  @RequireClaim('students', 'edit')
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
    @Request() req: { user: User },
    @Param('studentId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const schoolId = resolveActorSchoolId(req.user);
    const student = await this.studentService.findOne(studentId, schoolId);
    assertSameSchool(req.user, student.school_id);
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
  @RequireClaim('users', 'edit')
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
    @Request() req: { user: User },
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    const staff = await this.userService.findOne(staffId);
    assertSameSchool(req.user, staff.school_id);
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
  @RequireAnyClaim(
    { page: 'students', action: 'edit' },
    { page: 'enrollments', action: 'edit' },
    { page: 'users', action: 'edit' },
  )
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

  /** Authenticated download only — static public mount was removed. Ownership by filename is still limited. */
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

    const lower = filename.toLowerCase();
    const isImage = /\.(png|jpe?g|gif|webp)$/i.test(lower);
    if (!isImage) {
      res.setHeader('Content-Disposition', `attachment; filename="${basename(filename)}"`);
      res.setHeader('Content-Type', 'application/octet-stream');
    }

    return res.sendFile(absolute);
  }
}
