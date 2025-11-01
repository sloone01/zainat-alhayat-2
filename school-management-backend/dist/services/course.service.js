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
var CourseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CourseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const course_entity_1 = require("../entities/course.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
let CourseService = CourseService_1 = class CourseService {
    courseRepository;
    academicYearRepository;
    logger = new common_1.Logger(CourseService_1.name);
    constructor(courseRepository, academicYearRepository) {
        this.courseRepository = courseRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async create(createCourseDto) {
        this.logger.log(`Creating course with data: ${JSON.stringify(createCourseDto)}`);
        try {
            if (!createCourseDto.academic_year_id) {
                this.logger.log('No academic_year_id provided, fetching active academic year');
                const activeYear = await this.academicYearRepository.findOne({
                    where: {
                        school_id: createCourseDto.school_id,
                        is_active: true
                    }
                });
                if (activeYear) {
                    createCourseDto.academic_year_id = activeYear.id;
                    this.logger.log(`Using active academic year: ${activeYear.year} (ID: ${activeYear.id})`);
                }
                else {
                    this.logger.warn('No active academic year found for school');
                    throw new common_1.NotFoundException('No active academic year found. Please activate an academic year first.');
                }
            }
            const course = this.courseRepository.create(createCourseDto);
            this.logger.log(`Course entity created: ${JSON.stringify(course)}`);
            const savedCourse = await this.courseRepository.save(course);
            this.logger.log(`Course saved successfully: ${JSON.stringify(savedCourse)}`);
            return savedCourse;
        }
        catch (error) {
            this.logger.error(`Error creating course: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(schoolId) {
        this.logger.log(`Finding all courses for school_id: ${schoolId}`);
        try {
            const whereCondition = schoolId ? { school_id: schoolId } : {};
            const courses = await this.courseRepository.find({
                where: whereCondition,
                order: { created_at: 'DESC' },
                relations: ['academicYear'],
                select: ['id', 'name', 'description', 'created_at', 'updated_at', 'school_id', 'academic_year_id', 'is_active']
            });
            this.logger.log(`Found ${courses.length} courses for school_id: ${schoolId}`);
            this.logger.debug(`Courses data: ${JSON.stringify(courses)}`);
            return courses;
        }
        catch (error) {
            this.logger.error(`Error finding courses for school_id ${schoolId}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByAcademicYear(schoolId, academicYear) {
        this.logger.log(`Finding courses for school_id: ${schoolId}, academic_year_id: ${academicYear}`);
        try {
            const courses = await this.courseRepository.find({
                where: {
                    school_id: schoolId,
                    academic_year_id: academicYear
                },
                order: { created_at: 'DESC' },
                relations: ['academicYear'],
                select: ['id', 'name', 'description', 'created_at', 'updated_at', 'school_id', 'academic_year_id', 'is_active']
            });
            this.logger.log(`Found ${courses.length} courses for school_id: ${schoolId}, academic_year_id: ${academicYear}`);
            return courses;
        }
        catch (error) {
            this.logger.error(`Error finding courses for academic year ${academicYear}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findActiveYearCourses(schoolId, academicYear) {
        this.logger.log(`Finding active courses for school_id: ${schoolId}, academic_year_id: ${academicYear}`);
        try {
            const courses = await this.courseRepository.find({
                where: {
                    school_id: schoolId,
                    academic_year_id: academicYear,
                    is_active: true
                },
                order: { created_at: 'DESC' },
                relations: ['academicYear'],
                select: ['id', 'name', 'description', 'created_at', 'updated_at', 'school_id', 'academic_year_id', 'is_active']
            });
            this.logger.log(`Found ${courses.length} active courses for school_id: ${schoolId}, academic_year_id: ${academicYear}`);
            return courses;
        }
        catch (error) {
            this.logger.error(`Error finding active courses for academic year ${academicYear}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findOne(id) {
        this.logger.log(`Finding course with id: ${id}`);
        try {
            const course = await this.courseRepository.findOne({
                where: { id },
                relations: ['phases', 'phases.milestones', 'academicYear'],
            });
            if (!course) {
                this.logger.warn(`Course with ID ${id} not found`);
                throw new common_1.NotFoundException(`Course with ID ${id} not found`);
            }
            this.logger.log(`Found course: ${JSON.stringify(course)}`);
            return course;
        }
        catch (error) {
            this.logger.error(`Error finding course with id ${id}: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findByAgeGroup(schoolId, minAge, maxAge) {
        return await this.courseRepository.find({
            where: {
                school_id: schoolId,
                age_group_min: minAge,
                age_group_max: maxAge
            },
            relations: ['phases', 'phases.milestones', 'academicYear'],
            order: { name: 'ASC' },
        });
    }
    async findByStatus(schoolId, isActive) {
        return await this.courseRepository.find({
            where: {
                school_id: schoolId,
                is_active: isActive
            },
            relations: ['phases', 'phases.milestones', 'academicYear'],
            order: { name: 'ASC' },
        });
    }
    async findActiveCourses(schoolId) {
        return await this.courseRepository.find({
            where: {
                school_id: schoolId,
                is_active: true
            },
            relations: ['phases', 'phases.milestones', 'academicYear'],
            order: { name: 'ASC' },
        });
    }
    async update(id, updateCourseDto) {
        const course = await this.findOne(id);
        Object.assign(course, updateCourseDto);
        return await this.courseRepository.save(course);
    }
    async updateStatus(id, isActive) {
        const course = await this.findOne(id);
        course.is_active = isActive;
        return await this.courseRepository.save(course);
    }
    async remove(id) {
        const course = await this.findOne(id);
        await this.courseRepository.remove(course);
    }
    async getCourseStatistics(id) {
        const course = await this.findOne(id);
        const totalPhases = course.phases ? course.phases.length : 0;
        const totalMilestones = course.phases
            ? course.phases.reduce((sum, phase) => sum + (phase.milestones ? phase.milestones.length : 0), 0)
            : 0;
        const totalDuration = course.phases
            ? course.phases.reduce((sum, phase) => sum + phase.duration_weeks, 0)
            : 0;
        return {
            id: course.id,
            name: course.name,
            age_group_min: course.age_group_min,
            age_group_max: course.age_group_max,
            is_active: course.is_active,
            color_code: course.color_code,
            icon: course.icon,
            total_phases: totalPhases,
            total_milestones: totalMilestones,
            total_duration_weeks: totalDuration,
            estimated_duration_weeks: course.estimated_duration_weeks,
        };
    }
    async searchCourses(schoolId, searchTerm) {
        return await this.courseRepository
            .createQueryBuilder('course')
            .where('course.school_id = :schoolId', { schoolId })
            .andWhere('(course.name ILIKE :searchTerm OR course.description ILIKE :searchTerm)', { searchTerm: `%${searchTerm}%` })
            .leftJoinAndSelect('course.phases', 'phases')
            .leftJoinAndSelect('phases.milestones', 'milestones')
            .leftJoinAndSelect('course.academicYear', 'academicYear')
            .orderBy('course.name', 'ASC')
            .getMany();
    }
    async getTableSchema() {
        const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position;
    `;
        const result = await this.courseRepository.query(query);
        return result;
    }
};
exports.CourseService = CourseService;
exports.CourseService = CourseService = CourseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(course_entity_1.Course)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], CourseService);
//# sourceMappingURL=course.service.js.map