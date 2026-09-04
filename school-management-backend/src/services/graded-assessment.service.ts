import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { GradedAssessmentScheme } from '../entities/graded-assessment-scheme.entity';
import { GradedSemesterConfig } from '../entities/graded-semester-config.entity';
import { GradedCriterion } from '../entities/graded-criterion.entity';
import { AcademicYear } from '../entities/academic-year.entity';
import type {
  CreateGradedCourseBodyDto,
  UpdateGradedCourseBodyDto,
} from '../dto/graded-assessment.dto';

const SUM_TOLERANCE = 0.02;

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function criteriaSum(
  criteria: { label: string; max_marks: number }[],
): number {
  return round2(criteria.reduce((s, c) => s + Number(c.max_marks), 0));
}

export type GradedCourseResponse = Course & {
  graded_scheme?: GradedAssessmentScheme | null;
};

@Injectable()
export class GradedAssessmentService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,
    @InjectRepository(GradedAssessmentScheme)
    private readonly schemeRepository: Repository<GradedAssessmentScheme>,
    @InjectRepository(AcademicYear)
    private readonly academicYearRepository: Repository<AcademicYear>,
    private readonly dataSource: DataSource,
  ) {}

  private validateSemesterCriteria(dto: CreateGradedCourseBodyDto): void {
    dto.semesters.forEach((sem, idx) => {
      for (const c of sem.criteria) {
        const label = (c.label || '').trim();
        if (!label) {
          throw new BadRequestException(
            `Semester ${idx + 1}: each criterion needs a label`,
          );
        }
      }
      const sum = criteriaSum(sem.criteria);
      if (Math.abs(sum - 100) > SUM_TOLERANCE) {
        throw new BadRequestException(
          `Semester ${idx + 1}: criteria weights must total 100 (currently ${sum})`,
        );
      }
    });
  }

  async createFull(dto: CreateGradedCourseBodyDto): Promise<GradedCourseResponse> {
    this.validateSemesterCriteria(dto);

    let academicYearId = dto.academic_year_id;
    if (!academicYearId) {
      const activeYear = await this.academicYearRepository.findOne({
        where: { school_id: dto.school_id, is_active: true },
      });
      if (!activeYear) {
        throw new BadRequestException(
          'No active academic year found. Please activate an academic year first.',
        );
      }
      academicYearId = activeYear.id;
    }

    const name = dto.name.trim();

    const { courseId } = await this.dataSource.transaction(async (manager) => {
      const course = manager.create(Course, {
        name,
        title: name,
        description: dto.description?.trim() || undefined,
        school_id: dto.school_id,
        academic_year_id: academicYearId,
        course_kind: 'graded',
        is_active: true,
        status: 'active',
      });
      await manager.save(course);

      const scheme = manager.create(GradedAssessmentScheme, {
        course_id: course.id,
        total_marks: String(dto.total_marks),
        aggregation_method: dto.aggregation_method,
      });
      await manager.save(scheme);

      for (let i = 0; i < dto.semesters.length; i++) {
        const semDto = dto.semesters[i];
        const sem = manager.create(GradedSemesterConfig, {
          scheme_id: scheme.id,
          semester_index: i,
          title: semDto.title?.trim() || null,
        });
        await manager.save(sem);

        for (let j = 0; j < semDto.criteria.length; j++) {
          const c = semDto.criteria[j];
          const crit = manager.create(GradedCriterion, {
            semester_config_id: sem.id,
            label: c.label.trim(),
            max_marks: String(c.max_marks),
            sort_order: j,
          });
          await manager.save(crit);
        }
      }

      return { courseId: course.id };
    });

    return this.findGradedOne(courseId, dto.school_id);
  }

  async updateFull(
    courseId: string,
    schoolId: number,
    body: UpdateGradedCourseBodyDto,
  ): Promise<GradedCourseResponse> {
    const validationPayload: CreateGradedCourseBodyDto = {
      school_id: schoolId,
      name: body.name,
      description: body.description,
      academic_year_id: undefined,
      total_marks: body.total_marks,
      aggregation_method: body.aggregation_method,
      semesters: body.semesters,
    };
    this.validateSemesterCriteria(validationPayload);

    await this.dataSource.transaction(async (manager) => {
      const course = await manager.findOne(Course, {
        where: { id: courseId, school_id: schoolId, course_kind: 'graded' },
      });
      if (!course) {
        throw new NotFoundException(
          `Graded course with ID ${courseId} not found for this school`,
        );
      }
      const name = body.name.trim();
      course.name = name;
      course.title = name;
      course.description = body.description?.trim() || '';
      await manager.save(course);

      const scheme = await manager.findOne(GradedAssessmentScheme, {
        where: { course_id: courseId },
        relations: ['semesters'],
      });
      if (!scheme) {
        throw new NotFoundException('Graded assessment scheme not found for this course');
      }

      const semesterIds = (scheme.semesters ?? []).map((s) => s.id);
      if (semesterIds.length) {
        await manager.delete(GradedCriterion, {
          semester_config_id: In(semesterIds),
        });
      }
      await manager.delete(GradedSemesterConfig, { scheme_id: scheme.id });

      scheme.total_marks = String(body.total_marks);
      scheme.aggregation_method = body.aggregation_method;
      await manager.save(scheme);

      for (let i = 0; i < body.semesters.length; i++) {
        const semDto = body.semesters[i];
        const sem = manager.create(GradedSemesterConfig, {
          scheme_id: scheme.id,
          semester_index: i,
          title: semDto.title?.trim() || null,
        });
        await manager.save(sem);

        for (let j = 0; j < semDto.criteria.length; j++) {
          const c = semDto.criteria[j];
          const crit = manager.create(GradedCriterion, {
            semester_config_id: sem.id,
            label: c.label.trim(),
            max_marks: String(c.max_marks),
            sort_order: j,
          });
          await manager.save(crit);
        }
      }
    });

    return this.findGradedOne(courseId, schoolId);
  }

  async findGradedBySchool(schoolId: number): Promise<GradedCourseResponse[]> {
    const courses = await this.courseRepository.find({
      where: { school_id: schoolId, course_kind: 'graded' },
      order: { created_at: 'DESC' },
      relations: ['academicYear'],
    });
    if (!courses.length) return [];

    const schemes = await this.schemeRepository.find({
      where: { course_id: In(courses.map((c) => c.id)) },
      relations: ['semesters', 'semesters.criteria'],
    });

    for (const s of schemes) {
      s.semesters?.sort((a, b) => a.semester_index - b.semester_index);
      s.semesters?.forEach((sem) =>
        sem.criteria?.sort((a, b) => a.sort_order - b.sort_order),
      );
    }

    const byCourse = new Map(schemes.map((sch) => [sch.course_id, sch]));
    return courses.map((c) =>
      Object.assign(c, { graded_scheme: byCourse.get(c.id) ?? null }),
    );
  }

  async findGradedOne(
    courseId: string,
    schoolId: number,
  ): Promise<GradedCourseResponse> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, school_id: schoolId, course_kind: 'graded' },
      relations: ['academicYear'],
    });
    if (!course) {
      throw new NotFoundException(
        `Graded course with ID ${courseId} not found for this school`,
      );
    }
    const scheme = await this.schemeRepository.findOne({
      where: { course_id: courseId },
      relations: ['semesters', 'semesters.criteria'],
    });
    scheme?.semesters?.sort((a, b) => a.semester_index - b.semester_index);
    scheme?.semesters?.forEach((sem) =>
      sem.criteria?.sort((a, b) => a.sort_order - b.sort_order),
    );
    return Object.assign(course, { graded_scheme: scheme ?? null });
  }
}
