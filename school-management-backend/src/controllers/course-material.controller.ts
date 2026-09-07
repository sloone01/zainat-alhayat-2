import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
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
import { CourseMaterialService } from '../services/course-material.service';
import {
  COURSE_MATERIAL_ALLOWED_EXTS,
  COURSE_MATERIAL_MAX_BYTES,
} from '../constants/course-materials';

@Controller('course-materials')
@UseGuards(JwtAuthGuard)
export class CourseMaterialController {
  constructor(private readonly materials: CourseMaterialService) {}

  @Get('courses')
  async listCourses(
    @Request() req: any,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    const data = await this.materials.listAccessibleCourses(
      req.user,
      schoolId,
    );
    return { success: true, data, count: data.length };
  }

  @Get()
  async list(
    @Request() req: any,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Query('course_id', ParseUUIDPipe) courseId: string,
  ) {
    const data = await this.materials.listForCourse(
      req.user,
      schoolId,
      courseId,
    );
    return { success: true, data, count: data.length };
  }

  @Post('upload')
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
    @Request() req: any,
    @UploadedFile() file: Express.Multer.File,
    @Body('school_id') schoolIdRaw: string,
    @Body('course_id') courseId: string,
    @Body('title') title: string,
    @Body('description') description?: string,
  ) {
    const schoolId = Number(schoolIdRaw);
    if (!Number.isFinite(schoolId) || !courseId) {
      throw new BadRequestException('school_id and course_id are required');
    }
    if (!file) throw new BadRequestException('No file provided');

    const data = await this.materials.createFromUpload(
      req.user,
      schoolId,
      courseId,
      file,
      title,
      description,
    );
    return { success: true, data, message: 'Material uploaded' };
  }

  @Patch(':id')
  async update(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Body()
    body: { title?: string; description?: string | null; is_visible?: boolean },
  ) {
    const data = await this.materials.updateMeta(
      req.user,
      schoolId,
      id,
      body,
    );
    return { success: true, data };
  }

  @Delete(':id')
  async remove(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
  ) {
    await this.materials.remove(req.user, schoolId, id);
    return { success: true, message: 'Material deleted' };
  }

  @Get(':id/download')
  async download(
    @Request() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseIntPipe) schoolId: number,
    @Res() res: Response,
  ) {
    const { material, stream } = await this.materials.getForDownload(
      req.user,
      schoolId,
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
