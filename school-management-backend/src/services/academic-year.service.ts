import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AcademicYear } from '../entities/academic-year.entity';

export interface CreateAcademicYearDto {
  year: string;
  start_date: Date;
  end_date: Date;
  description?: string;
  is_active?: boolean;
  school_id: number;
}

export interface UpdateAcademicYearDto {
  year?: string;
  start_date?: Date;
  end_date?: Date;
  description?: string;
  is_active?: boolean;
}

@Injectable()
export class AcademicYearService {
  constructor(
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(createAcademicYearDto: CreateAcademicYearDto): Promise<AcademicYear> {
    // Validate date range
    if (createAcademicYearDto.start_date >= createAcademicYearDto.end_date) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check for overlapping years
    const overlapping = await this.academicYearRepository
      .createQueryBuilder('year')
      .where(
        '(year.start_date <= :endDate AND year.end_date >= :startDate) AND year.school_id = :schoolId',
        {
          startDate: createAcademicYearDto.start_date,
          endDate: createAcademicYearDto.end_date,
          schoolId: createAcademicYearDto.school_id
        }
      )
      .getOne();

    if (overlapping) {
      throw new BadRequestException('Academic year dates overlap with existing year');
    }

    // If setting as active, deactivate other years
    if (createAcademicYearDto.is_active) {
      await this.academicYearRepository.update(
        { school_id: createAcademicYearDto.school_id },
        { is_active: false }
      );
    }

    const academicYear = this.academicYearRepository.create(createAcademicYearDto);
    return this.academicYearRepository.save(academicYear);
  }

  async findAll(schoolId?: number): Promise<AcademicYear[]> {
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

  async findOne(id: string): Promise<AcademicYear> {
    const academicYear = await this.academicYearRepository.findOne({
      where: { id },
      relations: ['semesters', 'groups', 'courses']
    });

    if (!academicYear) {
      throw new NotFoundException(`Academic year with ID ${id} not found`);
    }

    return academicYear;
  }

  async findActive(schoolId?: number): Promise<AcademicYear | null> {
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

  async update(id: string, updateAcademicYearDto: UpdateAcademicYearDto): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);

    // Validate date range if both dates are provided
    if (updateAcademicYearDto.start_date && updateAcademicYearDto.end_date) {
      if (updateAcademicYearDto.start_date >= updateAcademicYearDto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateAcademicYearDto.start_date && academicYear.end_date) {
      if (updateAcademicYearDto.start_date >= academicYear.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    } else if (updateAcademicYearDto.end_date && academicYear.start_date) {
      if (academicYear.start_date >= updateAcademicYearDto.end_date) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // If setting as active, deactivate other years
    if (updateAcademicYearDto.is_active) {
      await this.academicYearRepository.update(
        { school_id: academicYear.school_id, id: academicYear.id },
        { is_active: false }
      );
    }

    Object.assign(academicYear, updateAcademicYearDto);
    return this.academicYearRepository.save(academicYear);
  }

  async remove(id: string): Promise<void> {
    const academicYear = await this.findOne(id);

    // Check if there are any dependent records
    if (academicYear.groups && academicYear.groups.length > 0) {
      throw new BadRequestException('Cannot delete academic year with associated groups');
    }

    if (academicYear.courses && academicYear.courses.length > 0) {
      throw new BadRequestException('Cannot delete academic year with associated courses');
    }

    await this.academicYearRepository.remove(academicYear);
  }

  async setActive(id: string): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);

    // Deactivate all other years for the same school
    await this.academicYearRepository.update(
      { school_id: academicYear.school_id },
      { is_active: false }
    );

    // Activate the selected year
    academicYear.is_active = true;
    return this.academicYearRepository.save(academicYear);
  }

  async archive(id: string): Promise<AcademicYear> {
    const academicYear = await this.findOne(id);

    // If it's the active year, deactivate it
    if (academicYear.is_active) {
      academicYear.is_active = false;
    }

    // You might want to add an 'archived' status field to the entity
    // For now, we'll just deactivate it
    return this.academicYearRepository.save(academicYear);
  }

  async getStatistics(schoolId?: number): Promise<{
    total: number;
    active: number;
    current: AcademicYear | null;
    upcoming: AcademicYear | null;
  }> {
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
}