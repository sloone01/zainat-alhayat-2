import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { AcademicYear } from '../entities/academic-year.entity';

export interface CreateCourseDto {
  name: string;
  description?: string;
  age_group_min?: number;
  age_group_max?: number;
  is_active?: boolean;
  color_code?: string;
  icon?: string;
  send_notifications?: boolean;
  estimated_duration_weeks?: number;
  learning_objectives?: string;
  prerequisites?: string;
  materials_needed?: string;
  school_id: number;
  academic_year_id?: string;
  // Frontend compatibility fields
  title?: string;
  category?: string;
  status?: string;
  totalDuration?: number;
  targetAgeGroup?: string;
  difficultyLevel?: string;
  maxStudents?: number;
}

export interface UpdateCourseDto {
  name?: string;
  description?: string;
  age_group_min?: number;
  age_group_max?: number;
  is_active?: boolean;
  color_code?: string;
  icon?: string;
  send_notifications?: boolean;
  estimated_duration_weeks?: number;
  learning_objectives?: string;
  prerequisites?: string;
  materials_needed?: string;
  academic_year_id?: string;
}

@Injectable()
export class CourseService {
  private readonly logger = new Logger(CourseService.name);

  constructor(
    @InjectRepository(Course)
    private courseRepository: Repository<Course>,
    @InjectRepository(AcademicYear)
    private academicYearRepository: Repository<AcademicYear>,
  ) {}

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    this.logger.log(`Creating course with data: ${JSON.stringify(createCourseDto)}`);
    try {
      // If academic_year_id is not provided, get the active academic year
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
        } else {
          this.logger.warn('No active academic year found for school');
          throw new NotFoundException('No active academic year found. Please activate an academic year first.');
        }
      }

      const course = this.courseRepository.create(createCourseDto);
      this.logger.log(`Course entity created: ${JSON.stringify(course)}`);
      const savedCourse = await this.courseRepository.save(course);
      this.logger.log(`Course saved successfully: ${JSON.stringify(savedCourse)}`);
      return savedCourse;
    } catch (error) {
      this.logger.error(`Error creating course: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findAll(schoolId?: number): Promise<Course[]> {
    this.logger.log(`Finding all courses for school_id: ${schoolId}`);
    try {
      // Basic query with core fields that should exist
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
    } catch (error) {
      this.logger.error(`Database error finding courses for school_id ${schoolId}: ${error.message}`, error.stack);

      // Check if it's a database connection or table issue
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        throw new Error(`Database table 'courses' does not exist. Please run database migrations or check database setup.`);
      } else if (error.message.includes('connect') || error.message.includes('connection')) {
        throw new Error(`Cannot connect to database. Please check database connection settings.`);
      } else {
        throw new Error(`Database error: ${error.message}`);
      }
    }
  }

  async findByAcademicYear(schoolId: number, academicYear: string): Promise<Course[]> {
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
    } catch (error) {
      this.logger.error(`Error finding courses for academic year ${academicYear}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findActiveYearCourses(schoolId: number, academicYear: string): Promise<Course[]> {
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
    } catch (error) {
      this.logger.error(`Error finding active courses for academic year ${academicYear}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findOne(id: string): Promise<Course> {
    this.logger.log(`Finding course with id: ${id}`);
    try {
      const course = await this.courseRepository.findOne({
        where: { id },
        relations: ['phases', 'phases.milestones', 'academicYear'],
      });

      if (!course) {
        this.logger.warn(`Course with ID ${id} not found`);
        throw new NotFoundException(`Course with ID ${id} not found`);
      }

      this.logger.log(`Found course: ${JSON.stringify(course)}`);
      return course;
    } catch (error) {
      this.logger.error(`Error finding course with id ${id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  async findByAgeGroup(schoolId: number, minAge: number, maxAge: number): Promise<Course[]> {
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

  async findByStatus(schoolId: number, isActive: boolean): Promise<Course[]> {
    return await this.courseRepository.find({
      where: {
        school_id: schoolId,
        is_active: isActive
      },
      relations: ['phases', 'phases.milestones', 'academicYear'],
      order: { name: 'ASC' },
    });
  }

  async findActiveCourses(schoolId: number): Promise<Course[]> {
    return await this.courseRepository.find({
      where: {
        school_id: schoolId,
        is_active: true
      },
      relations: ['phases', 'phases.milestones', 'academicYear'],
      order: { name: 'ASC' },
    });
  }

  async update(id: string, updateCourseDto: UpdateCourseDto): Promise<Course> {
    const course = await this.findOne(id);

    Object.assign(course, updateCourseDto);
    return await this.courseRepository.save(course);
  }

  async updateStatus(id: string, isActive: boolean): Promise<Course> {
    const course = await this.findOne(id);
    course.is_active = isActive;
    return await this.courseRepository.save(course);
  }

  async remove(id: string): Promise<void> {
    const course = await this.findOne(id);
    await this.courseRepository.remove(course);
  }

  async getCourseStatistics(id: string): Promise<any> {
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

  async searchCourses(schoolId: number, searchTerm: string): Promise<Course[]> {
    return await this.courseRepository
      .createQueryBuilder('course')
      .where('course.school_id = :schoolId', { schoolId })
      .andWhere(
        '(course.name ILIKE :searchTerm OR course.description ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('course.phases', 'phases')
      .leftJoinAndSelect('phases.milestones', 'milestones')
      .leftJoinAndSelect('course.academicYear', 'academicYear')
      .orderBy('course.name', 'ASC')
      .getMany();
  }

  async getTableSchema(): Promise<any> {
    // Query the actual database schema to see what columns exist
    const query = `
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'courses' 
      ORDER BY ordinal_position;
    `;
    
    const result = await this.courseRepository.query(query);
    return result;
  }
}

