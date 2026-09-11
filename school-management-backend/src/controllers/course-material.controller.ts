import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { CourseMaterialService } from '../services/course-material.service';
import {
  COURSE_MATERIAL_ALLOWED_EXTS,
  COURSE_MATERIAL_MAX_BYTES,
} from '../constants/course-materials';
import { User } from '../entities/user.entity';
import {
  isParentOrStudentActor,
  resolveActorSchoolId,
  RequestedSchoolIdPipe,
} from '../common/security/school-access';

@Controller('course-materials')
@UseGuards(JwtAuthGuard)
export class CourseMaterialController {
  constructor(private readonly materials: CourseMaterialService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) {
      throw new BadRequestException('school_id is required');
    }
    return schoolId;
  }

  @Get('courses')
  async listCourses(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
  ) {
    const scopedSchoolId = isParentOrStudentActor(req.user)
      ? schoolId || null
      : this.schoolOf(req, schoolId);
    const data = await this.materials.listAccessibleCourses(
      req.user,
      scopedSchoolId,
    );
    return { success: true, data, count: data.length };
  }

  @Get('board')
  async board(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
    const scopedSchoolId = isParentOrStudentActor(req.user)
      ? schoolId || null
      : this.schoolOf(req, schoolId);
    const data = await this.materials.getBoard(
      req.user,
      scopedSchoolId,
      courseId,
    );
    return { success: true, data };
  }

  @Post('topics')
  @RequireClaim('courses', 'create')
  async createTopic(
    @Request() req: { user: User },
    @Body('school_id') schoolIdRaw: string,
    @Body('course_id') courseId: string,
    @Body('title') title: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('course_id is required');
    }
    const schoolId = this.schoolOf(req, schoolIdRaw);
    const data = await this.materials.createTopic(
      req.user,
      schoolId,
      courseId,
      title,
    );
    return { success: true, data };
  }

  @Patch('topics/:topicId')
  @RequireClaim('courses', 'edit')
  async updateTopic(
    @Request() req: { user: User },
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
    @Body('title') title: string,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    const data = await this.materials.updateTopic(
      req.user,
      scopedSchoolId,
      topicId,
      title,
    );
    return { success: true, data };
  }

  @Delete('topics/:topicId')
  @RequireClaim('courses', 'delete')
  async removeTopic(
    @Request() req: { user: User },
    @Param('topicId', ParseUUIDPipe) topicId: string,
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    await this.materials.removeTopic(req.user, scopedSchoolId, topicId);
    return { success: true, message: 'Topic deleted' };
  }

  @Get()
  async list(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
    const scopedSchoolId = isParentOrStudentActor(req.user)
      ? schoolId || null
      : this.schoolOf(req, schoolId);
    const data = await this.materials.listForCourse(
      req.user,
      scopedSchoolId,
      courseId,
    );
    return { success: true, data, count: data.length };
  }

  @Post('upload')
  @RequireClaim('courses', 'create')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dir = './uploads/course-materials';
          if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
          cb(null, dir);
        },
        filename: (_req, file, cb) => {
          const timestamp = Date.now();
          const random = Math.random().toString(36).slice(2, 12);
          const ext = extname(file.originalname || '').toLowerCase() || '.bin';
          cb(null, `cm_${timestamp}_${random}${ext}`);
        },
      }),
      limits: { fileSize: COURSE_MATERIAL_MAX_BYTES },
      fileFilter: (_req, file, cb) => {
        const ext = extname(file.originalname || '').toLowerCase();
        if (!(COURSE_MATERIAL_ALLOWED_EXTS as readonly string[]).includes(ext)) {
          return cb(
            new BadRequestException(
              `Invalid file type. Allowed: ${COURSE_MATERIAL_ALLOWED_EXTS.join(', ')}`,
            ) as any,
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  async upload(
    @Request() req: { user: User },
    @UploadedFile() file: Express.Multer.File,
    @Body('school_id') schoolIdRaw: string,
    @Body('course_id') courseId: string,
    @Body('title') title: string,
    @Body('description') description?: string,
    @Body('phase_id') phaseId?: string,
    @Body('topic_id') topicId?: string,
  ) {
    if (!courseId) {
      throw new BadRequestException('course_id is required');
    }
    const schoolId = this.schoolOf(req, schoolIdRaw);
    if (!file) throw new BadRequestException('No file provided');

    const data = await this.materials.createFromUpload(
      req.user,
      schoolId,
      courseId,
      file,
      title,
      description,
      phaseId,
      topicId,
    );
    return { success: true, data, message: 'Material uploaded' };
  }

  @Patch(':id')
  @RequireClaim('courses', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
    @Body()
    body: { title?: string; description?: string | null; is_visible?: boolean },
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    const data = await this.materials.updateMeta(
      req.user,
      scopedSchoolId,
      id,
      body,
    );
    return { success: true, data };
  }

  @Delete(':id')
  @RequireClaim('courses', 'delete')
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
  ) {
    const scopedSchoolId = this.schoolOf(req, schoolId);
    await this.materials.remove(req.user, scopedSchoolId, id);
    return { success: true, message: 'Material deleted' };
  }

  @Get(':id/download')
  async download(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) schoolId: string,
    @Res() res: Response,
  ) {
    const scopedSchoolId = isParentOrStudentActor(req.user)
      ? schoolId || null
      : this.schoolOf(req, schoolId);
    const { material, stream } = await this.materials.getForDownload(
      req.user,
      scopedSchoolId,
      id,
    );
    const safeName = encodeURIComponent(material.original_filename).replace(
      /['()]/g,
      '_',
    );
    res.setHeader(
      'Content-Type',
      material.mime_type || 'application/octet-stream',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${safeName}`,
    );
    if (material.file_size) {
      res.setHeader('Content-Length', String(material.file_size));
    }
    stream.pipe(res);
  }
}
