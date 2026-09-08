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
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let AcademicYearController = class AcademicYearController {
    academicYearService;
    constructor(academicYearService) {
        this.academicYearService = academicYearService;
    }
    schoolOf(req, requested) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user, requested);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async assertYearAccess(req, id) {
        const academicYear = await this.academicYearService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, academicYear.school_id);
        return academicYear;
    }
    async create(req, createAcademicYearDto, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId != null ? parseInt(schoolId, 10) : createAcademicYearDto.school_id);
            const academicYear = await this.academicYearService.create({
                ...createAcademicYearDto,
                school_id: resolvedSchoolId,
            });
            return {
                success: true,
                data: academicYear,
                message: 'Academic year created successfully',
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
    async findAll(req, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
            const academicYears = await this.academicYearService.findAll(resolvedSchoolId);
            return {
                success: true,
                data: academicYears,
                count: academicYears.length,
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
    async findActive(req, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
            const activeYear = await this.academicYearService.findActive(resolvedSchoolId);
            return {
                success: true,
                data: activeYear,
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
    async getStatistics(req, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? parseInt(schoolId, 10) : undefined);
            const statistics = await this.academicYearService.getStatistics(resolvedSchoolId);
            return {
                success: true,
                data: statistics,
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
    async findOne(req, id) {
        try {
            const academicYear = await this.assertYearAccess(req, id);
            return {
                success: true,
                data: academicYear,
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
    async update(req, id, updateAcademicYearDto) {
        try {
            await this.assertYearAccess(req, id);
            const academicYear = await this.academicYearService.update(id, updateAcademicYearDto);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year updated successfully',
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
    async setActive(req, id) {
        try {
            await this.assertYearAccess(req, id);
            const academicYear = await this.academicYearService.setActive(id);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year activated successfully',
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
    async archive(req, id) {
        try {
            await this.assertYearAccess(req, id);
            const academicYear = await this.academicYearService.archive(id);
            return {
                success: true,
                data: academicYear,
                message: 'Academic year archived successfully',
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
    async remove(req, id) {
        try {
            await this.assertYearAccess(req, id);
            await this.academicYearService.remove(id);
            return {
                success: true,
                message: 'Academic year deleted successfully',
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
};
exports.AcademicYearController = AcademicYearController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "setActive", null);
__decorate([
    (0, common_1.Patch)(':id/archive'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "archive", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AcademicYearController.prototype, "remove", null);
exports.AcademicYearController = AcademicYearController = __decorate([
    (0, common_1.Controller)('academic-years'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'view'),
    __metadata("design:paramtypes", [academic_year_service_1.AcademicYearService])
], AcademicYearController);
//# sourceMappingURL=academic-year.controller.js.map