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
import { SchoolPaymentLevel } from '../entities/school-payment-level.entity';
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
    @InjectRepository(SchoolPaymentLevel)
    private readonly levelRepository: Repository<SchoolPaymentLevel>,
    private readonly dataSource: DataSource,
  ) {}

  private async assertSchoolLevel(schoolId: string, levelId: string): Promise<void> {
    const level = await this.levelRepository.findOne({
      where: { id: levelId, school_id: schoolId },
    });
    if (!level) {
      throw new BadRequestException('level_id is invalid for this school');
    }
  }

  private validateSemesterCriteria(dto: CreateGradedCourseBodyDto): void {
    const totalMarks = Number(dto.total_marks);
    if (!Number.isFinite(totalMarks) || totalMarks <= 0) {
      throw new BadRequestException('total_marks must be greater than 0');
    }
    const isAverage = dto.aggregation_method === 'average';

    dto.semesters.forEach((sem, idx) => {
      const labelled = sem.criteria.filter((c) => (c.label || '').trim());
      if (labelled.length === 0) {
        throw new BadRequestException(
          `Semester ${idx + 1}: add at least one labelled criterion`,
        );
      }
      for (const c of labelled) {
        const marks = Number(c.max_marks);
        if (!Number.isFinite(marks) || marks <= 0) {
          throw new BadRequestException(
            `Semester ${idx + 1}: each labelled criterion needs marks greater than 0`,
          );
        }
      }
    });

    if (!isAverage) {
      let allSum = 0;
      for (const sem of dto.semesters) {
        const labelled = sem.criteria.filter((c) => (c.label || '').trim());
        allSum += criteriaSum(labelled);
      }
      if (Math.abs(allSum - totalMarks) > SUM_TOLERANCE) {
        throw new BadRequestException(
          `Criteria marks across all semesters must total ${totalMarks} (currently ${allSum})`,
        );
      }
    }
  }

  private isDraft(dto: { save_as_draft?: boolean }): boolean {
    return dto.save_as_draft === true;
  }

  async createFull(dto: CreateGradedCourseBodyDto): Promise<GradedCourseResponse> {
    const draft = this.isDraft(dto);
    if (!draft) {
      if (!dto.level_id) {
        throw new BadRequestException('level_id is required');
      }
      this.validateSemesterCriteria(dto);
    }
    if (dto.level_id) {
      await this.assertSchoolLevel(dto.school_id, dto.level_id);
    }

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
        level_id: dto.level_id || null,
        course_kind: 'graded',
        is_active: !draft,
        status: draft ? 'draft' : 'active',
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
            label: (c.label || '').trim(),
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
    schoolId: string,
    body: UpdateGradedCourseBodyDto,
  ): Promise<GradedCourseResponse> {
    const draft = this.isDraft(body);
    const validationPayload: CreateGradedCourseBodyDto = {
      school_id: schoolId,
      name: body.name,
      description: body.description,
      academic_year_id: undefined,
      level_id: body.level_id,
      save_as_draft: body.save_as_draft,
      total_marks: body.total_marks,
      aggregation_method: body.aggregation_method,
      semesters: body.semesters,
    };
    if (!draft) {
      if (!body.level_id) {
        throw new BadRequestException('level_id is required');
      }
      this.validateSemesterCriteria(validationPayload);
    }
    if (body.level_id) {
      await this.assertSchoolLevel(schoolId, body.level_id);
    }

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
      course.level_id = body.level_id || null;
      course.status = draft ? 'draft' : 'active';
      course.is_active = !draft;
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

      // Clear in-memory relation so cascade:true cannot re-insert deleted rows.
      scheme.semesters = [];
      await manager.update(
        GradedAssessmentScheme,
        { id: scheme.id },
        {
          total_marks: String(body.total_marks),
          aggregation_method: body.aggregation_method,
        },
      );

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
            label: (c.label || '').trim(),
            max_marks: String(c.max_marks),
            sort_order: j,
          });
          await manager.save(crit);
        }
      }
    });

    return this.findGradedOne(courseId, schoolId);
  }

  async findGradedBySchool(schoolId: string): Promise<GradedCourseResponse[]> {
    const courses = await this.courseRepository.find({
      where: { school_id: schoolId, course_kind: 'graded' },
      order: { created_at: 'DESC' },
      relations: ['academicYear', 'level'],
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
    schoolId: string,
  ): Promise<GradedCourseResponse> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, school_id: schoolId, course_kind: 'graded' },
      relations: ['academicYear', 'level'],
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

  /** Deep-copy graded course + scheme/semesters/criteria as a new draft (no marks/tasks/enrollments). */
  async duplicate(
    courseId: string,
    schoolId: string,
    newName?: string,
  ): Promise<GradedCourseResponse> {
    const source = await this.findGradedOne(courseId, schoolId);
    const scheme = source.graded_scheme;
    if (!scheme) {
      throw new BadRequestException('Source course has no assessment scheme');
    }

    const baseTitle = (source.title || source.name || '').trim() || 'Course';
    const copyTitle = (newName?.trim() || `${baseTitle} (copy)`).slice(0, 255);

    const { newCourseId } = await this.dataSource.transaction(async (manager) => {
      const course = manager.create(Course, {
        name: copyTitle,
        title: copyTitle,
        description: source.description || undefined,
        school_id: schoolId,
        academic_year_id: source.academic_year_id,
        level_id: source.level_id || null,
        course_kind: 'graded',
        is_active: false,
        status: 'draft',
      });
      await manager.save(course);

      const newScheme = manager.create(GradedAssessmentScheme, {
        course_id: course.id,
        total_marks: String(scheme.total_marks),
        aggregation_method: scheme.aggregation_method,
      });
      await manager.save(newScheme);

      const semesters = [...(scheme.semesters || [])].sort(
        (a, b) => a.semester_index - b.semester_index,
      );
      for (const sem of semesters) {
        const newSem = manager.create(GradedSemesterConfig, {
          scheme_id: newScheme.id,
          semester_index: sem.semester_index,
          title: sem.title,
        });
        await manager.save(newSem);

        const criteria = [...(sem.criteria || [])].sort(
          (a, b) => a.sort_order - b.sort_order,
        );
        for (const c of criteria) {
          await manager.save(
            manager.create(GradedCriterion, {
              semester_config_id: newSem.id,
              label: c.label,
              max_marks: String(c.max_marks),
              sort_order: c.sort_order,
            }),
          );
        }
      }

      return { newCourseId: course.id };
    });

    return this.findGradedOne(newCourseId, schoolId);
  }

  /** Only draft graded courses may be deleted. Scheme/semesters/criteria cascade from the course. */
  async deleteDraft(courseId: string, schoolId: string): Promise<void> {
    const course = await this.courseRepository.findOne({
      where: { id: courseId, school_id: schoolId, course_kind: 'graded' },
    });
    if (!course) {
      throw new NotFoundException(
        `Graded course with ID ${courseId} not found for this school`,
      );
    }
    if (course.status !== 'draft') {
      throw new BadRequestException(
        'Only draft graded courses can be deleted',
      );
    }
    await this.courseRepository.remove(course);
  }
}
