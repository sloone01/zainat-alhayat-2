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
const phase_entity_1 = require("../entities/phase.entity");
const milestone_entity_1 = require("../entities/milestone.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
function splitCourseStatuses(input) {
    let status = input.status || 'draft';
    let isActive = input.is_active;
    if (status === 'inactive') {
        status = 'active';
        if (isActive === undefined)
            isActive = false;
    }
    return { status, is_active: isActive !== false };
}
function uuidOrNull(value) {
    if (value == null || value === '')
        return null;
    const raw = String(value).trim();
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(raw)
        ? raw
        : null;
}
let CourseService = CourseService_1 = class CourseService {
    courseRepository;
    phaseRepository;
    milestoneRepository;
    academicYearRepository;
    logger = new common_1.Logger(CourseService_1.name);
    constructor(courseRepository, phaseRepository, milestoneRepository, academicYearRepository) {
        this.courseRepository = courseRepository;
        this.phaseRepository = phaseRepository;
        this.milestoneRepository = milestoneRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async persistLevelId(id, levelId) {
        if (levelId === undefined)
            return;
        await this.courseRepository.query(`UPDATE courses SET level_id = $1 WHERE id = $2`, [
            uuidOrNull(levelId),
            id,
        ]);
    }
    async create(createCourseDto, schoolId) {
        this.logger.log(`Creating course with data: ${JSON.stringify(createCourseDto)}`);
        if (schoolId != null) {
            createCourseDto.school_id = schoolId;
        }
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
            const { course_kind, status, is_active, ...courseFields } = createCourseDto;
            const split = splitCourseStatuses({ status, is_active });
            const course = this.courseRepository.create({
                ...courseFields,
                ...split,
                course_kind: course_kind ?? 'milestone',
            });
            this.logger.log(`Course entity created: ${JSON.stringify(course)}`);
            const savedCourse = await this.courseRepository.save(course);
            await this.persistLevelId(savedCourse.id, createCourseDto.level_id);
            this.logger.log(`Course saved successfully: ${JSON.stringify(savedCourse)}`);
            return this.findOne(savedCourse.id, savedCourse.school_id);
        }
        catch (error) {
            this.logger.error(`Error creating course: ${error.message}`, error.stack);
            throw error;
        }
    }
    async findAll(schoolId, courseKind) {
        this.logger.log(`Finding all courses for school_id: ${schoolId}, course_kind: ${courseKind ?? 'any'}`);
        try {
            const whereCondition = {};
            if (schoolId !== undefined && schoolId !== null && !Number.isNaN(schoolId)) {
                whereCondition.school_id = schoolId;
            }
            if (courseKind) {
                whereCondition.course_kind = courseKind;
            }
            const courses = await this.courseRepository.find({
                where: Object.keys(whereCondition).length ? whereCondition : {},
                order: { created_at: 'DESC' },
                relations: ['academicYear', 'level'],
                select: [
                    'id',
                    'name',
                    'title',
                    'description',
                    'created_at',
                    'updated_at',
                    'school_id',
                    'academic_year_id',
                    'is_active',
                    'category',
                    'status',
                    'course_kind',
                    'level_id',
                ],
            });
            this.logger.log(`Found ${courses.length} courses for school_id: ${schoolId}`);
            this.logger.debug(`Courses data: ${JSON.stringify(courses)}`);
            return courses;
        }
        catch (error) {
            this.logger.error(`Database error finding courses for school_id ${schoolId}: ${error.message}`, error.stack);
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
                throw new Error(`Database table 'courses' does not exist. Please run database migrations or check database setup.`);
            }
            else if (error.message.includes('connect') || error.message.includes('connection')) {
                throw new Error(`Cannot connect to database. Please check database connection settings.`);
            }
            else {
                throw new Error(`Database error: ${error.message}`);
            }
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
    async findOne(id, schoolId) {
        this.logger.log(`Finding course with id: ${id}`);
        try {
            const course = await this.courseRepository.findOne({
                where: schoolId == null ? { id } : { id, school_id: schoolId },
                relations: ['phases', 'phases.milestones', 'academicYear', 'level'],
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
    async update(id, updateCourseDto, schoolId) {
        const course = await this.findOne(id, schoolId);
        const { school_id: _ignored, status, is_active, level_id, ...rest } = updateCourseDto;
        const split = status !== undefined || is_active !== undefined
            ? splitCourseStatuses({
                status: status ?? course.status,
                is_active: is_active ?? course.is_active,
            })
            : null;
        Object.assign(course, rest, split ?? {});
        await this.courseRepository.save(course);
        await this.persistLevelId(id, level_id);
        return this.findOne(id, schoolId);
    }
    async updateStatus(id, isActive, schoolId) {
        const course = await this.findOne(id, schoolId);
        course.is_active = isActive;
        return await this.courseRepository.save(course);
    }
    async remove(id, schoolId) {
        const course = await this.findOne(id, schoolId);
        await this.courseRepository.remove(course);
    }
    async duplicate(id, newName, schoolId) {
        const source = await this.findOne(id, schoolId);
        const baseTitle = (source.title || source.name || '').trim() || 'Course';
        const copyTitle = (newName?.trim() || `${baseTitle} (copy)`).slice(0, 255);
        const savedCourse = await this.courseRepository.save(this.courseRepository.create({
            name: copyTitle,
            title: copyTitle,
            description: source.description,
            category: source.category,
            status: 'draft',
            age_group_min: source.age_group_min,
            age_group_max: source.age_group_max,
            is_active: source.is_active,
            color_code: source.color_code,
            icon: source.icon,
            send_notifications: source.send_notifications,
            estimated_duration_weeks: source.estimated_duration_weeks,
            learning_objectives: source.learning_objectives,
            prerequisites: source.prerequisites,
            materials_needed: source.materials_needed,
            school_id: source.school_id,
            course_kind: source.course_kind || 'milestone',
            academic_year_id: source.academic_year_id,
            level_id: source.level_id,
            totalDuration: source.totalDuration,
            targetAgeGroup: source.targetAgeGroup,
            difficultyLevel: source.difficultyLevel,
            maxStudents: source.maxStudents,
            createdDate: new Date(),
            lastModified: new Date(),
        }));
        const phases = [...(source.phases || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        for (const phase of phases) {
            const savedPhase = await this.phaseRepository.save(this.phaseRepository.create({
                name: phase.name,
                description: phase.description,
                order: phase.order,
                duration_weeks: phase.duration_weeks,
                is_active: phase.is_active,
                course_id: savedCourse.id,
            }));
            const milestones = [...(phase.milestones || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
            for (const milestone of milestones) {
                await this.milestoneRepository.save(this.milestoneRepository.create({
                    name: milestone.name,
                    description: milestone.description,
                    order: milestone.order,
                    isRequired: milestone.isRequired,
                    phase_id: savedPhase.id,
                    title: milestone.title,
                    target_week: milestone.target_week,
                }));
            }
        }
        return this.findOne(savedCourse.id, schoolId);
    }
    async getCourseStatistics(id, schoolId) {
        const course = await this.findOne(id, schoolId);
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
    __param(1, (0, typeorm_1.InjectRepository)(phase_entity_1.Phase)),
    __param(2, (0, typeorm_1.InjectRepository)(milestone_entity_1.Milestone)),
    __param(3, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], CourseService);
//# sourceMappingURL=course.service.js.map