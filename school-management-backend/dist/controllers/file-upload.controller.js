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
const path_1 = require("path");
const crypto_1 = require("crypto");
const file_upload_service_1 = require("../services/file-upload.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const student_service_1 = require("../services/student.service");
const user_service_1 = require("../services/user.service");
const school_access_1 = require("../common/security/school-access");
let FileUploadController = class FileUploadController {
    fileUploadService;
    studentService;
    userService;
    constructor(fileUploadService, studentService, userService) {
        this.fileUploadService = fileUploadService;
        this.studentService = studentService;
        this.userService = userService;
    }
    async uploadStudentPhoto(req, studentId, file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user);
        const student = await this.studentService.findOne(studentId, schoolId);
        (0, school_access_1.assertSameSchool)(req.user, student.school_id);
        await this.fileUploadService.processStudentPhoto(file, studentId);
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
    async uploadStaffPhoto(req, staffId, file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
        const staff = await this.userService.findOne(staffId);
        (0, school_access_1.assertSameSchool)(req.user, staff.school_id);
        await this.fileUploadService.processStaffPhoto(file, staffId);
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
    async uploadDocument(file) {
        if (!file)
            throw new common_1.BadRequestException('No file provided');
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
    async getFile(category, filename, res) {
        const filePath = this.fileUploadService.getFilePath(filename, category);
        const absolute = (0, path_1.resolve)(filePath);
        if (!(0, fs_1.existsSync)(absolute)) {
            return res.status(common_1.HttpStatus.NOT_FOUND).json({
                success: false,
                message: 'File not found',
            });
        }
        const lower = filename.toLowerCase();
        const isImage = /\.(png|jpe?g|gif|webp)$/i.test(lower);
        if (!isImage) {
            res.setHeader('Content-Disposition', `attachment; filename="${(0, path_1.basename)(filename)}"`);
            res.setHeader('Content-Type', 'application/octet-stream');
        }
        return res.sendFile(absolute);
    }
};
exports.FileUploadController = FileUploadController;
__decorate([
    (0, common_1.Post)('student/:studentId/photo'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                cb(null, './uploads/students');
            },
            filename: (req, file, cb) => {
                const studentId = (0, path_1.basename)(String(req.params.studentId || 'x'));
                const ext = (0, path_1.basename)(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
                cb(null, `student_${studentId}_${Date.now()}_${(0, crypto_1.randomUUID)()}.${ext}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
                return cb(new common_1.BadRequestException('Only PNG, JPEG, GIF, or WebP images are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('studentId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadStudentPhoto", null);
__decorate([
    (0, common_1.Post)('staff/:staffId/photo'),
    (0, require_claim_decorator_1.RequireClaim)('users', 'edit'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('photo', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                cb(null, './uploads/staff');
            },
            filename: (req, file, cb) => {
                const staffId = (0, path_1.basename)(String(req.params.staffId || 'x'));
                const ext = (0, path_1.basename)(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
                cb(null, `staff_${staffId}_${Date.now()}_${(0, crypto_1.randomUUID)()}.${ext}`);
            },
        }),
        limits: { fileSize: 5 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            if (!/^image\/(png|jpe?g|gif|webp)$/i.test(file.mimetype)) {
                return cb(new common_1.BadRequestException('Only PNG, JPEG, GIF, or WebP images are allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('staffId')),
    __param(2, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadStaffPhoto", null);
__decorate([
    (0, common_1.Post)('documents'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'students', action: 'edit' }, { page: 'enrollments', action: 'edit' }, { page: 'users', action: 'edit' }),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('document', {
        storage: (0, multer_1.diskStorage)({
            destination: (_req, _file, cb) => {
                cb(null, './uploads/documents');
            },
            filename: (_req, file, cb) => {
                const ext = (0, path_1.basename)(file.originalname).split('.').pop()?.replace(/[^a-zA-Z0-9]/g, '') || 'bin';
                cb(null, `document_${Date.now()}_${(0, crypto_1.randomUUID)()}.${ext}`);
            },
        }),
        limits: { fileSize: 10 * 1024 * 1024 },
        fileFilter: (_req, file, cb) => {
            const allowed = new Set([
                'application/pdf',
                'image/jpeg',
                'image/png',
                'image/webp',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            ]);
            if (!allowed.has(file.mimetype)) {
                return cb(new common_1.BadRequestException('File type not allowed'), false);
            }
            cb(null, true);
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "uploadDocument", null);
__decorate([
    (0, common_1.Get)(':category/:filename'),
    (0, common_1.Header)('Cache-Control', 'private, no-store'),
    __param(0, (0, common_1.Param)('category')),
    __param(1, (0, common_1.Param)('filename')),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], FileUploadController.prototype, "getFile", null);
exports.FileUploadController = FileUploadController = __decorate([
    (0, common_1.Controller)('files'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [file_upload_service_1.FileUploadService,
        student_service_1.StudentService,
        user_service_1.UserService])
], FileUploadController);
//# sourceMappingURL=file-upload.controller.js.map