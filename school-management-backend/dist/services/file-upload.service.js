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
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileUploadService = void 0;
const common_1 = require("@nestjs/common");
const path_1 = require("path");
const fs_1 = require("fs");
let FileUploadService = class FileUploadService {
    constructor() {
        this.uploadPath = './uploads';
        this.allowedImageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
        this.maxFileSize = 5 * 1024 * 1024;
        if (!(0, fs_1.existsSync)(this.uploadPath)) {
            (0, fs_1.mkdirSync)(this.uploadPath, { recursive: true });
        }
        const subdirs = ['students', 'staff', 'documents', 'temp'];
        subdirs.forEach(dir => {
            const dirPath = `${this.uploadPath}/${dir}`;
            if (!(0, fs_1.existsSync)(dirPath)) {
                (0, fs_1.mkdirSync)(dirPath, { recursive: true });
            }
        });
    }
    validateImageFile(file) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        if (file.size > this.maxFileSize) {
            throw new common_1.BadRequestException('File size exceeds 5MB limit');
        }
        const fileExt = (0, path_1.extname)(file.originalname).toLowerCase();
        if (!this.allowedImageTypes.includes(fileExt)) {
            throw new common_1.BadRequestException('Invalid file type. Only images are allowed (jpg, jpeg, png, gif, webp)');
        }
        if (!file.mimetype.startsWith('image/')) {
            throw new common_1.BadRequestException('Invalid file type. Only images are allowed');
        }
    }
    generateFileName(originalName, prefix) {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 15);
        const fileExt = (0, path_1.extname)(originalName).toLowerCase();
        const baseName = prefix ? `${prefix}_${timestamp}_${randomString}` : `${timestamp}_${randomString}`;
        return `${baseName}${fileExt}`;
    }
    getFileUrl(filename, category = 'temp') {
        return `/api/files/${category}/${filename}`;
    }
    getFilePath(filename, category = 'temp') {
        return `${this.uploadPath}/${category}/${filename}`;
    }
    getUploadPath(category = 'temp') {
        return `${this.uploadPath}/${category}`;
    }
    async processStudentPhoto(file, studentId) {
        this.validateImageFile(file);
        const filename = this.generateFileName(file.originalname, `student_${studentId}`);
        const url = this.getFileUrl(filename, 'students');
        const path = this.getFilePath(filename, 'students');
        return { filename, url, path };
    }
    async processStaffPhoto(file, staffId) {
        this.validateImageFile(file);
        const filename = this.generateFileName(file.originalname, `staff_${staffId}`);
        const url = this.getFileUrl(filename, 'staff');
        const path = this.getFilePath(filename, 'staff');
        return { filename, url, path };
    }
    async processDocument(file, documentType) {
        if (!file) {
            throw new common_1.BadRequestException('No file provided');
        }
        const maxDocumentSize = 10 * 1024 * 1024;
        if (file.size > maxDocumentSize) {
            throw new common_1.BadRequestException('File size exceeds 10MB limit');
        }
        const filename = this.generateFileName(file.originalname, documentType);
        const url = this.getFileUrl(filename, 'documents');
        const path = this.getFilePath(filename, 'documents');
        return { filename, url, path };
    }
};
exports.FileUploadService = FileUploadService;
exports.FileUploadService = FileUploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], FileUploadService);
