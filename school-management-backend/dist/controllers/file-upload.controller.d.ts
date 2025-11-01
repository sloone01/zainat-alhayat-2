import type { Response } from 'express';
import { FileUploadService } from '../services/file-upload.service';
export declare class FileUploadController {
    private readonly fileUploadService;
    constructor(fileUploadService: FileUploadService);
    uploadStudentPhoto(studentId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            filename: string;
            url: string;
            originalName: string;
            size: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    uploadStaffPhoto(staffId: string, file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            filename: string;
            url: string;
            originalName: string;
            size: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    uploadDocument(file: Express.Multer.File): Promise<{
        success: boolean;
        data: {
            filename: string;
            url: string;
            originalName: string;
            size: number;
        };
        message: string;
        error?: undefined;
    } | {
        success: boolean;
        message: any;
        error: any;
        data?: undefined;
    }>;
    getFile(category: string, filename: string, res: Response): Promise<void | Response<any, Record<string, any>>>;
}
