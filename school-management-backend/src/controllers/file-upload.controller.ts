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
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { existsSync } from 'fs';
import { FileUploadService } from '../services/file-upload.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('files')
export class FileUploadController {
  constructor(private readonly fileUploadService: FileUploadService) {}

  @Post('student/:studentId/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/students';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const studentId = req.params.studentId;
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `student_${studentId}_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadStudentPhoto(
    @Param('studentId') studentId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const result = await this.fileUploadService.processStudentPhoto(file, studentId);
      
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Post('staff/:staffId/photo')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/staff';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const staffId = req.params.staffId;
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `staff_${staffId}_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
          return cb(new BadRequestException('Only image files are allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadStaffPhoto(
    @Param('staffId') staffId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

      const result = await this.fileUploadService.processStaffPhoto(file, staffId);
      
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
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Post('documents')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('document', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadPath = './uploads/documents';
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileExt = file.originalname.split('.').pop();
          const filename = `document_${timestamp}_${randomString}.${fileExt}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  )
  async uploadDocument(@UploadedFile() file: Express.Multer.File) {
    try {
      if (!file) {
        throw new BadRequestException('No file provided');
      }

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
    } catch (error) {
      return {
        success: false,
        message: error.message,
        error: error.name,
      };
    }
  }

  @Get(':category/:filename')
  async getFile(
    @Param('category') category: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const filePath = this.fileUploadService.getFilePath(filename, category);
      
      if (!existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({
          success: false,
          message: 'File not found',
        });
      }

      return res.sendFile(filePath, { root: '.' });
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message,
        error: error.name,
      });
    }
  }
}

