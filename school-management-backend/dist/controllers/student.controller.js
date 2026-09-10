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
var StudentController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentController = void 0;
const common_1 = require("@nestjs/common");
const student_service_1 = require("../services/student.service");
const student_register_dto_1 = require("../dto/student-register.dto");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
const student_charge_sheet_service_1 = require("../services/student-charge-sheet.service");
let StudentController = StudentController_1 = class StudentController {
    studentService;
    chargeSheets;
    logger = new common_1.Logger(StudentController_1.name);
    constructor(studentService, chargeSheets) {
        this.studentService = studentService;
        this.chargeSheets = chargeSheets;
    }
    schoolOf(req) {
        return (0, school_access_1.resolveActorSchoolId)(req.user);
    }
    async refreshChargeSheetQuietly(user, studentId) {
        try {
            await this.chargeSheets.buildOrRefresh(user, studentId);
        }
        catch (err) {
            if (err instanceof common_1.BadRequestException) {
                const res = err.getResponse();
                const code = typeof res === 'object' && res && 'code' in res
                    ? String(res.code || '')
                    : '';
                if (code === 'STUDENT_NO_GRADE')
                    return;
            }
            this.logger.warn(`Charge sheet refresh skipped for student ${studentId}: ${err instanceof Error ? err.message : String(err)}`);
        }
    }
    async create(req, createStudentDto) {
        const schoolId = this.schoolOf(req);
        const student = await this.studentService.create(createStudentDto, schoolId);
        return {
            success: true,
            data: student,
            message: 'Student created successfully',
        };
    }
    async registerInApp(req, dto) {
        const student = await this.studentService.registerInApp(dto, req.user);
        return {
            success: true,
            data: student,
            message: 'Student registered successfully',
        };
    }
    async findAll(req, page, limit, q, feeLevel) {
        const schoolId = this.schoolOf(req);
        if (page != null && String(page).trim() !== '') {
            const data = await this.studentService.findPage(schoolId, {
                page: Number(page),
                limit: limit != null ? Number(limit) : undefined,
                q,
                fee_level: feeLevel === 'with' || feeLevel === 'without' || feeLevel === 'all'
                    ? feeLevel
                    : 'all',
            });
            return { success: true, data };
        }
        const students = await this.studentService.findAll(schoolId);
        return {
            success: true,
            data: students,
            count: students.length,
        };
    }
    async search(req, query) {
        if (!query) {
            throw new common_1.BadRequestException('Search query is required');
        }
        const students = await this.studentService.searchStudents(query, this.schoolOf(req));
        return {
            success: true,
            data: students,
            count: students.length,
        };
    }
    async findByGroup(req, groupId) {
        const students = await this.studentService.findByGroup(groupId, this.schoolOf(req));
        return { success: true, data: students, count: students.length };
    }
    async findByBus(req, busId) {
        const students = await this.studentService.findByBus(busId, this.schoolOf(req));
        return { success: true, data: students, count: students.length };
    }
    async findByParent(req, parentId) {
        const students = await this.studentService.findByParent(parentId, this.schoolOf(req));
        return { success: true, data: students, count: students.length };
    }
    async findOne(req, id) {
        const student = await this.studentService.findOne(id, this.schoolOf(req));
        return { success: true, data: student };
    }
    async getProgress(req, id) {
        await this.studentService.findOne(id, this.schoolOf(req));
        const studentProgress = await this.studentService.getStudentProgress(id);
        return { success: true, data: studentProgress };
    }
    async update(req, id, updateStudentDto) {
        await this.studentService.findOne(id, this.schoolOf(req));
        const student = await this.studentService.update(id, updateStudentDto);
        return {
            success: true,
            data: student,
            message: 'Student updated successfully',
        };
    }
    async assignToGroup(req, id, body) {
        await this.studentService.findOne(id, this.schoolOf(req));
        const student = await this.studentService.assignToGroup(id, body.groupId, {
            paymentLevelId: body.paymentLevelId,
            replaceExistingGroups: body.replaceExistingGroups === true,
        });
        await this.refreshChargeSheetQuietly(req.user, id);
        return {
            success: true,
            data: student,
            message: 'Student assigned to group successfully',
        };
    }
    async assignToBus(req, id, busId) {
        await this.studentService.findOne(id, this.schoolOf(req));
        const student = await this.studentService.assignToBus(id, busId);
        await this.refreshChargeSheetQuietly(req.user, id);
        return {
            success: true,
            data: student,
            message: 'Student assigned to bus successfully',
        };
    }
    async removeFromBus(req, id, busId) {
        await this.studentService.findOne(id, this.schoolOf(req));
        const student = await this.studentService.removeFromBus(id, busId);
        await this.refreshChargeSheetQuietly(req.user, id);
        return {
            success: true,
            data: student,
            message: 'Student removed from bus successfully',
        };
    }
    async remove(req, id) {
        await this.studentService.findOne(id, this.schoolOf(req));
        await this.studentService.remove(id);
        return {
            success: true,
            message: 'Student deleted successfully',
        };
    }
};
exports.StudentController = StudentController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('students', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, student_register_dto_1.RegisterStudentInAppDto]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "registerInApp", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('q')),
    __param(4, (0, common_1.Query)('fee_level')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('q')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('group/:groupId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('groupId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "findByGroup", null);
__decorate([
    (0, common_1.Get)('bus/:busId'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'students', action: 'view' }, { page: 'transportation', action: 'view' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('busId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "findByBus", null);
__decorate([
    (0, common_1.Get)('parent/:parentId'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('parentId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "findByParent", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/progress'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "getProgress", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/assign-group'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "assignToGroup", null);
__decorate([
    (0, common_1.Patch)(':id/assign-bus'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'students', action: 'edit' }, { page: 'transportation', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('busId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "assignToBus", null);
__decorate([
    (0, common_1.Patch)(':id/remove-bus'),
    (0, require_claim_decorator_1.RequireAnyClaim)({ page: 'students', action: 'edit' }, { page: 'transportation', action: 'edit' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('busId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "removeFromBus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('students', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], StudentController.prototype, "remove", null);
exports.StudentController = StudentController = StudentController_1 = __decorate([
    (0, common_1.Controller)('students'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, require_claim_decorator_1.RequireClaim)('students', 'view'),
    __metadata("design:paramtypes", [student_service_1.StudentService,
        student_charge_sheet_service_1.StudentChargeSheetService])
], StudentController);
//# sourceMappingURL=student.controller.js.map