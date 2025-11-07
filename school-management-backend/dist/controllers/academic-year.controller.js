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
exports.AcademicYearController = void 0;
const common_1 = require("@nestjs/common");
const academic_year_service_1 = require("../services/academic-year.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
let AcademicYearController = class AcademicYearController {
    constructor(academicYearService) {
        this.academicYearService = academicYearService;
    }
    async create(createAcademicYearDto) {
        try {
            const academicYear = await this.academicYearService.create(createAcademicYearDto);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year created successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findAll(schoolId) {
        try {
            const academicYears = await this.academicYearService.findAll(schoolId ? parseInt(schoolId) : undefined);
            return {
                success: true,
                data: academicYears,
                count: academicYears.length
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findActive(schoolId) {
        try {
            const activeYear = await this.academicYearService.findActive(schoolId ? parseInt(schoolId) : undefined);
            return {
                success: true,
                data: activeYear
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async getStatistics(schoolId) {
        try {
            const statistics = await this.academicYearService.getStatistics(schoolId ? parseInt(schoolId) : undefined);
            return {
                success: true,
                data: statistics
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async findOne(id) {
        try {
            const academicYear = await this.academicYearService.findOne(id);
            return {
                success: true,
                data: academicYear
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async update(id, updateAcademicYearDto) {
        try {
            const academicYear = await this.academicYearService.update(id, updateAcademicYearDto);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year updated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async setActive(id) {
        try {
            const academicYear = await this.academicYearService.setActive(id);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year activated successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async archive(id) {
        try {
            const academicYear = await this.academicYearService.archive(id);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year archived successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
    async remove(id) {
        try {
            await this.academicYearService.remove(id);
            return {
                success: true,
                message: 'Academic year deleted successfully'
            };
        }
        catch (error) {
            return {
                success: false,
                message: error.message,
                error: error.name
            };
        }
    }
};
exports.AcademicYearController = AcademicYearController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "setActive", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "remove", null);
exports.AcademicYearController = AcademicYearController = __decorate([
    (0, common_1.Controller)('academic-years'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [academic_year_service_1.AcademicYearService])
], AcademicYearController);
