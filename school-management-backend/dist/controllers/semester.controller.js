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
exports.SemesterController = void 0;
const common_1 = require("@nestjs/common");
const semester_service_1 = require("../services/semester.service");
const academic_year_service_1 = require("../services/academic-year.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let SemesterController = class SemesterController {
    semesterService;
    academicYearService;
    constructor(semesterService, academicYearService) {
        this.semesterService = semesterService;
        this.academicYearService = academicYearService;
    }
    schoolOf(req, requested) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user, requested);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async assertAcademicYearAccess(req, academicYearId) {
        const academicYear = await this.academicYearService.findOne(academicYearId);
        (0, school_access_1.assertSameSchool)(req.user, academicYear.school_id);
        return academicYear;
    }
    async assertSemesterAccess(req, id) {
        const semester = await this.semesterService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, semester.academicYear?.school_id);
        return semester;
    }
    async create(req, createSemesterDto) {
        try {
            const schoolId = this.schoolOf(req);
            await this.assertAcademicYearAccess(req, createSemesterDto.academic_year_id);
            const semester = await this.semesterService.create(createSemesterDto, schoolId);
            return {
                success: true,
                data: semester,
                message: 'Semester created successfully',
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
    async findAll(req, academicYearId, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? String(schoolId) : undefined);
            if (academicYearId) {
                await this.assertAcademicYearAccess(req, academicYearId);
            }
            const semesters = await this.semesterService.findAll(resolvedSchoolId, academicYearId);
            return {
                success: true,
                data: semesters,
                count: semesters.length,
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
    async findCurrentSemester(req, academicYearId, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? String(schoolId) : undefined);
            if (academicYearId) {
                await this.assertAcademicYearAccess(req, academicYearId);
            }
            const currentSemester = await this.semesterService.findCurrentSemester(resolvedSchoolId, academicYearId);
            return {
                success: true,
                data: currentSemester,
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
    async getStatistics(req, academicYearId, schoolId) {
        try {
            const resolvedSchoolId = this.schoolOf(req, schoolId ? String(schoolId) : undefined);
            if (academicYearId) {
                await this.assertAcademicYearAccess(req, academicYearId);
            }
            const statistics = await this.semesterService.getStatistics(resolvedSchoolId, academicYearId);
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
    async findByAcademicYear(req, academicYearId) {
        try {
            await this.assertAcademicYearAccess(req, academicYearId);
            const semesters = await this.semesterService.findByAcademicYear(academicYearId);
            return {
                success: true,
                data: semesters,
                count: semesters.length,
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
    async validateSemesterOrder(req, academicYearId) {
        try {
            await this.assertAcademicYearAccess(req, academicYearId);
            const validation = await this.semesterService.validateSemesterOrder(academicYearId);
            return {
                success: true,
                data: validation,
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
            const semester = await this.assertSemesterAccess(req, id);
            return {
                success: true,
                data: semester,
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
    async update(req, id, updateSemesterDto) {
        try {
            await this.assertSemesterAccess(req, id);
            const semester = await this.semesterService.update(id, updateSemesterDto);
            return {
                success: true,
                data: semester,
                message: 'Semester updated successfully',
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
    async activate(req, id) {
        try {
            await this.assertSemesterAccess(req, id);
            const semester = await this.semesterService.activate(id);
            return {
                success: true,
                data: semester,
                message: 'Semester activated successfully',
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
            await this.assertSemesterAccess(req, id);
            await this.semesterService.remove(id);
            return {
                success: true,
                message: 'Semester deleted successfully',
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
exports.SemesterController = SemesterController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('current'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "findCurrentSemester", null);
__decorate([
    (0, common_1.Get)('statistics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('academicYearId')),
    __param(2, (0, common_1.Query)('schoolId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Get)('academic-year/:academicYearId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "findByAcademicYear", null);
__decorate([
    (0, common_1.Get)('academic-year/:academicYearId/validate'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('academicYearId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "validateSemesterOrder", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/activate'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "activate", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'manage'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], SemesterController.prototype, "remove", null);
exports.SemesterController = SemesterController = __decorate([
    (0, common_1.Controller)('semesters'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('settings', 'view'),
    __metadata("design:paramtypes", [semester_service_1.SemesterService,
        academic_year_service_1.AcademicYearService])
], SemesterController);
//# sourceMappingURL=semester.controller.js.map