export declare class FileUploadService {
    private readonly uploadPath;
    private readonly allowedImageTypes;
    private readonly maxFileSize;
    constructor();
    validateImageFile(file: Express.Multer.File): void;
    generateFileName(originalName: string, prefix?: string): string;
    getFileUrl(filename: string, category?: string): string;
    getFilePath(filename: string, category?: string): string;
    getUploadPath(category?: string): string;
    processStudentPhoto(file: Express.Multer.File, studentId: string): Promise<{
        filename: string;
        url: string;
        path: string;
    }>;
    processStaffPhoto(file: Express.Multer.File, staffId: string): Promise<{
        filename: string;
        url: string;
        path: string;
    }>;
    processDocument(file: Express.Multer.File, documentType: string): Promise<{
        filename: string;
        url: string;
        path: string;
    }>;
}
