import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Semester } from '../entities/semester.entity';
import { AcademicYear } from '../entities/academic-year.entity';

export interface CreateSemesterDto {
  title: string;
  start_date: Date;
  end_date: Date;
  academic_year_id: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateSemesterDto {
  title?: string;
  start_date?: Date;
  end_date?: Date;
  description?: string;
  is_active?: boolean;
}

@Injectable()
export class SemesterService {
  constructor(
    @InjectRepository(Semester)
    private semesterRepository: Repository<Semester>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(createSemesterDto: CreateSemesterDto): Promise<Semester> {
    // Validate date range
    if (createSemesterDto.start_date >= createSemesterDto.end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if academic year exists
    const academicYear = await this.academicYearRepository.findOne({
      where: { id: createSemesterDto.academic_year_id }
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${createSemesterDto.academic_year_id} not found`);
    }

    // Validate semester dates are within academic year
    if (createSemesterDto.start_date < academicYear.start_date ||
        createSemesterDto.end_date > academicYear.end_date) {
      throw new BadRequestException('Semester dates must be within the academic year range');
    }

    // Check for overlapping semesters within the same academic year
    const overlapping = await this.semesterRepository
      .createQueryBuilder('semester')
      .where(
        '(semester.start_date <= :endDate AND semester.end_date >= :startDate) AND semester.academic_year_id = :yearId',
        {
          startDate: createSemesterDto.start_date,
          endDate: createSemesterDto.end_date,
          yearId: createSemesterDto.academic_year_id
        }
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('Semester dates overlap with existing semester');
    }

    // Check for duplicate title within the same academic year
    const existingTitle = await this.semesterRepository.findOne({
      where: {
        title: createSemesterDto.title,
        academic_year_id: createSemesterDto.academic_year_id
      }
    });

    if (existingTitle) {
      throw new BadRequestException('Semester title already exists for this academic year');
    }

    const semester = this.semesterRepository.create(createSemesterDto);
    return this.semesterRepository.save(semester);
  }

  async findAll(academicYearId?: string): Promise<Semester[]> {
    const queryBuilder = this.semesterRepository
      .createQueryBuilder('semester')
      .leftJoinAndSelect('semester.academicYear', 'academicYear')
      .orderBy('semester.start_date', 'ASC');

    if (academicYearId) {
      queryBuilder.where('semester.academic_year_id = :academicYearId', { academicYearId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: string): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
      relations: ['academicYear']
    });

    if (!semester) {
      throw new NotFoundException(`Semester with ID ${id} not found`);
    }

    return semester;
  }

  async findByAcademicYear(academicYearId: string): Promise<Semester[]> {
    return this.semesterRepository.find({
      where: { academic_year_id: academicYearId },
      order: { start_date: 'ASC' }
    });
  }

  async findCurrentSemester(academicYearId?: string): Promise<Semester | null> {
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

  async update(id: string, updateSemesterDto: UpdateSemesterDto): Promise<Semester> {
    const semester = await this.findOne(id);

    // Validate date range if both dates are provided
    if (updateSemesterDto.start_date && updateSemesterDto.end_date) {
      if (updateSemesterDto.start_date >= updateSemesterDto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateSemesterDto.start_date && semester.end_date) {
      if (updateSemesterDto.start_date >= semester.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateSemesterDto.end_date && semester.start_date) {
      if (semester.start_date >= updateSemesterDto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Validate semester dates are within academic year if dates are being updated
    if (updateSemesterDto.start_date || updateSemesterDto.end_date) {
      const startDate = updateSemesterDto.start_date || semester.start_date;
      const endDate = updateSemesterDto.end_date || semester.end_date;

      if (startDate < semester.academicYear.start_date ||
          endDate > semester.academicYear.end_date) {
        throw new BadRequestException('Semester dates must be within the academic year range');
      }
    }

    // Check for duplicate title if title is being updated
    if (updateSemesterDto.title && updateSemesterDto.title !== semester.title) {
      const existingTitle = await this.semesterRepository.findOne({
        where: {
          title: updateSemesterDto.title,
          academic_year_id: semester.academic_year_id
        }
      });

      if (existingTitle) {
        throw new BadRequestException('Semester title already exists for this academic year');
      }
    }

    Object.assign(semester, updateSemesterDto);
    return this.semesterRepository.save(semester);
  }

  async remove(id: string): Promise<void> {
    const semester = await this.findOne(id);
    await this.semesterRepository.remove(semester);
  }

  async getStatistics(academicYearId?: string): Promise<{
    total: number;
    active: number;
    current: Semester | null;
    upcoming: Semester | null;
    past: number;
  }> {
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

  async validateSemesterOrder(academicYearId: string): Promise<{
    isValid: boolean;
    issues: string[];
  }> {
    const semesters = await this.findByAcademicYear(academicYearId);
    const issues: string[] = [];

    if (semesters.length === 0) {
      return { isValid: true, issues: [] };
    }

    // Check for gaps or overlaps
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
}