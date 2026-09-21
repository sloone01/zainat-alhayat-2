import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import type { Response } from 'express';
import { DataSource } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { assertSameSchool } from '../common/security/school-access';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);

/** Medical reports attached to a student (PDF / JPG / PNG, up to 5 MB each). */
@Controller('students/:studentId/medical-reports')
@UseGuards(JwtAuthGuard)
@RequireClaim('students', 'view')
export class StudentMedicalReportController {
  constructor(private readonly dataSource: DataSource) {}

  private async studentSchool(user: User, studentId: string): Promise<string | null> {
    const rows: { school_id: string | null }[] = await this.dataSource.query(
      `SELECT school_id FROM students WHERE id = $1`,
      [studentId],
    );
    if (!rows.length) throw new NotFoundException('Student not found');
    assertSameSchool(user, rows[0].school_id);
    return rows[0].school_id;
  }

  @Get()
  async list(@Request() req: { user: User }, @Param('studentId', ParseUUIDPipe) studentId: string) {
    await this.studentSchool(req.user, studentId);
    const data = await this.dataSource.query(
      `SELECT id, filename, mime_type, size_bytes, created_at
         FROM student_medical_reports WHERE student_id = $1 ORDER BY created_at DESC`,
      [studentId],
    );
    return { success: true, data };
  }

  @Post()
  @RequireClaim('students', 'edit')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_BYTES } }))
  async upload(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @UploadedFile() file?: { originalname: string; mimetype: string; size: number; buffer: Buffer },
  ) {
    const schoolId = await this.studentSchool(req.user, studentId);
    if (!file) throw new BadRequestException('file is required');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG or PNG files are allowed');
    }
    const rows = await this.dataSource.query(
      `INSERT INTO student_medical_reports (student_id, school_id, filename, mime_type, size_bytes, data, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, filename, mime_type, size_bytes, created_at`,
      [
        studentId,
        schoolId,
        String(file.originalname || 'report').slice(0, 255),
        file.mimetype,
        file.size,
        file.buffer,
        req.user.id,
      ],
    );
    return { success: true, data: rows[0] };
  }

  @Get(':reportId/file')
  async download(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Res() res: Response,
  ) {
    await this.studentSchool(req.user, studentId);
    const rows: { filename: string; mime_type: string; data: Buffer }[] = await this.dataSource.query(
      `SELECT filename, mime_type, data FROM student_medical_reports WHERE id = $1 AND student_id = $2`,
      [reportId, studentId],
    );
    if (!rows.length) throw new NotFoundException('Report not found');
    res.setHeader('Content-Type', rows[0].mime_type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(rows[0].filename)}`,
    );
    res.send(rows[0].data);
  }

  @Delete(':reportId')
  @RequireClaim('students', 'edit')
  async remove(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
  ) {
    await this.studentSchool(req.user, studentId);
    await this.dataSource.query(
      `DELETE FROM student_medical_reports WHERE id = $1 AND student_id = $2`,
      [reportId, studentId],
    );
    return { success: true };
  }
}
