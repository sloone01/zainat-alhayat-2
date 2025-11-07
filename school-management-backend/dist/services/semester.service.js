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
exports.SemesterService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const semester_entity_1 = require("../entities/semester.entity");
const academic_year_entity_1 = require("../entities/academic-year.entity");
let SemesterService = class SemesterService {
    constructor(semesterRepository, academicYearRepository) {
        this.semesterRepository = semesterRepository;
        this.academicYearRepository = academicYearRepository;
    }
    async create(createSemesterDto) {
        if (createSemesterDto.start_date >= createSemesterDto.end_date) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const academicYear = await this.academicYearRepository.findOne({
            where: { id: createSemesterDto.academic_year_id }
        });
        if (!academicYear) {
            throw new common_1.NotFoundException(`Academic year with ID ${createSemesterDto.academic_year_id} not found`);
        }
        if (createSemesterDto.start_date < academicYear.start_date ||
            createSemesterDto.end_date > academicYear.end_date) {
            throw new common_1.BadRequestException('Semester dates must be within the academic year range');
        }
        const overlapping = await this.semesterRepository
            .createQueryBuilder('semester')
            .where('(semester.start_date <= :endDate AND semester.end_date >= :startDate) AND semester.academic_year_id = :yearId', {
            startDate: createSemesterDto.start_date,
            endDate: createSemesterDto.end_date,
            yearId: createSemesterDto.academic_year_id
        })
            .getOne();
        if (overlapping) {
            throw new common_1.BadRequestException('Semester dates overlap with existing semester');
        }
        const existingTitle = await this.semesterRepository.findOne({
            where: {
                title: createSemesterDto.title,
                academic_year_id: createSemesterDto.academic_year_id
            }
        });
        if (existingTitle) {
            throw new common_1.BadRequestException('Semester title already exists for this academic year');
        }
        const semester = this.semesterRepository.create(createSemesterDto);
        return this.semesterRepository.save(semester);
    }
    async findAll(academicYearId) {
        const queryBuilder = this.semesterRepository
            .createQueryBuilder('semester')
            .leftJoinAndSelect('semester.academicYear', 'academicYear')
            .orderBy('semester.start_date', 'ASC');
        if (academicYearId) {
            queryBuilder.where('semester.academic_year_id = :academicYearId', { academicYearId });
        }
        return queryBuilder.getMany();
    }
    async findOne(id) {
        const semester = await this.semesterRepository.findOne({
            where: { id },
            relations: ['academicYear']
        });
        if (!semester) {
            throw new common_1.NotFoundException(`Semester with ID ${id} not found`);
        }
        return semester;
    }
    async findByAcademicYear(academicYearId) {
        return this.semesterRepository.find({
            where: { academic_year_id: academicYearId },
            order: { start_date: 'ASC' }
        });
    }
    async findCurrentSemester(academicYearId) {
        const now = new Date();
        const queryBuilder = this.semesterRepository
            .createQueryBuilder('semester')
            .leftJoinAndSelect('semester.academicYear', 'academicYear')
            .where('semester.start_date <= :now AND semester.end_date >= :now', { now })
            .andWhere('semester.is_active = :isActive', { isActive: true });
        if (academicYearId) {
            queryBuilder.andWhere('semester.academic_year_id = :academicYearId', { academicYearId });
        }
        return queryBuilder.getOne();
    }
    async update(id, updateSemesterDto) {
        const semester = await this.findOne(id);
        if (updateSemesterDto.start_date && updateSemesterDto.end_date) {
            if (updateSemesterDto.start_date >= updateSemesterDto.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        else if (updateSemesterDto.start_date && semester.end_date) {
            if (updateSemesterDto.start_date >= semester.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        else if (updateSemesterDto.end_date && semester.start_date) {
            if (semester.start_date >= updateSemesterDto.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        if (updateSemesterDto.start_date || updateSemesterDto.end_date) {
            const startDate = updateSemesterDto.start_date || semester.start_date;
            const endDate = updateSemesterDto.end_date || semester.end_date;
            if (startDate < semester.academicYear.start_date ||
                endDate > semester.academicYear.end_date) {
                throw new common_1.BadRequestException('Semester dates must be within the academic year range');
            }
        }
        if (updateSemesterDto.title && updateSemesterDto.title !== semester.title) {
            const existingTitle = await this.semesterRepository.findOne({
                where: {
                    title: updateSemesterDto.title,
                    academic_year_id: semester.academic_year_id
                }
            });
            if (existingTitle) {
                throw new common_1.BadRequestException('Semester title already exists for this academic year');
            }
        }
        Object.assign(semester, updateSemesterDto);
        return this.semesterRepository.save(semester);
    }
    async remove(id) {
        const semester = await this.findOne(id);
        await this.semesterRepository.remove(semester);
    }
    async getStatistics(academicYearId) {
        const queryBuilder = this.semesterRepository.createQueryBuilder('semester');
        if (academicYearId) {
            queryBuilder.where('semester.academic_year_id = :academicYearId', { academicYearId });
        }
        const total = await queryBuilder.getCount();
        const activeBuilder = queryBuilder.clone().andWhere('semester.is_active = :isActive', { isActive: true });
        const active = await activeBuilder.getCount();
        const current = await this.findCurrentSemester(academicYearId);
        const now = new Date();
        const upcomingBuilder = queryBuilder
            .clone()
            .andWhere('semester.start_date > :now', { now })
            .orderBy('semester.start_date', 'ASC');
        const upcoming = await upcomingBuilder.getOne();
        const pastBuilder = queryBuilder
            .clone()
            .andWhere('semester.end_date < :now', { now });
        const past = await pastBuilder.getCount();
        return {
            total,
            active,
            current,
            upcoming,
            past
        };
    }
    async validateSemesterOrder(academicYearId) {
        const semesters = await this.findByAcademicYear(academicYearId);
        const issues = [];
        if (semesters.length === 0) {
            return { isValid: true, issues: [] };
        }
        for (let i = 0; i < semesters.length - 1; i++) {
            const current = semesters[i];
            const next = semesters[i + 1];
            if (current.end_date >= next.start_date) {
                issues.push(`Overlap between "${current.title}" and "${next.title}"`);
            }
            const dayAfterCurrent = new Date(current.end_date);
            dayAfterCurrent.setDate(dayAfterCurrent.getDate() + 1);
            if (dayAfterCurrent < next.start_date) {
                const gapDays = Math.floor((next.start_date.getTime() - current.end_date.getTime()) / (1000 * 60 * 60 * 24));
                issues.push(`${gapDays} day gap between "${current.title}" and "${next.title}"`);
            }
        }
        return {
            isValid: issues.length === 0,
            issues
        };
    }
};
exports.SemesterService = SemesterService;
exports.SemesterService = SemesterService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(semester_entity_1.Semester)),
    __param(1, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], SemesterService);
