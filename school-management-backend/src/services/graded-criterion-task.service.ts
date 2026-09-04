import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { GradedCriterionTeacherTask } from '../entities/graded-criterion-teacher-task.entity';
import { GradedCriterionTaskStudentMark } from '../entities/graded-criterion-task-student-mark.entity';
import { GradedCriterion } from '../entities/graded-criterion.entity';
import { Course } from '../entities/course.entity';
import { Schedule } from '../entities/schedule.entity';
import { Group } from '../entities/group.entity';
import { Student } from '../entities/student.entity';
import { GradedAssessmentService } from './graded-assessment.service';
import type {
  AppendGradedCriterionTaskDto,
  PatchGradedCriterionTaskDto,
  SaveMarksGridDto,
  SyncGradedCriterionTasksDto,
} from '../dto/graded-criterion-task.dto';

/** `date` columns from Postgres are often strings (`YYYY-MM-DD`); avoid calling `.toISOString()` on them. */
function formatTaskDueDateYmd(d: Date | string | null | undefined): string | null {
  if (d == null) return null;
  if (typeof d === 'string') {
    const s = d.trim();
    return s.length >= 10 ? s.slice(0, 10) : s || null;
  }
  if (d instanceof Date && !Number.isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return null;
}

export type GradedCourseSummaryForTeacher = {
  course_id: string;
  course_name: string;
  groups: { id: string; name: string }[];
};

export type CriterionTaskSummary = {
  criterion_id: string;
  label: string;
  semester_index: number;
  semester_title: string | null;
  groups: {
    group_id: string;
    group_name: string;
    tasks: {
      id: string;
      description: string | null;
      due_date: string | null;
      sort_order: number;
      is_system_default: boolean;
    }[];
  }[];
};

export type MarksGridResponse = {
  graded_criterion_id: string;
  criterion_label: string;
  criterion_max_marks: string;
  tasks: {
    id: string;
    description: string | null;
    due_date: string | null;
    sort_order: number;
  }[];
  students: { id: string; name: string }[];
  /** `${studentId}:::${taskId}` → mark string or null */
  marks: Record<string, string | null>;
};

@Injectable()
export class GradedCriterionTaskService {
  constructor(
    @InjectRepository(GradedCriterionTeacherTask)
    private readonly taskRepo: Repository<GradedCriterionTeacherTask>,
    @InjectRepository(GradedCriterion)
    private readonly criterionRepo: Repository<GradedCriterion>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Group)
    private readonly groupRepo: Repository<Group>,
    @InjectRepository(GradedCriterionTaskStudentMark)
    private readonly markRepo: Repository<GradedCriterionTaskStudentMark>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly gradedAssessmentService: GradedAssessmentService,
  ) {}

  resolveTeacherId(
    user: { id: string; role?: string; user_type?: string },
    forTeacherId?: string,
  ): string {
    const userRole = user.role || user.user_type;
    if (userRole === 'teacher') {
      return user.id;
    }
    if (userRole === 'admin') {
      if (!forTeacherId) {
        throw new BadRequestException(
          'for_teacher_id is required when using this endpoint as admin',
        );
      }
      return forTeacherId;
    }
    throw new ForbiddenException('Only teachers and admins may use this feature');
  }

  async getEligibleGradedCoursesForTeacher(
    teacherId: string,
    schoolId: number,
  ): Promise<GradedCourseSummaryForTeacher[]> {
    const byCourse = new Map<
      string,
      { name: string; groupIds: Set<string> }
    >();

    const schedules = await this.scheduleRepo
      .createQueryBuilder('s')
      .innerJoinAndSelect('s.course', 'course')
      .where('s.teacher_id = :tid', { tid: teacherId })
      .andWhere('s.status = :st', { st: 'active' })
      .andWhere('course.school_id = :sid', { sid: schoolId })
      .andWhere('course.course_kind = :ck', { ck: 'graded' })
      .andWhere('s.group_id IS NOT NULL')
      .andWhere('s.course_id IS NOT NULL')
      .getMany();

    for (const s of schedules) {
      const cid = s.course_id as string;
      if (!byCourse.has(cid)) {
        byCourse.set(cid, {
          name: s.course?.name || s.course?.title || 'Course',
          groupIds: new Set(),
        });
      }
      byCourse.get(cid)!.groupIds.add(s.group_id as string);
    }

    const taskRows = await this.taskRepo.find({
      where: { teacher_id: teacherId },
      relations: ['course'],
    });
    for (const t of taskRows) {
      const c = t.course;
      if (
        !c ||
        c.school_id !== schoolId ||
        c.course_kind !== 'graded' ||
        !t.group_id
      ) {
        continue;
      }
      const cid = t.course_id;
      if (!byCourse.has(cid)) {
        byCourse.set(cid, {
          name: c.name || c.title || 'Course',
          groupIds: new Set(),
        });
      }
      byCourse.get(cid)!.groupIds.add(t.group_id);
    }

    const courseIds = [...byCourse.keys()];
    if (!courseIds.length) return [];

    const courses = await this.courseRepo.find({
      where: { id: In(courseIds), school_id: schoolId, course_kind: 'graded' },
    });

    const result: GradedCourseSummaryForTeacher[] = [];
    for (const c of courses) {
      const meta = byCourse.get(c.id);
      if (!meta) continue;
      const groups = await this.groupRepo.find({
        where: { id: In([...meta.groupIds]) },
        select: ['id', 'name'],
        order: { name: 'ASC' },
      });
      result.push({
        course_id: c.id,
        course_name: c.name || c.title || 'Course',
        groups: groups.map((g) => ({ id: g.id, name: g.name })),
      });
    }

    result.sort((a, b) => a.course_name.localeCompare(b.course_name));
    return result;
  }

  private async assertTeacherTeachesCourseOnGroup(
    teacherId: string,
    courseId: string,
    groupId: string,
  ): Promise<void> {
    const row = await this.scheduleRepo.findOne({
      where: {
        teacher_id: teacherId,
        course_id: courseId,
        group_id: groupId,
        status: 'active',
      },
    });
    if (row) return;

    const existingTask = await this.taskRepo.findOne({
      where: {
        teacher_id: teacherId,
        course_id: courseId,
        group_id: groupId,
      },
    });
    if (existingTask) return;

    throw new ForbiddenException(
      'You do not have this graded course for this class on your active timetable, and you have no existing tasks for this class.',
    );
  }

  private async getCourseIdForCriterion(criterionId: string): Promise<string> {
    const crit = await this.criterionRepo.findOne({
      where: { id: criterionId },
      relations: ['semester', 'semester.scheme'],
    });
    if (!crit?.semester?.scheme) {
      throw new NotFoundException('Criterion not found');
    }
    return crit.semester.scheme.course_id;
  }

  async getCourseTaskSummary(
    courseId: string,
    schoolId: number,
    teacherId: string,
  ): Promise<CriterionTaskSummary[]> {
    const graded = await this.gradedAssessmentService.findGradedOne(
      courseId,
      schoolId,
    );
    if (!graded.graded_scheme?.semesters?.length) {
      return [];
    }

    const eligible = await this.getEligibleGradedCoursesForTeacher(
      teacherId,
      schoolId,
    );
    const entry = eligible.find((e) => e.course_id === courseId);
    if (!entry) {
      throw new ForbiddenException(
        'You do not teach this graded course on the timetable for this school',
      );
    }

    const summaries: CriterionTaskSummary[] = [];

    for (const sem of graded.graded_scheme.semesters) {
      const criteria = [...(sem.criteria || [])].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      for (const c of criteria) {
        const groupsPayload: CriterionTaskSummary['groups'] = [];
        for (const g of entry.groups) {
          await this.ensureSystemDefaultIfEmpty(teacherId, courseId, c.id, g.id);
          const tasks = await this.taskRepo.find({
            where: {
              teacher_id: teacherId,
              graded_criterion_id: c.id,
              group_id: g.id,
            },
            order: { sort_order: 'ASC', created_at: 'ASC' },
          });
          groupsPayload.push({
            group_id: g.id,
            group_name: g.name,
            tasks: tasks.map((t) => ({
              id: t.id,
              description: t.description,
              due_date: formatTaskDueDateYmd(t.due_date),
              sort_order: t.sort_order,
              is_system_default: t.is_system_default,
            })),
          });
        }
        summaries.push({
          criterion_id: c.id,
          label: c.label,
          semester_index: sem.semester_index,
          semester_title: sem.title,
          groups: groupsPayload,
        });
      }
    }

    return summaries;
  }

  private async ensureSystemDefaultIfEmpty(
    teacherId: string,
    courseId: string,
    criterionId: string,
    groupId: string,
  ): Promise<void> {
    await this.assertTeacherTeachesCourseOnGroup(
      teacherId,
      courseId,
      groupId,
    );
    const n = await this.taskRepo.count({
      where: {
        teacher_id: teacherId,
        graded_criterion_id: criterionId,
        group_id: groupId,
      },
    });
    if (n > 0) return;
    const row = this.taskRepo.create({
      graded_criterion_id: criterionId,
      teacher_id: teacherId,
      group_id: groupId,
      course_id: courseId,
      description: null,
      due_date: null,
      sort_order: 0,
      is_system_default: true,
    });
    await this.taskRepo.save(row);
  }

  async appendTask(
    teacherId: string,
    dto: AppendGradedCriterionTaskDto,
  ): Promise<GradedCriterionTeacherTask> {
    const courseId = await this.getCourseIdForCriterion(dto.graded_criterion_id);
    await this.assertTeacherTeachesCourseOnGroup(
      teacherId,
      courseId,
      dto.group_id,
    );

    await this.taskRepo.delete({
      teacher_id: teacherId,
      graded_criterion_id: dto.graded_criterion_id,
      group_id: dto.group_id,
      is_system_default: true,
    });

    const raw = await this.taskRepo
      .createQueryBuilder('t')
      .select('MAX(t.sort_order)', 'max')
      .where('t.teacher_id = :tid', { tid: teacherId })
      .andWhere('t.graded_criterion_id = :cid', { cid: dto.graded_criterion_id })
      .andWhere('t.group_id = :gid', { gid: dto.group_id })
      .getRawOne();
    const maxSort =
      raw?.max !== undefined && raw?.max !== null
        ? parseInt(String(raw.max), 10)
        : -1;
    const nextOrder = Number.isFinite(maxSort) ? maxSort + 1 : 0;

    const row = this.taskRepo.create({
      graded_criterion_id: dto.graded_criterion_id,
      teacher_id: teacherId,
      group_id: dto.group_id,
      course_id: courseId,
      description: dto.description?.trim() || null,
      due_date: dto.due_date ? new Date(dto.due_date) : null,
      sort_order: nextOrder,
      is_system_default: false,
    });
    return this.taskRepo.save(row);
  }

  async syncTasks(
    teacherId: string,
    dto: SyncGradedCriterionTasksDto,
  ): Promise<{ groups_touched: number; tasks_created: number }> {
    const courseId = await this.getCourseIdForCriterion(dto.graded_criterion_id);

    let targetGroupIds: string[];
    if (dto.apply_to_all_classes) {
      const courseRow = await this.courseRepo.findOneOrFail({
        where: { id: courseId },
        select: ['id', 'school_id'],
      });
      const eligible = await this.getEligibleGradedCoursesForTeacher(
        teacherId,
        courseRow.school_id,
      );
      const entry = eligible.find((e) => e.course_id === courseId);
      if (!entry?.groups.length) {
        throw new BadRequestException('No classes on your timetable for this course');
      }
      targetGroupIds = entry.groups.map((g) => g.id);
    } else {
      if (!dto.group_ids?.length) {
        throw new BadRequestException(
          'group_ids is required when apply_to_all_classes is false',
        );
      }
      targetGroupIds = dto.group_ids;
    }

    for (const gid of targetGroupIds) {
      await this.assertTeacherTeachesCourseOnGroup(teacherId, courseId, gid);
    }

    let created = 0;
    for (const gid of targetGroupIds) {
      await this.taskRepo.delete({
        teacher_id: teacherId,
        graded_criterion_id: dto.graded_criterion_id,
        group_id: gid,
      });

      if (!dto.tasks.length) {
        const row = this.taskRepo.create({
          graded_criterion_id: dto.graded_criterion_id,
          teacher_id: teacherId,
          group_id: gid,
          course_id: courseId,
          description: null,
          due_date: null,
          sort_order: 0,
          is_system_default: true,
        });
        await this.taskRepo.save(row);
        created += 1;
      } else {
        let i = 0;
        for (const line of dto.tasks) {
          const row = this.taskRepo.create({
            graded_criterion_id: dto.graded_criterion_id,
            teacher_id: teacherId,
            group_id: gid,
            course_id: courseId,
            description: line.description?.trim() || null,
            due_date: line.due_date ? new Date(line.due_date) : null,
            sort_order: i++,
            is_system_default: false,
          });
          await this.taskRepo.save(row);
          created += 1;
        }
      }
    }

    return { groups_touched: targetGroupIds.length, tasks_created: created };
  }

  async patchTask(
    teacherId: string,
    taskId: string,
    dto: PatchGradedCriterionTaskDto,
  ): Promise<GradedCriterionTeacherTask> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task || task.teacher_id !== teacherId) {
      throw new NotFoundException('Task not found');
    }
    if (dto.description !== undefined) {
      task.description =
        dto.description === null ? null : dto.description.trim() || null;
    }
    if (dto.due_date !== undefined) {
      task.due_date = dto.due_date ? new Date(dto.due_date) : null;
    }
    if (dto.sort_order !== undefined) {
      task.sort_order = dto.sort_order;
    }
    return this.taskRepo.save(task);
  }

  async deleteTask(teacherId: string, taskId: string): Promise<void> {
    const task = await this.taskRepo.findOne({ where: { id: taskId } });
    if (!task || task.teacher_id !== teacherId) {
      throw new NotFoundException('Task not found');
    }
    const { graded_criterion_id, group_id, course_id } = task;
    await this.taskRepo.remove(task);

    const remaining = await this.taskRepo.count({
      where: {
        teacher_id: teacherId,
        graded_criterion_id,
        group_id,
      },
    });
    if (remaining === 0) {
      await this.ensureSystemDefaultIfEmpty(
        teacherId,
        course_id,
        graded_criterion_id,
        group_id,
      );
    }
  }

  async getMarksGrid(
    teacherId: string,
    schoolId: number,
    groupId: string,
    courseId: string,
    criterionId: string,
  ): Promise<MarksGridResponse> {
    const resolvedCourseId = await this.getCourseIdForCriterion(criterionId);
    if (resolvedCourseId !== courseId) {
      throw new BadRequestException('Criterion does not belong to this course');
    }
    await this.assertTeacherTeachesCourseOnGroup(teacherId, courseId, groupId);

    const course = await this.courseRepo.findOne({
      where: { id: courseId, school_id: schoolId, course_kind: 'graded' },
    });
    if (!course) {
      throw new NotFoundException('Graded course not found for this school');
    }

    const crit = await this.criterionRepo.findOne({ where: { id: criterionId } });
    if (!crit) {
      throw new NotFoundException('Criterion not found');
    }

    await this.ensureSystemDefaultIfEmpty(
      teacherId,
      courseId,
      criterionId,
      groupId,
    );

    const tasks = await this.taskRepo.find({
      where: {
        teacher_id: teacherId,
        graded_criterion_id: criterionId,
        group_id: groupId,
      },
      order: { sort_order: 'ASC', created_at: 'ASC' },
    });

    const students = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g', 'g.id = :gid', { gid: groupId })
      .orderBy('s.firstName', 'ASC')
      .addOrderBy('s.lastName', 'ASC')
      .getMany();

    const taskIds = tasks.map((t) => t.id);
    const marksRows =
      taskIds.length === 0
        ? []
        : await this.markRepo.find({
            where: { graded_criterion_teacher_task_id: In(taskIds) },
          });

    const marks: Record<string, string | null> = {};
    for (const m of marksRows) {
      const key = `${m.student_id}:::${m.graded_criterion_teacher_task_id}`;
      marks[key] = m.mark != null ? String(m.mark) : null;
    }

    return {
      graded_criterion_id: criterionId,
      criterion_label: crit.label,
      criterion_max_marks: crit.max_marks,
      tasks: tasks.map((t) => ({
        id: t.id,
        description: t.description,
        due_date: formatTaskDueDateYmd(t.due_date),
        sort_order: t.sort_order,
      })),
      students: students.map((s) => ({
        id: s.id,
        name: [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.id,
      })),
      marks,
    };
  }

  async saveMarksGrid(
    teacherId: string,
    schoolId: number,
    dto: SaveMarksGridDto,
  ): Promise<{ saved: number }> {
    const resolvedCourseId = await this.getCourseIdForCriterion(dto.graded_criterion_id);
    if (resolvedCourseId !== dto.course_id) {
      throw new BadRequestException('Criterion does not belong to this course');
    }
    await this.assertTeacherTeachesCourseOnGroup(
      teacherId,
      dto.course_id,
      dto.group_id,
    );

    const course = await this.courseRepo.findOne({
      where: { id: dto.course_id, school_id: schoolId, course_kind: 'graded' },
    });
    if (!course) {
      throw new NotFoundException('Graded course not found for this school');
    }

    const groupStudents = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g', 'g.id = :gid', { gid: dto.group_id })
      .getMany();
    const studentIds = new Set(groupStudents.map((s) => s.id));

    let saved = 0;
    for (const e of dto.entries) {
      if (!studentIds.has(e.student_id)) {
        throw new ForbiddenException('Student is not in the selected group');
      }
      const task = await this.taskRepo.findOne({
        where: { id: e.graded_criterion_teacher_task_id },
      });
      if (
        !task ||
        task.teacher_id !== teacherId ||
        task.group_id !== dto.group_id ||
        task.graded_criterion_id !== dto.graded_criterion_id ||
        task.course_id !== dto.course_id
      ) {
        throw new BadRequestException('Invalid task for this criterion or class');
      }

      const markVal = e.mark;
      const cleared =
        markVal === null ||
        markVal === undefined ||
        (typeof markVal === 'number' && Number.isNaN(markVal));

      const existing = await this.markRepo.findOne({
        where: {
          graded_criterion_teacher_task_id: e.graded_criterion_teacher_task_id,
          student_id: e.student_id,
        },
      });

      if (cleared) {
        if (existing) {
          await this.markRepo.remove(existing);
        }
        continue;
      }

      const strMark = String(markVal);
      if (existing) {
        existing.mark = strMark;
        existing.updated_by_teacher_id = teacherId;
        await this.markRepo.save(existing);
      } else {
        await this.markRepo.save(
          this.markRepo.create({
            graded_criterion_teacher_task_id: e.graded_criterion_teacher_task_id,
            student_id: e.student_id,
            mark: strMark,
            updated_by_teacher_id: teacherId,
          }),
        );
      }
      saved += 1;
    }

    return { saved };
  }
}
