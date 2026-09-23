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
import { AttachmentService } from '../services/attachment.service';
import type { Attachment } from '../entities/attachment.entity';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_MIME = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const PURPOSE = 'medical_report';

/**
 * Medical reports attached to a student (PDF / JPG / PNG, up to 5 MB each).
 * Backed by the generic attachment system (entity_type=student,
 * purpose=medical_report), so binaries live in AttachmentStorage
 * (local disk or GCS) instead of a bytea column. Routes and response
 * shape are unchanged for the frontend.
 */
@Controller('students/:studentId/medical-reports')
@UseGuards(JwtAuthGuard)
@RequireClaim('students', 'view')
export class StudentMedicalReportController {
  constructor(
    private readonly dataSource: DataSource,
    private readonly attachments: AttachmentService,
  ) {}

  private async studentSchool(user: User, studentId: string): Promise<string | null> {
    const rows: { school_id: string | null }[] = await this.dataSource.query(
      `SELECT school_id FROM students WHERE id = $1`,
      [studentId],
    );
    if (!rows.length) throw new NotFoundException('Student not found');
    assertSameSchool(user, rows[0].school_id);
    return rows[0].school_id;
  }

  /** Same wire shape the frontend has always consumed. */
  private toReport(a: Attachment) {
    return {
      id: a.id,
      filename: a.file_name,
      mime_type: a.mime_type,
      size_bytes: a.size_bytes,
      created_at: a.created_at,
    };
  }

  @Get()
  async list(@Request() req: { user: User }, @Param('studentId', ParseUUIDPipe) studentId: string) {
    await this.studentSchool(req.user, studentId);
    const rows = await this.attachments.listForEntity('student', studentId, PURPOSE);
    return { success: true, data: rows.map((a) => this.toReport(a)) };
  }

  @Post()
  @RequireClaim('students', 'edit')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: MAX_BYTES } }))
  async upload(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const schoolId = await this.studentSchool(req.user, studentId);
    if (!file) throw new BadRequestException('file is required');
    if (!ALLOWED_MIME.has(file.mimetype)) {
      throw new BadRequestException('Only PDF, JPG or PNG files are allowed');
    }
    const saved = await this.attachments.register({
      file,
      uploadedBy: req.user.id,
      schoolId,
      link: { entityType: 'student', entityId: studentId, purpose: PURPOSE },
    });
    return { success: true, data: this.toReport(saved) };
  }

  @Get(':reportId/file')
  async download(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
    @Res() res: Response,
  ) {
    await this.studentSchool(req.user, studentId);
    await this.attachments.assertLinked(reportId, 'student', studentId, PURPOSE);
    const { row, stream } = await this.attachments.openStream(reportId);
    res.setHeader('Content-Type', row.mime_type);
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,
    );
    stream.pipe(res);
  }

  @Delete(':reportId')
  @RequireClaim('students', 'edit')
  async remove(
    @Request() req: { user: User },
    @Param('studentId', ParseUUIDPipe) studentId: string,
    @Param('reportId', ParseUUIDPipe) reportId: string,
  ) {
    await this.studentSchool(req.user, studentId);
    await this.attachments.assertLinked(reportId, 'student', studentId, PURPOSE);
    await this.attachments.remove(reportId);
    return { success: true };
  }
}
