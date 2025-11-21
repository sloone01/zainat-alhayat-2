"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const fs_1 = require("fs");
const file_upload_service_1 = require("../services/file-upload.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let FileUploadController = class FileUploadController {
    fileUploadService;
    constructor(fileUploadService) {
        this.fileUploadService = fileUploadService;
    }
    async uploadStudentPhoto(studentId, file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file provided');
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async uploadStaffPhoto(staffId, file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file provided');
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async uploadDocument(file) {
        try {
            if (!file) {
                throw new common_1.BadRequestException('No file provided');
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
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name,
            };
        }
    }
    async getFile(category, filename, res) {
        try {
            const filePath = this.fileUploadService.getFilePath(filename, category);
            if (!(0, fs_1.existsSync)(filePath)) {
                return res.status(common_1.HttpStatus.NOT_FOUND).json({
                    success: false,
                    message: 'File not found',
                });
            }
            return res.sendFile(filePath, { root: '.' });
        }
        catch (error) {
            return res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message,
                error: error.name,
            });
        }
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('student/:studentId/photo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
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
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('studentId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadStudentPhoto", null);
__decorate([
    (0, common_1.Post)('staff/:staffId/photo'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
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
            fileSize: 5 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new common_1.BadRequestException('Only image files are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Param)('staffId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadStaffPhoto", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document', {
        storage: (0, multer_1.diskStorage)({
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
            fileSize: 10 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(':category/:filename'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFile", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map