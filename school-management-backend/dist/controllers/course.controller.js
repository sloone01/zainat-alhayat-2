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
var CourseController_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseController = void 0;
const common_1 = require("@nestjs/common");
const course_service_1 = require("../services/course.service");
const require_claim_decorator_1 = require("../rbac/require-claim.decorator");
const school_access_1 = require("../common/security/school-access");
let CourseController = CourseController_1 = class CourseController {
    courseService;
    logger = new common_1.Logger(CourseController_1.name);
    constructor(courseService) {
        this.courseService = courseService;
    }
    schoolOf(req, requested) {
        const schoolId = (0, school_access_1.resolveActorSchoolId)(req.user, requested);
        if (schoolId == null) {
            throw new common_1.BadRequestException('school_id is required');
        }
        return schoolId;
    }
    async create(req, createCourseDto) {
        const schoolId = this.schoolOf(req, createCourseDto.school_id);
        createCourseDto.school_id = schoolId;
        this.logger.log(`POST /courses - Creating course: ${JSON.stringify(createCourseDto)}`);
        try {
            const course = await this.courseService.create(createCourseDto);
            this.logger.log(`POST /courses - Course created successfully with id: ${course.id}`);
            return {
                success: true,
                data: course,
                message: 'Course created successfully',
            };
        }
        catch (error) {
            this.logger.error(`POST /courses - Error creating course: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(req, schoolId, courseKind) {
        const requested = schoolId ? parseInt(schoolId, 10) : undefined;
        const schoolIdNum = this.schoolOf(req, requested);
        this.logger.log(`GET /courses - school_id: ${schoolIdNum}, course_kind: ${courseKind ?? 'any'}`);
        try {
            const courses = await this.courseService.findAll(schoolIdNum, courseKind);
            this.logger.log(`GET /courses - Retrieved ${courses.length} courses for school_id: ${schoolIdNum}`);
            return {
                success: true,
                data: courses,
                message: courses.length > 0 ? 'Courses retrieved successfully' : 'No courses found in database',
                count: courses.length
            };
        }
        catch (error) {
            this.logger.error(`GET /courses - Database error: ${error.message}`, error.stack);
            return {
                success: false,
                data: [],
                message: error.message,
                error: 'DATABASE_ERROR',
                count: 0
            };
        }
    }
    async search(req, schoolId, searchTerm) {
        const scopedSchoolId = this.schoolOf(req, schoolId);
        return {
            success: true,
            data: await this.courseService.searchCourses(scopedSchoolId, searchTerm),
            message: 'Course search completed successfully',
        };
    }
    async findByAgeGroup(req, minAge, maxAge, schoolId) {
        const scopedSchoolId = this.schoolOf(req, schoolId);
        return {
            success: true,
            data: await this.courseService.findByAgeGroup(scopedSchoolId, minAge, maxAge),
            message: 'Courses by age group retrieved successfully',
        };
    }
    async findByStatus(req, isActive, schoolId) {
        const scopedSchoolId = this.schoolOf(req, schoolId);
        const isActiveBool = isActive === 'true';
        return {
            success: true,
            data: await this.courseService.findByStatus(scopedSchoolId, isActiveBool),
            message: 'Courses by status retrieved successfully',
        };
    }
    async findActive(req, schoolId) {
        const scopedSchoolId = this.schoolOf(req, schoolId);
        return {
            success: true,
            data: await this.courseService.findActiveCourses(scopedSchoolId),
            message: 'Active courses retrieved successfully',
        };
    }
    async findOne(req, id) {
        this.logger.log(`GET /courses/${id} - Finding course with id: ${id}`);
        try {
            const course = await this.courseService.findOne(id);
            (0, school_access_1.assertSameSchool)(req.user, course.school_id);
            this.logger.log(`GET /courses/${id} - Course retrieved successfully`);
            return {
                success: true,
                data: course,
                message: 'Course retrieved successfully',
            };
        }
        catch (error) {
            this.logger.error(`GET /courses/${id} - Error retrieving course: ${error.message}`, error.stack);
            throw error;
        }
    }
    async getStatistics(req, id) {
        const course = await this.courseService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        return {
            success: true,
            data: await this.courseService.getCourseStatistics(id),
            message: 'Course statistics retrieved successfully',
        };
    }
    async update(req, id, updateCourseDto) {
        const course = await this.courseService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        return {
            success: true,
            data: await this.courseService.update(id, updateCourseDto),
            message: 'Course updated successfully',
        };
    }
    async updateStatus(req, id, isActive) {
        const course = await this.courseService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        return {
            success: true,
            data: await this.courseService.updateStatus(id, isActive),
            message: 'Course status updated successfully',
        };
    }
    async remove(req, id) {
        const course = await this.courseService.findOne(id);
        (0, school_access_1.assertSameSchool)(req.user, course.school_id);
        await this.courseService.remove(id);
        return {
            success: true,
            message: 'Course deleted successfully',
        };
    }
    async getSchema() {
        return {
            success: true,
            data: await this.courseService.getTableSchema(),
            message: 'Database schema retrieved successfully',
        };
    }
};
exports.CourseController = CourseController;
__decorate([
    (0, common_1.Post)(),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'create'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('school_id')),
    __param(2, (0, common_1.Query)('course_kind')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('search'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('term')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "search", null);
__decorate([
    (0, common_1.Get)('age-group/:minAge/:maxAge'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('minAge', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Param)('maxAge', common_1.ParseIntPipe)),
    __param(3, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findByAgeGroup", null);
__decorate([
    (0, common_1.Get)('status/:isActive'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('isActive')),
    __param(2, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Number]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findByStatus", null);
__decorate([
    (0, common_1.Get)('active'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('school_id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findActive", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/statistics'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getStatistics", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "update", null);
__decorate([
    (0, common_1.Patch)(':id/status'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'edit'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('isActive')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Boolean]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "updateStatus", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'delete'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "remove", null);
__decorate([
    (0, common_1.Get)('debug/schema'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'manage'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CourseController.prototype, "getSchema", null);
exports.CourseController = CourseController = CourseController_1 = __decorate([
    (0, common_1.Controller)('courses'),
    (0, require_claim_decorator_1.RequireClaim)('courses', 'view'),
    __metadata("design:paramtypes", [course_service_1.CourseService])
], CourseController);
//# sourceMappingURL=course.controller.js.map