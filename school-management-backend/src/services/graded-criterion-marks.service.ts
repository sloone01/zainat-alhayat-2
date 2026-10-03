import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  buildPage,
  clampPage,
  paginateQueryBuilder,
  parsePageQuery,
  wantsPage,
  type PageQuery,
  type PageResult,
} from '../common/pagination';
import { formatStudentDisplayName } from '../common/identity/bilingual-name';
import { Schedule } from '../entities/schedule.entity';
import { User } from '../entities/user.entity';
import { Course } from '../entities/course.entity';
import { GradedAssessmentScheme } from '../entities/graded-assessment-scheme.entity';
import { GradedCriterion } from '../entities/graded-criterion.entity';
import { GradedCriterionStudentMark } from '../entities/graded-criterion-student-mark.entity';
import { Group } from '../entities/group.entity';
import { Student } from '../entities/student.entity';
import type { SaveCriterionMarksGridDto } from '../dto/graded-criterion-marks.dto';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { SemesterService } from './semester.service';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseMark(v: string | null | undefined): number | null {
  if (v == null || v === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export type CriterionCol = {
  id: string;
  label: string;
  max_marks: number;
  sort_order: number;
  semester_index: number;
  semester_title: string | null;
};

export type CriterionMarksGridResponse = {
  course_id: string;
  course_name: string;
  group_id: string;
  group_name: string;
  total_marks: number;
  aggregation_method: string;
  criteria: CriterionCol[];
  students: { id: string; name: string }[];
  /** `${studentId}:::${criterionId}` → mark string or null */
  marks: Record<string, string | null>;
  /** Set when the request asked for `page` — the student rows of this page. */
  items?: { id: string; name: string }[];
  total?: number;
  page?: number;
  limit?: number;
  pages?: number;
  /** School calendar semester marked “active now”; null if none set. */
  active_semester: {
    id: string;
    title: string;
    semester_index: number;
  } | null;
};

export type ClassReportResponse = {
  course_id: string;
  course_name: string;
  group_id: string;
  group_name: string;
  total_marks: number;
  aggregation_method: string;
  criteria: CriterionCol[];
  students: {
    id: string;
    name: string;
    marks: Record<string, number | null>;
    semester_scores: { semester_index: number; score: number; max: number }[];
    course_score: number;
    course_max: number;
  }[];
};

export type StudentReportResponse = {
  student_id: string;
  student_name: string;
  courses: {
    course_id: string;
    course_name: string;
    total_marks: number;
    aggregation_method: string;
    semester_scores: { semester_index: number; title: string | null; score: number; max: number }[];
    course_score: number;
    course_max: number;
    criteria: {
      id: string;
      label: string;
      max_marks: number;
      semester_index: number;
      mark: number | null;
    }[];
  }[];
};

@Injectable()
export class GradedCriterionMarksService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(GradedAssessmentScheme)
    private readonly schemeRepo: Repository<GradedAssessmentScheme>,
    @InjectRepository(GradedCriterion)
    private readonly criterionRepo: Repository<GradedCriterion>,
    @InjectRepository(GradedCriterionStudentMark)
    private readonly markRepo: Repository<GradedCriterionStudentMark>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
    private readonly semesterService: SemesterService,
  ) {}

  private async loadGradedCourse(courseId: string, schoolId: string) {
    const course = await this.courseRepo.findOne({
      where: { id: courseId, school_id: schoolId },
    });
    if (!course || course.course_kind !== 'graded') {
      throw new NotFoundException('Graded course not found');
    }
    const scheme = await this.schemeRepo.findOne({
      where: { course_id: courseId },
      relations: ['semesters', 'semesters.criteria'],
    });
    if (!scheme) {
      throw new NotFoundException('Graded assessment scheme not found');
    }
    return { course, scheme };
  }

  private flattenCriteria(scheme: GradedAssessmentScheme): CriterionCol[] {
    const semesters = [...(scheme.semesters || [])].sort(
      (a, b) => a.semester_index - b.semester_index,
    );
    const cols: CriterionCol[] = [];
    for (const sem of semesters) {
      const criteria = [...(sem.criteria || [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      for (const c of criteria) {
        cols.push({
          id: c.id,
          label: c.label,
          max_marks: Number(c.max_marks),
          sort_order: c.sort_order,
          semester_index: sem.semester_index,
          semester_title: sem.title ?? null,
        });
      }
    }
    return cols;
  }

  private async studentsInGroup(groupId: string, schoolId: string) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group || group.school_id !== schoolId) {
      throw new NotFoundException('Group not found');
    }
    const students = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g', 'g.id = :gid', { gid: groupId })
      .where('s.school_id = :sid', { sid: schoolId })
      .orderBy('s.firstName', 'ASC')
      .addOrderBy('s.lastName', 'ASC')
      .getMany();

    return {
      group,
      students: students.map((s) => this.toGridStudent(s)),
    };
  }

  private toGridStudent(s: Student) {
    return {
      id: s.id,
      name: formatStudentDisplayName(s) || s.id,
      firstName: s.firstName,
      secondName: s.secondName,
      secondNameEn: s.secondNameEn,
      lastName: s.lastName,
      first_name_ar: s.first_name_ar,
      first_name_en: s.first_name_en,
      last_name_ar: s.last_name_ar,
      last_name_en: s.last_name_en,
    };
  }

  /** Distinct student ids first — the group join must not inflate the page count. */
  private async pageStudentsInGroup(groupId: string, schoolId: string, query: PageQuery) {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group || group.school_id !== schoolId) {
      throw new NotFoundException('Group not found');
    }
    const idQb = this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g', 'g.id = :gid', { gid: groupId })
      .where('s.school_id = :sid', { sid: schoolId });
    const totalRow = await idQb.clone().select('COUNT(DISTINCT s.id)', 'cnt').getRawOne<{ cnt: string }>();
    const total = Number(totalRow?.cnt || 0);
    const { page, limit } = parsePageQuery(query);
    const safePage = clampPage(page, total, limit);
    const idRows = await idQb
      .clone()
      .select('s.id', 'id')
      .addSelect('MIN(s.firstName)', 'sort_first')
      .addSelect('MIN(s.lastName)', 'sort_last')
      .groupBy('s.id')
      .orderBy('sort_first', 'ASC')
      .addOrderBy('sort_last', 'ASC')
      .addOrderBy('s.id', 'ASC')
      .offset((safePage - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string }>();
    const ids = idRows.map((row) => String(row.id));
    const pages = Math.max(1, Math.ceil(total / limit) || 1);
    if (!ids.length) return { group, students: [], total, page: safePage, limit, pages };
    const rows = await this.studentRepo.find({ where: { id: In(ids) } });
    const byId = new Map(rows.map((s) => [s.id, s]));
    const students = ids
      .map((id) => byId.get(id))
      .filter((s): s is Student => !!s)
      .map((s) => this.toGridStudent(s));
    return { group, students, total, page: safePage, limit, pages };
  }

  private computeScores(
    criteria: CriterionCol[],
    marksByCriterion: Record<string, number | null>,
    aggregationMethod: string,
    schemeTotalMarks: number,
  ) {
    const bySem = new Map<number, CriterionCol[]>();
    for (const c of criteria) {
      if (!bySem.has(c.semester_index)) bySem.set(c.semester_index, []);
      bySem.get(c.semester_index)!.push(c);
    }
    const semester_scores: {
      semester_index: number;
      title: string | null;
      score: number;
      max: number;
    }[] = [];
    for (const [idx, cols] of [...bySem.entries()].sort((a, b) => a[0] - b[0])) {
      let score = 0;
      let max = 0;
      for (const c of cols) {
        max += c.max_marks;
        const m = marksByCriterion[c.id];
        if (m != null) score += m;
      }
      semester_scores.push({
        semester_index: idx,
        title: cols[0]?.semester_title ?? null,
        score: round2(score),
        max: round2(max),
      });
    }

    let course_score = 0;
    if (aggregationMethod === 'average') {
      course_score =
        semester_scores.length === 0
          ? 0
          : round2(
              semester_scores.reduce((s, x) => s + x.score, 0) /
                semester_scores.length,
            );
    } else {
      course_score = round2(
        semester_scores.reduce((s, x) => s + x.score, 0),
      );
    }

    // Scale to scheme total_marks using average semester % when possible
    const semesterPcts = semester_scores.map((s) =>
      s.max > 0 ? (s.score / s.max) * 100 : 0,
    );
    let pct = 0;
    if (aggregationMethod === 'average') {
      pct =
        semesterPcts.length === 0
          ? 0
          : semesterPcts.reduce((a, b) => a + b, 0) / semesterPcts.length;
    } else {
      const totScore = semester_scores.reduce((s, x) => s + x.score, 0);
      const totMax = semester_scores.reduce((s, x) => s + x.max, 0);
      pct = totMax > 0 ? (totScore / totMax) * 100 : 0;
    }
    const scaled = round2((pct / 100) * schemeTotalMarks);

    return {
      semester_scores,
      course_score: scaled,
      course_max: schemeTotalMarks,
      raw_course_score: course_score,
    };
  }

  async getMarksGrid(
    courseId: string,
    groupId: string,
    schoolId: string,
    paging?: PageQuery,
  ): Promise<CriterionMarksGridResponse> {
    const { course, scheme } = await this.loadGradedCourse(courseId, schoolId);
    const paged = Boolean(paging && wantsPage(paging.page));
    let group: Group;
    let students: ReturnType<GradedCriterionMarksService['toGridStudent']>[];
    let studentPage: { total: number; page: number; limit: number; pages: number } | null = null;
    if (paged && paging) {
      const loaded = await this.pageStudentsInGroup(groupId, schoolId, paging);
      group = loaded.group;
      students = loaded.students;
      studentPage = {
        total: loaded.total,
        page: loaded.page,
        limit: loaded.limit,
        pages: loaded.pages,
      };
    } else {
      const loaded = await this.studentsInGroup(groupId, schoolId);
      group = loaded.group;
      students = loaded.students;
    }
    const allCriteria = this.flattenCriteria(scheme);
    const activeResolved =
      await this.semesterService.resolveActiveGradedSemesterIndex(schoolId);
    const active_semester = activeResolved
      ? {
          id: activeResolved.semester.id,
          title: activeResolved.semester.title,
          semester_index: activeResolved.semester_index,
        }
      : null;
    const criteria = activeResolved
      ? allCriteria.filter((c) => c.semester_index === activeResolved.semester_index)
      : [];
    const criterionIds = criteria.map((c) => c.id);

    const markRows =
      criterionIds.length && students.length
        ? await this.markRepo.find({
            where: {
              graded_criterion_id: In(criterionIds),
              student_id: In(students.map((s) => s.id)),
            },
          })
        : [];

    const marks: Record<string, string | null> = {};
    for (const row of markRows) {
      marks[`${row.student_id}:::${row.graded_criterion_id}`] = row.mark;
    }

    return {
      course_id: course.id,
      course_name: course.name,
      group_id: group.id,
      group_name: group.name,
      total_marks: Number(scheme.total_marks),
      aggregation_method: scheme.aggregation_method,
      criteria,
      students,
      marks,
      active_semester,
      ...(studentPage
        ? {
            items: students,
            total: studentPage.total,
            page: studentPage.page,
            limit: studentPage.limit,
            pages: studentPage.pages,
          }
        : {}),
    };
  }

  async listGroupsPage(
    schoolId: string,
    actor: User,
    query: PageQuery,
  ): Promise<
    PageResult<{
      id: string;
      name: string;
      age_range_min: number;
      age_range_max: number;
      studentsCount: number;
      gradedCoursesCount: number;
    }>
  > {
    const qb = this.groupRepo
      .createQueryBuilder('g')
      .where('g.school_id = :schoolId', { schoolId })
      .orderBy('g.name', 'ASC')
      .addOrderBy('g.id', 'ASC');
    if (actor.role === 'teacher') {
      qb.andWhere(
        `EXISTS (
          SELECT 1 FROM schedules sch
          WHERE sch.group_id = g.id AND sch.teacher_id = :tid
        )`,
        { tid: actor.id },
      );
    }
    const page = await paginateQueryBuilder(qb, query);
    const ids = page.items.map((g) => g.id);
    const students = new Map<string, number>();
    const graded = new Map<string, number>();
    if (ids.length) {
      const studentRows = await this.studentRepo
        .createQueryBuilder('s')
        .innerJoin('s.groups', 'g', 'g.id IN (:...ids)', { ids })
        .select('g.id', 'group_id')
        .addSelect('COUNT(DISTINCT s.id)', 'cnt')
        .groupBy('g.id')
        .getRawMany<{ group_id: string; cnt: string }>();
      for (const row of studentRows) students.set(String(row.group_id), Number(row.cnt) || 0);

      const gradedQb = this.scheduleRepo
        .createQueryBuilder('sch')
        .innerJoin('sch.course', 'c', `c.course_kind = 'graded'`)
        .where('sch.group_id IN (:...ids)', { ids })
        .select('sch.group_id', 'group_id')
        .addSelect('COUNT(DISTINCT sch.course_id)', 'cnt')
        .groupBy('sch.group_id');
      if (actor.role === 'teacher') {
        gradedQb.andWhere('sch.teacher_id = :tid', { tid: actor.id });
      }
      const gradedRows = await gradedQb.getRawMany<{ group_id: string; cnt: string }>();
      for (const row of gradedRows) graded.set(String(row.group_id), Number(row.cnt) || 0);
    }
    return {
      ...page,
      items: page.items.map((g) => ({
        id: g.id,
        name: g.name,
        age_range_min: g.age_range_min,
        age_range_max: g.age_range_max,
        studentsCount: students.get(g.id) ?? 0,
        gradedCoursesCount: graded.get(g.id) ?? 0,
      })),
    };
  }

  async listGroupCoursesPage(
    schoolId: string,
    groupId: string,
    actor: User,
    query: PageQuery,
  ): Promise<
    PageResult<{
      id: string;
      title: string;
      time: string;
      day: string;
      criteriaCount: number;
    }>
  > {
    const group = await this.groupRepo.findOne({ where: { id: groupId } });
    if (!group || group.school_id !== schoolId) {
      throw new NotFoundException('Group not found');
    }
    const idQb = this.scheduleRepo
      .createQueryBuilder('sch')
      .innerJoin('sch.course', 'c')
      .where('sch.group_id = :gid', { gid: groupId })
      .andWhere('c.school_id = :sid', { sid: schoolId })
      .andWhere(`c.course_kind = 'graded'`)
      .andWhere('sch.course_id IS NOT NULL');
    if (actor.role === 'teacher') {
      idQb.andWhere('sch.teacher_id = :tid', { tid: actor.id });
    }
    const totalRow = await idQb.clone().select('COUNT(DISTINCT sch.course_id)', 'cnt').getRawOne<{ cnt: string }>();
    const total = Number(totalRow?.cnt || 0);
    const { page, limit } = parsePageQuery(query);
    const safePage = clampPage(page, total, limit);
    const idRows = await idQb
      .clone()
      .select('sch.course_id', 'id')
      .addSelect('MIN(c.name)', 'sort_name')
      .addSelect('MIN(sch.start_time)', 'start_time')
      .addSelect('MIN(sch.end_time)', 'end_time')
      .addSelect('MIN(sch.day_of_week)', 'day')
      .groupBy('sch.course_id')
      .orderBy('sort_name', 'ASC')
      .addOrderBy('sch.course_id', 'ASC')
      .offset((safePage - 1) * limit)
      .limit(limit)
      .getRawMany<{ id: string; sort_name: string; start_time: string; end_time: string; day: string }>();
    const ids = idRows.map((row) => String(row.id));
    if (!ids.length) return buildPage([], total, safePage, limit);

    const schemes = await this.schemeRepo.find({
      where: { course_id: In(ids) },
      relations: ['semesters', 'semesters.criteria'],
    });
    const criteriaCount = new Map(
      schemes.map((scheme) => [
        scheme.course_id,
        (scheme.semesters || []).reduce((n, sem) => n + (sem.criteria?.length || 0), 0),
      ]),
    );
    const items = idRows.map((row) => {
      const start = String(row.start_time || '').slice(0, 5);
      const end = String(row.end_time || '').slice(0, 5);
      return {
        id: String(row.id),
        title: row.sort_name || 'Course',
        time: [start, end].filter(Boolean).join(' – '),
        day: row.day || '',
        criteriaCount: criteriaCount.get(String(row.id)) ?? 0,
      };
    });
    return buildPage(items, total, safePage, limit);
  }

  async saveMarksGrid(
    schoolId: string,
    dto: SaveCriterionMarksGridDto,
    userId: string,
  ): Promise<{ saved: number }> {
    const { course, scheme } = await this.loadGradedCourse(dto.course_id, schoolId);
    const { students } = await this.studentsInGroup(dto.group_id, schoolId);
    const studentIds = new Set(students.map((s) => s.id));
    const allCriteria = this.flattenCriteria(scheme);
    const activeResolved =
      await this.semesterService.resolveActiveGradedSemesterIndex(schoolId);
    if (!activeResolved) {
      throw new BadRequestException(
        'No active semester is set. Activate one semester in school settings first.',
      );
    }
    const criteria = allCriteria.filter(
      (c) => c.semester_index === activeResolved.semester_index,
    );
    const criterionById = new Map(criteria.map((c) => [c.id, c]));

    let saved = 0;
    for (const entry of dto.entries) {
      if (!studentIds.has(entry.student_id)) {
        throw new BadRequestException(
          `Student ${entry.student_id} is not in this group`,
        );
      }
      const criterion = criterionById.get(entry.graded_criterion_id);
      if (!criterion) {
        throw new BadRequestException(
          `Criterion ${entry.graded_criterion_id} is not on the active semester for this course`,
        );
      }

      const clear =
        entry.mark === null ||
        entry.mark === undefined ||
        (typeof entry.mark === 'number' && Number.isNaN(entry.mark));

      const existing = await this.markRepo.findOne({
        where: {
          graded_criterion_id: entry.graded_criterion_id,
          student_id: entry.student_id,
        },
      });

      if (clear) {
        if (existing) {
          await this.markRepo.remove(existing);
          saved += 1;
        }
        continue;
      }

      const markNum = Number(entry.mark);
      if (markNum < 0 || markNum > criterion.max_marks + 0.001) {
        throw new BadRequestException(
          `Mark for "${criterion.label}" must be between 0 and ${criterion.max_marks}`,
        );
      }

      if (existing) {
        existing.mark = String(round2(markNum));
        existing.updated_by_user_id = userId;
        await this.markRepo.save(existing);
      } else {
        await this.markRepo.save(
          this.markRepo.create({
            graded_criterion_id: entry.graded_criterion_id,
            student_id: entry.student_id,
            mark: String(round2(markNum)),
            updated_by_user_id: userId,
          }),
        );
      }
      saved += 1;
    }

    const touched = [...new Set(dto.entries.filter((e) => e.mark != null).map((e) => e.student_id))];
    if (touched.length) {
      void this.notifyMarks(schoolId, dto.course_id, course.name || course.title || '', touched);
    }

    return { saved };
  }

  private async notifyMarks(schoolId: string, _courseId: string, courseName: string, studentIds: string[]): Promise<void> {
    for (const studentId of studentIds) {
      const { studentName, recipients } = await this.audience.parentsOfStudent(studentId);
      if (!recipients.length) continue;
      await this.notifications.notifySafe({
        schoolId,
        templateKey: NOTIFICATION_TEMPLATE_KEYS.GRADE_MARKS_UPDATED,
        locale: 'ar',
        variables: {
          studentName,
          recipientName: recipients[0]?.name || 'ولي الأمر',
          courseName,
        },
        recipients,
      });
    }
  }

  async classReport(
    courseId: string,
    groupId: string,
    schoolId: string,
  ): Promise<ClassReportResponse> {
    const grid = await this.getMarksGrid(courseId, groupId, schoolId);
    const students = grid.students.map((s) => {
      const marks: Record<string, number | null> = {};
      const marksByCriterion: Record<string, number | null> = {};
      for (const c of grid.criteria) {
        const raw = grid.marks[`${s.id}:::${c.id}`];
        const n = parseMark(raw);
        marks[c.id] = n;
        marksByCriterion[c.id] = n;
      }
      const scores = this.computeScores(
        grid.criteria,
        marksByCriterion,
        grid.aggregation_method,
        grid.total_marks,
      );
      return {
        id: s.id,
        name: s.name,
        marks,
        semester_scores: scores.semester_scores.map((x) => ({
          semester_index: x.semester_index,
          score: x.score,
          max: x.max,
        })),
        course_score: scores.course_score,
        course_max: scores.course_max,
      };
    });

    return {
      course_id: grid.course_id,
      course_name: grid.course_name,
      group_id: grid.group_id,
      group_name: grid.group_name,
      total_marks: grid.total_marks,
      aggregation_method: grid.aggregation_method,
      criteria: grid.criteria,
      students,
    };
  }

  async studentReport(
    studentId: string,
    schoolId: string,
  ): Promise<StudentReportResponse> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId, school_id: schoolId },
    });
    if (!student) {
      throw new NotFoundException('Student not found');
    }

    const schemes = await this.schemeRepo
      .createQueryBuilder('scheme')
      .innerJoinAndSelect('scheme.course', 'course')
      .leftJoinAndSelect('scheme.semesters', 'semesters')
      .leftJoinAndSelect('semesters.criteria', 'criteria')
      .where('course.school_id = :sid', { sid: schoolId })
      .andWhere('course.course_kind = :kind', { kind: 'graded' })
      .orderBy('course.name', 'ASC')
      .addOrderBy('semesters.semester_index', 'ASC')
      .addOrderBy('criteria.sort_order', 'ASC')
      .getMany();

    const allCriterionIds = schemes.flatMap((sch) =>
      this.flattenCriteria(sch).map((c) => c.id),
    );
    const markRows = allCriterionIds.length
      ? await this.markRepo.find({
          where: {
            student_id: studentId,
            graded_criterion_id: In(allCriterionIds),
          },
        })
      : [];
    const markMap = new Map(
      markRows.map((r) => [r.graded_criterion_id, parseMark(r.mark)]),
    );

    const courses = schemes
      .map((scheme) => {
        const criteria = this.flattenCriteria(scheme);
        const hasAny = criteria.some((c) => markMap.has(c.id));
        if (!hasAny && criteria.length === 0) return null;

        const marksByCriterion: Record<string, number | null> = {};
        const criteriaOut = criteria.map((c) => {
          const mark = markMap.has(c.id) ? markMap.get(c.id)! : null;
          marksByCriterion[c.id] = mark;
          return {
            id: c.id,
            label: c.label,
            max_marks: c.max_marks,
            semester_index: c.semester_index,
            mark,
          };
        });

        // Include course if student has any mark OR always include graded courses they might be in
        // Prefer only courses with at least one mark entered
        if (!hasAny) return null;

        const scores = this.computeScores(
          criteria,
          marksByCriterion,
          scheme.aggregation_method,
          Number(scheme.total_marks),
        );

        return {
          course_id: scheme.course_id,
          course_name: scheme.course?.name || scheme.course_id,
          total_marks: Number(scheme.total_marks),
          aggregation_method: scheme.aggregation_method,
          semester_scores: scores.semester_scores,
          course_score: scores.course_score,
          course_max: scores.course_max,
          criteria: criteriaOut,
        };
      })
      .filter(Boolean) as StudentReportResponse['courses'];

    return {
      student_id: student.id,
      student_name:
        `${student.firstName || ''} ${student.lastName || ''}`.trim() ||
        student.id,
      courses,
    };
  }
}
