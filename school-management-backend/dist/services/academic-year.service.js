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
exports.AcademicYearService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const academic_year_entity_1 = require("../entities/academic-year.entity");
let AcademicYearService = class AcademicYearService {
    constructor(academicYearRepository) {
        this.academicYearRepository = academicYearRepository;
    }
    async create(createAcademicYearDto) {
        if (createAcademicYearDto.start_date >= createAcademicYearDto.end_date) {
            throw new common_1.BadRequestException('Start date must be before end date');
        }
        const overlapping = await this.academicYearRepository
            .createQueryBuilder('year')
            .where('(year.start_date <= :endDate AND year.end_date >= :startDate) AND year.school_id = :schoolId', {
            startDate: createAcademicYearDto.start_date,
            endDate: createAcademicYearDto.end_date,
            schoolId: createAcademicYearDto.school_id
        })
            .getOne();
        if (overlapping) {
            throw new common_1.BadRequestException('Academic year dates overlap with existing year');
        }
        if (createAcademicYearDto.is_active) {
            await this.academicYearRepository.update({ school_id: createAcademicYearDto.school_id }, { is_active: false });
        }
        const academicYear = this.academicYearRepository.create(createAcademicYearDto);
        return this.academicYearRepository.save(academicYear);
    }
    async findAll(schoolId) {
        const queryBuilder = this.academicYearRepository
            .createQueryBuilder('year')
            .leftJoinAndSelect('year.semesters', 'semesters')
            .orderBy('year.start_date', 'DESC')
            .addOrderBy('semesters.start_date', 'ASC');
        if (schoolId) {
            queryBuilder.where('year.school_id = :schoolId', { schoolId });
        }
        return queryBuilder.getMany();
    }
    async findOne(id) {
        const academicYear = await this.academicYearRepository.findOne({
            where: { id },
            relations: ['semesters', 'groups', 'courses']
        });
        if (!academicYear) {
            throw new common_1.NotFoundException(`Academic year with ID ${id} not found`);
        }
        return academicYear;
    }
    async findActive(schoolId) {
        const queryBuilder = this.academicYearRepository
            .createQueryBuilder('year')
            .leftJoinAndSelect('year.semesters', 'semesters')
            .where('year.is_active = :isActive', { isActive: true })
            .addOrderBy('semesters.start_date', 'ASC');
        if (schoolId) {
            queryBuilder.andWhere('year.school_id = :schoolId', { schoolId });
        }
        return queryBuilder.getOne();
    }
    async update(id, updateAcademicYearDto) {
        const academicYear = await this.findOne(id);
        if (updateAcademicYearDto.start_date && updateAcademicYearDto.end_date) {
            if (updateAcademicYearDto.start_date >= updateAcademicYearDto.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        else if (updateAcademicYearDto.start_date && academicYear.end_date) {
            if (updateAcademicYearDto.start_date >= academicYear.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        else if (updateAcademicYearDto.end_date && academicYear.start_date) {
            if (academicYear.start_date >= updateAcademicYearDto.end_date) {
                throw new common_1.BadRequestException('Start date must be before end date');
            }
        }
        if (updateAcademicYearDto.is_active) {
            await this.academicYearRepository.update({ school_id: academicYear.school_id, id: academicYear.id }, { is_active: false });
        }
        Object.assign(academicYear, updateAcademicYearDto);
        return this.academicYearRepository.save(academicYear);
    }
    async remove(id) {
        const academicYear = await this.findOne(id);
        if (academicYear.groups && academicYear.groups.length > 0) {
            throw new common_1.BadRequestException('Cannot delete academic year with associated groups');
        }
        if (academicYear.courses && academicYear.courses.length > 0) {
            throw new common_1.BadRequestException('Cannot delete academic year with associated courses');
        }
        await this.academicYearRepository.remove(academicYear);
    }
    async setActive(id) {
        const academicYear = await this.findOne(id);
        await this.academicYearRepository.update({ school_id: academicYear.school_id }, { is_active: false });
        academicYear.is_active = true;
        return this.academicYearRepository.save(academicYear);
    }
    async archive(id) {
        const academicYear = await this.findOne(id);
        if (academicYear.is_active) {
            academicYear.is_active = false;
        }
        return this.academicYearRepository.save(academicYear);
    }
    async getStatistics(schoolId) {
        const queryBuilder = this.academicYearRepository.createQueryBuilder('year');
        if (schoolId) {
            queryBuilder.where('year.school_id = :schoolId', { schoolId });
        }
        const total = await queryBuilder.getCount();
        const activeBuilder = queryBuilder.clone().andWhere('year.is_active = :isActive', { isActive: true });
        const active = await activeBuilder.getCount();
        const current = await this.findActive(schoolId);
        const now = new Date();
        const upcomingBuilder = queryBuilder
            .clone()
            .andWhere('year.start_date > :now', { now })
            .orderBy('year.start_date', 'ASC');
        const upcoming = await upcomingBuilder.getOne();
        return {
            total,
            active,
            current,
            upcoming
        };
    }
};
exports.AcademicYearService = AcademicYearService;
exports.AcademicYearService = AcademicYearService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(academic_year_entity_1.AcademicYear)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AcademicYearService);
