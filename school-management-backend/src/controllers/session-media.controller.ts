import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionMediaService, CreateSessionMediaDto, UpdateSessionMediaDto } from '../services/session-media.service';
import { SessionMedia } from '../entities/session-media.entity';

@Controller('session-media')
@UseGuards(JwtAuthGuard)
export class SessionMediaController {
  constructor(private readonly sessionMediaService: SessionMediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/session-media';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `session_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB for videos
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/', 'video/'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (!isAllowed) {
          return cb(new BadRequestException('Only image and video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('session_plan_id') sessionPlanId: string,
    @Body('uploaded_by') uploadedBy: string,
  ): Promise<{ success: boolean; data: SessionMedia | null; message: string }> {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      if (!sessionPlanId || !uploadedBy) {
        throw new BadRequestException('session_plan_id and uploaded_by are required');
      }

      const createDto: CreateSessionMediaDto = {
        session_plan_id: sessionPlanId,
        file_name: file.originalname,
        file_path: `/api/files/session-media/${file.filename}`,
        file_type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: uploadedBy,
      };

      const media = await this.sessionMediaService.create(createDto);

      return {
        success: true,
        data: media,
        message: 'File uploaded successfully',
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        message: error.message,
      };
    }
  }

  @Post('upload-multiple')
  @UseInterceptors(
    FilesInterceptor('files', 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/session-media';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `session_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 50 * 1024 * 1024, // 50MB per file
      },
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/', 'video/'];
        const isAllowed = allowedTypes.some(type => file.mimetype.startsWith(type));
        
        if (!isAllowed) {
          return cb(new BadRequestException('Only image and video files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('session_plan_id') sessionPlanId: string,
    @Body('uploaded_by') uploadedBy: string,
  ): Promise<{ success: boolean; data: SessionMedia[]; message: string }> {
    try {
      console.log('📁 Backend: Uploading', files?.length || 0, 'files for session:', sessionPlanId);

      if (!files || files.length === 0) {
        throw new BadRequestException('No files provided');
      }

      if (!sessionPlanId || !uploadedBy) {
        throw new BadRequestException('session_plan_id and uploaded_by are required');
      }

      // Note: Using fixed session plan ID that exists in database

      const createDtos: CreateSessionMediaDto[] = files.map(file => ({
        session_plan_id: sessionPlanId,
        file_name: file.originalname,
        file_path: `/api/files/session-media/${file.filename}`,
        file_type: file.mimetype.startsWith('image/') ? 'photo' : 'video',
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: uploadedBy,
      }));

      const media = await this.sessionMediaService.createMultiple(createDtos);

      return {
        success: true,
        data: media,
        message: `${files.length} files uploaded successfully`,
      };
    } catch (error) {
      console.error('❌ Backend upload error:', error);
      throw new BadRequestException(error.message || 'File upload failed');
    }
  }

  @Get('session/:sessionPlanId')
  async getMediaBySessionPlan(@Param('sessionPlanId') sessionPlanId: string): Promise<SessionMedia[]> {
    return await this.sessionMediaService.findBySessionPlanId(sessionPlanId);
  }

  @Get(':id')
  async getMediaById(@Param('id') id: number): Promise<SessionMedia> {
    return await this.sessionMediaService.findById(id);
  }

  @Delete(':id')
  async deleteMedia(@Param('id') id: number): Promise<{ success: boolean; message: string }> {
    try {
      await this.sessionMediaService.delete(id);
      return {
        success: true,
        message: 'Media deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        message: error.message,
      };
    }
  }
}
