import { Injectable, BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

@Injectable()
export class FileUploadService {
  private readonly uploadPath = './uploads';
  private readonly allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadPath)) {
      mkdirSync(this.uploadPath, { recursive: true });
    }

    // Create subdirectories
    const subdirs = ['students', 'staff', 'documents', 'temp'];
    subdirs.forEach(dir => {
      const dirPath = `${this.uploadPath}/${dir}`;
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath, { recursive: true });
      }
    });
  }

  validateImageFile(file: Express.Multer.File): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('File size exceeds 5MB limit');
    }

    // Check file type
    const fileExt = extname(file.originalname).toLowerCase();
    if (!this.allowedImageTypes.includes(fileExt)) {
      throw new BadRequestException('Invalid file type. Only images are allowed (jpg, jpeg, png, gif, webp)');
    }

    // Check MIME type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Invalid file type. Only images are allowed');
    }
  }

  generateFileName(originalName: string, prefix?: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = extname(originalName).toLowerCase();
    const baseName = prefix ? `${prefix}_${timestamp}_${randomString}` : `${timestamp}_${randomString}`;
    return `${baseName}${fileExt}`;
  }

  getFileUrl(filename: string, category: string = 'temp'): string {
    return `/api/files/${category}/${filename}`;
  }

  getFilePath(filename: string, category: string = 'temp'): string {
    return `${this.uploadPath}/${category}/${filename}`;
  }

  getUploadPath(category: string = 'temp'): string {
    return `${this.uploadPath}/${category}`;
  }

  async processStudentPhoto(file: Express.Multer.File, studentId: string): Promise<{
    filename: string;
    url: string;
    path: string;
  }> {
    this.validateImageFile(file);
    
    const filename = this.generateFileName(file.originalname, `student_${studentId}`);
    const url = this.getFileUrl(filename, 'students');
    const path = this.getFilePath(filename, 'students');

    return { filename, url, path };
  }

  async processStaffPhoto(file: Express.Multer.File, staffId: string): Promise<{
    filename: string;
    url: string;
    path: string;
  }> {
    this.validateImageFile(file);
    
    const filename = this.generateFileName(file.originalname, `staff_${staffId}`);
    const url = this.getFileUrl(filename, 'staff');
    const path = this.getFilePath(filename, 'staff');

    return { filename, url, path };
  }

  async processDocument(file: Express.Multer.File, documentType: string): Promise<{
    filename: string;
    url: string;
    path: string;
  }> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // Check file size (10MB for documents)
    const maxDocumentSize = 10 * 1024 * 1024;
    if (file.size > maxDocumentSize) {
      throw new BadRequestException('File size exceeds 10MB limit');
    }

    const filename = this.generateFileName(file.originalname, documentType);
    const url = this.getFileUrl(filename, 'documents');
    const path = this.getFilePath(filename, 'documents');

    return { filename, url, path };
  }
}

