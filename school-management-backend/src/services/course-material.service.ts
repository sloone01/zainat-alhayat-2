import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync, mkdirSync, unlinkSync } from 'fs';
import { extname, join } from 'path';
import { In, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { CourseMaterial } from '../entities/course-material.entity';
import { CourseMaterialTopic } from '../entities/course-material-topic.entity';
import { Phase } from '../entities/phase.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { Schedule } from '../entities/schedule.entity';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { isParentOrStudentActor } from '../common/security/school-access';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NotificationAudienceService } from '../notifications/notification-audience.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import {
  COURSE_MATERIAL_ALLOWED_EXTS,
  COURSE_MATERIAL_ALLOWED_MIMES,
  COURSE_MATERIAL_MAX_BYTES,
} from '../constants/course-materials';

export type CourseMaterialDto = {
  id: string;
  course_id: string;
  course_name: string | null;
  course_kind: string;
  phase_id: string | null;
  topic_id: string | null;
  title: string;
  description: string | null;
  original_filename: string;
  mime_type: string;
  file_size: number;
  file_ext: string;
  is_visible: boolean;
  uploaded_by_user_id: string | null;
  created_at: Date;
};

export type CourseMaterialPhaseDto = {
  id: string;
  name: string;
  order: number;
};

export type CourseMaterialTopicDto = {
  id: string;
  course_id: string;
  title: string;
  sort_order: number;
};

export type CourseMaterialBoardDto = {
  phases: CourseMaterialPhaseDto[];
  topics: CourseMaterialTopicDto[];
  materials: CourseMaterialDto[];
};

@Injectable()
export class CourseMaterialService implements OnModuleInit {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'course-materials');

  constructor(
    @InjectRepository(CourseMaterial)
    private readonly materialRepo: Repository<CourseMaterial>,
    @InjectRepository(CourseMaterialTopic)
    private readonly topicRepo: Repository<CourseMaterialTopic>,
    @InjectRepository(Phase)
    private readonly phaseRepo: Repository<Phase>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
    @InjectRepository(StudentCourseEnrollment)
    private readonly enrollmentRepo: Repository<StudentCourseEnrollment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Parent)
    private readonly parentRepo: Repository<Parent>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    private readonly notifications: NotificationDispatcherService,
    private readonly audience: NotificationAudienceService,
  ) {}

  onModuleInit() {
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadDir(): string {
    return this.uploadDir;
  }

  absolutePath(storedFilename: string): string {
    return join(this.uploadDir, storedFilename);
  }

  validateUploadFile(file: Express.Multer.File): string {
    if (!file) {
      throw new BadRequestException('No file provided');
    }
    if (file.size > COURSE_MATERIAL_MAX_BYTES) {
      throw new BadRequestException('File size exceeds 20MB limit');
    }
    const ext = extname(file.originalname || '').toLowerCase();
    if (
      !(COURSE_MATERIAL_ALLOWED_EXTS as readonly string[]).includes(ext)
    ) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${COURSE_MATERIAL_ALLOWED_EXTS.join(', ')}`,
      );
    }
    const mime = (file.mimetype || '').toLowerCase();
    if (mime && !COURSE_MATERIAL_ALLOWED_MIMES.has(mime)) {
      // Still allow if extension is OK — some clients send odd MIME for rar/office
      if (!(COURSE_MATERIAL_ALLOWED_EXTS as readonly string[]).includes(ext)) {
        throw new BadRequestException('Invalid file MIME type');
      }
    }
    return ext;
  }

  private assertSchool(user: User, schoolId: string) {
    if (user.school_id != null && String(user.school_id) !== String(schoolId)) {
      throw new ForbiddenException('You can only access your school');
    }
  }

  private async teacherTeachesCourse(
    teacherId: string,
    courseId: string,
  ): Promise<boolean> {
    const cnt = await this.scheduleRepo.count({
      where: { course_id: courseId, teacher_id: teacherId },
    });
    return cnt > 0;
  }

  private async parentLinkedStudentIds(userId: string): Promise<string[]> {
    const rows = await this.parentRepo
      .createQueryBuilder('p')
      .innerJoin('student_parents', 'sp', 'sp.parent_id = p.id')
      .select('sp.student_id', 'student_id')
      .where('p.user_id = :uid', { uid: userId })
      .getRawMany<{ student_id: string }>();
    return rows.map((r) => r.student_id);
  }

  /** Same source as the parent timetable: child’s class groups → `schedules.course_id`. */
  private async timetableCourseIdsForStudents(studentIds: string[]): Promise<string[]> {
    if (!studentIds.length) return [];
    const rows = await this.studentRepo.manager
      .createQueryBuilder()
      .select('DISTINCT sch.course_id', 'course_id')
      .from('student_groups', 'sg')
      .innerJoin('schedules', 'sch', 'sch.group_id = sg.group_id')
      .where('sg.student_id IN (:...ids)', { ids: studentIds })
      .andWhere('sch.course_id IS NOT NULL')
      .andWhere("(sch.status IS NULL OR sch.status = 'active')")
      .getRawMany<{ course_id: string }>();
    return (rows as { course_id: string }[])
      .map((r) => r.course_id)
      .filter(Boolean);
  }

  private async studentCanAccessCourse(
    studentId: string,
    courseId: string,
  ): Promise<boolean> {
    const enrolled = await this.enrollmentRepo.count({
      where: {
        student_id: studentId,
        course_id: courseId,
        status: 'active',
      },
    });
    if (enrolled > 0) return true;

    const viaTimetable = await this.timetableCourseIdsForStudents([studentId]);
    return viaTimetable.includes(courseId);
  }

  async assertCanManage(
    user: User,
    courseId: string,
    schoolId: string,
  ): Promise<Course> {
    this.assertSchool(user, schoolId);
    const course = await this.courseRepo.findOne({
      where: { id: courseId, school_id: schoolId },
    });
    if (!course) throw new NotFoundException('Course not found');

    if (user.role === 'admin') return course;
    if (user.role === 'teacher') {
      const ok = await this.teacherTeachesCourse(user.id, courseId);
      if (!ok) {
        throw new ForbiddenException(
          'You may only manage materials for courses you teach',
        );
      }
      return course;
    }
    throw new ForbiddenException('Only teachers and admins can upload materials');
  }

  async assertCanDownload(
    user: User,
    material: CourseMaterial,
  ): Promise<void> {
    this.assertSchool(user, material.school_id);

    if (user.role === 'admin') return;
    if (user.role === 'teacher') {
      const ok = await this.teacherTeachesCourse(user.id, material.course_id);
      if (ok) return;
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'parent' || user.user_type === 'parent') {
      const kids = await this.parentLinkedStudentIds(user.id);
      for (const sid of kids) {
        if (await this.studentCanAccessCourse(sid, material.course_id)) return;
      }
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'student') {
      const viaUser = await this.studentRepo
        .createQueryBuilder('s')
        .where('s.school_id = :sid', { sid: material.school_id })
        .andWhere('(s.user_id = :uid OR s.email = :email)', {
          uid: user.id,
          email: user.email,
        })
        .getOne();
      if (
        viaUser &&
        (await this.studentCanAccessCourse(viaUser.id, material.course_id))
      ) {
        return;
      }
      throw new ForbiddenException('Access denied');
    }
    throw new ForbiddenException('Access denied');
  }

  private toDto(m: CourseMaterial): CourseMaterialDto {
    return {
      id: m.id,
      course_id: m.course_id,
      course_name: m.course?.name || m.course?.title || null,
      course_kind: m.course?.course_kind || 'milestone',
      phase_id: m.phase_id || null,
      topic_id: m.topic_id || null,
      title: m.title,
      description: m.description,
      original_filename: m.original_filename,
      mime_type: m.mime_type,
      file_size: m.file_size,
      file_ext: m.file_ext,
      is_visible: m.is_visible,
      uploaded_by_user_id: m.uploaded_by_user_id,
      created_at: m.created_at,
    };
  }

  private toTopicDto(t: CourseMaterialTopic): CourseMaterialTopicDto {
    return {
      id: t.id,
      course_id: t.course_id,
      title: t.title,
      sort_order: t.sort_order,
    };
  }

  async assertCanListCourse(
    user: User,
    schoolId: string,
    courseId: string,
  ): Promise<Course> {
    this.assertSchool(user, schoolId);
    const course = await this.courseRepo.findOne({
      where: { id: courseId, school_id: schoolId },
    });
    if (!course) throw new NotFoundException('Course not found');

    const canManage =
      user.role === 'admin' ||
      (user.role === 'teacher' &&
        (await this.teacherTeachesCourse(user.id, courseId)));

    if (canManage) return course;

    if (user.role === 'parent' || user.user_type === 'parent') {
      const kids = await this.parentLinkedStudentIds(user.id);
      for (const sid of kids) {
        if (await this.studentCanAccessCourse(sid, courseId)) return course;
      }
      throw new ForbiddenException('Access denied');
    }
    if (user.role === 'student') {
      const viaUser = await this.studentRepo
        .createQueryBuilder('s')
        .where('s.school_id = :sid', { sid: schoolId })
        .andWhere('(s.user_id = :uid OR s.email = :email)', {
          uid: user.id,
          email: user.email,
        })
        .getOne();
      if (
        viaUser &&
        (await this.studentCanAccessCourse(viaUser.id, courseId))
      ) {
        return course;
      }
      throw new ForbiddenException('Access denied');
    }
    throw new ForbiddenException('Access denied');
  }

  private async resolveSection(
    courseId: string,
    schoolId: string,
    phaseId?: string | null,
    topicId?: string | null,
  ): Promise<{ phase_id: string | null; topic_id: string | null }> {
    const phase = (phaseId || '').trim() || null;
    const topic = (topicId || '').trim() || null;
    if (phase && topic) {
      throw new BadRequestException('Use either phase_id or topic_id, not both');
    }
    if (phase) {
      const row = await this.phaseRepo.findOne({
        where: { id: phase, course_id: courseId },
      });
      if (!row) throw new BadRequestException('phase_id is invalid for this course');
      return { phase_id: row.id, topic_id: null };
    }
    if (topic) {
      const row = await this.topicRepo.findOne({
        where: { id: topic, course_id: courseId, school_id: schoolId },
      });
      if (!row) throw new BadRequestException('topic_id is invalid for this course');
      return { phase_id: null, topic_id: row.id };
    }
    return { phase_id: null, topic_id: null };
  }

  async listForCourse(
    user: User,
    schoolId: string | null | undefined,
    courseId: string,
  ): Promise<CourseMaterialDto[]> {
    const board = await this.getBoard(user, schoolId, courseId);
    return board.materials;
  }

  async getBoard(
    user: User,
    schoolId: string | null | undefined,
    courseId: string,
  ): Promise<CourseMaterialBoardDto> {
    let sid = schoolId || null;
    if (!sid) {
      const course = await this.courseRepo.findOne({ where: { id: courseId } });
      if (!course) throw new NotFoundException('Course not found');
      sid = course.school_id;
    }
    await this.assertCanListCourse(user, sid, courseId);

    const canManage =
      user.role === 'admin' ||
      (user.role === 'teacher' &&
        (await this.teacherTeachesCourse(user.id, courseId)));

    const [phases, topics, rows] = await Promise.all([
      this.phaseRepo.find({
        where: { course_id: courseId },
        order: { order: 'ASC' },
      }),
      this.topicRepo.find({
        where: { course_id: courseId, school_id: sid },
        order: { sort_order: 'ASC', created_at: 'ASC' },
      }),
      this.materialRepo
        .createQueryBuilder('m')
        .leftJoinAndSelect('m.course', 'course')
        .where('m.course_id = :cid', { cid: courseId })
        .andWhere('m.school_id = :sid', { sid })
        .andWhere(canManage ? '1=1' : 'm.is_visible = true')
        .orderBy('m.created_at', 'DESC')
        .getMany(),
    ]);

    return {
      phases: phases.map((p) => ({
        id: p.id,
        name: p.name || '',
        order: p.order,
      })),
      topics: topics.map((t) => this.toTopicDto(t)),
      materials: rows.map((r) => this.toDto(r)),
    };
  }

  async createTopic(
    user: User,
    schoolId: string,
    courseId: string,
    title: string,
  ): Promise<CourseMaterialTopicDto> {
    await this.assertCanManage(user, courseId, schoolId);
    const trimmed = (title || '').trim().slice(0, 255);
    if (!trimmed) throw new BadRequestException('title is required');

    const last = await this.topicRepo.findOne({
      where: { course_id: courseId, school_id: schoolId },
      order: { sort_order: 'DESC' },
    });
    const row = this.topicRepo.create({
      school_id: schoolId,
      course_id: courseId,
      title: trimmed,
      sort_order: last ? last.sort_order + 1 : 0,
    });
    const saved = await this.topicRepo.save(row);
    return this.toTopicDto(saved);
  }

  async updateTopic(
    user: User,
    schoolId: string,
    topicId: string,
    title: string,
  ): Promise<CourseMaterialTopicDto> {
    const topic = await this.topicRepo.findOne({
      where: { id: topicId, school_id: schoolId },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    await this.assertCanManage(user, topic.course_id, schoolId);
    const trimmed = (title || '').trim().slice(0, 255);
    if (!trimmed) throw new BadRequestException('title is required');
    topic.title = trimmed;
    const saved = await this.topicRepo.save(topic);
    return this.toTopicDto(saved);
  }

  async removeTopic(user: User, schoolId: string, topicId: string): Promise<void> {
    const topic = await this.topicRepo.findOne({
      where: { id: topicId, school_id: schoolId },
    });
    if (!topic) throw new NotFoundException('Topic not found');
    await this.assertCanManage(user, topic.course_id, schoolId);
    await this.topicRepo.remove(topic);
  }

  /** Courses the current user can browse for materials (any kind). */
  async listAccessibleCourses(
    user: User,
    schoolId?: string | null,
  ): Promise<
    {
      id: string;
      name: string;
      course_kind: string;
      materials_count: number;
    }[]
  > {
    const family = isParentOrStudentActor(user);
    if (!family) {
      if (!schoolId) throw new BadRequestException('school_id is required');
      this.assertSchool(user, schoolId);
    }

    let courseIds: string[] | null = null;

    if (user.role === 'admin') {
      courseIds = null; // all
    } else if (user.role === 'teacher') {
      const schedules = await this.scheduleRepo.find({
        where: { teacher_id: user.id },
        select: ['course_id'],
      });
      courseIds = [
        ...new Set(
          schedules.map((s) => s.course_id).filter(Boolean) as string[],
        ),
      ];
    } else if (user.role === 'parent' || user.user_type === 'parent') {
      const kids = await this.parentLinkedStudentIds(user.id);
      if (!kids.length) return [];
      const enrolled = await this.enrollmentRepo.find({
        where: schoolId
          ? { student_id: In(kids), status: 'active', school_id: schoolId }
          : { student_id: In(kids), status: 'active' },
        select: ['course_id'],
      });
      const fromEnroll = enrolled.map((e) => e.course_id);
      const fromTimetable = await this.timetableCourseIdsForStudents(kids);
      courseIds = [...new Set([...fromEnroll, ...fromTimetable])];
    } else if (user.role === 'student' || user.user_type === 'student') {
      const viaUserQb = this.studentRepo
        .createQueryBuilder('s')
        .where('(s.user_id = :uid OR s.email = :email)', {
          uid: user.id,
          email: user.email,
        });
      if (schoolId) {
        viaUserQb.andWhere('s.school_id = :sid', { sid: schoolId });
      }
      const viaUser = await viaUserQb.getOne();
      if (!viaUser) return [];
      const enrolled = await this.enrollmentRepo.find({
        where: schoolId
          ? { student_id: viaUser.id, status: 'active', school_id: schoolId }
          : { student_id: viaUser.id, status: 'active' },
        select: ['course_id'],
      });
      const fromTimetable = await this.timetableCourseIdsForStudents([viaUser.id]);
      courseIds = [...new Set([...enrolled.map((e) => e.course_id), ...fromTimetable])];
    } else {
      return [];
    }

    if (courseIds && courseIds.length === 0) return [];

    const qb = this.courseRepo
      .createQueryBuilder('c')
      .orderBy('c.name', 'ASC');
    if (!family) {
      qb.andWhere('c.is_active = true');
    }
    if (schoolId) {
      qb.andWhere('c.school_id = :sid', { sid: schoolId });
    }

    if (courseIds) {
      qb.andWhere('c.id IN (:...ids)', { ids: courseIds });
    }

    const courses = await qb.getMany();
    const countQb = this.materialRepo
      .createQueryBuilder('m')
      .select('m.course_id', 'course_id')
      .addSelect('COUNT(*)', 'cnt')
      .andWhere(
        user.role === 'admin' || user.role === 'teacher'
          ? '1=1'
          : 'm.is_visible = true',
      )
      .groupBy('m.course_id');
    if (schoolId) {
      countQb.andWhere('m.school_id = :sid', { sid: schoolId });
    } else if (courseIds) {
      countQb.andWhere('m.course_id IN (:...ids)', { ids: courseIds });
    }
    const counts = await countQb.getRawMany<{ course_id: string; cnt: string }>();

    const countMap = new Map(
      counts.map((r) => [r.course_id, Number(r.cnt) || 0]),
    );

    return courses.map((c) => ({
      id: c.id,
      name: c.name || c.title || c.id,
      course_kind: c.course_kind || 'milestone',
      materials_count: countMap.get(c.id) || 0,
    }));
  }

  async createFromUpload(
    user: User,
    schoolId: string,
    courseId: string,
    file: Express.Multer.File,
    title: string,
    description?: string | null,
    phaseId?: string | null,
    topicId?: string | null,
  ): Promise<CourseMaterialDto> {
    await this.assertCanManage(user, courseId, schoolId);
    const ext = this.validateUploadFile(file);
    const section = await this.resolveSection(courseId, schoolId, phaseId, topicId);

    const material = this.materialRepo.create({
      school_id: schoolId,
      course_id: courseId,
      phase_id: section.phase_id,
      topic_id: section.topic_id,
      title: (title || file.originalname || 'Material').trim().slice(0, 255),
      description: description?.trim() || null,
      original_filename: file.originalname,
      stored_filename: file.filename,
      mime_type: file.mimetype || 'application/octet-stream',
      file_size: file.size,
      file_ext: ext,
      uploaded_by_user_id: user.id,
      is_visible: true,
    });
    const saved = await this.materialRepo.save(material);
    const full = await this.materialRepo.findOne({
      where: { id: saved.id },
      relations: ['course'],
    });
    if (full && full.course?.send_notifications !== false) {
      void this.notifyMaterialUploaded(full);
    }
    return this.toDto(full!);
  }

  private async notifyMaterialUploaded(material: CourseMaterial): Promise<void> {
    const { schoolId, courseName, recipients } = await this.audience.parentsOfCourse(material.course_id);
    if (!recipients.length) return;
    await this.notifications.notifySafe({
      schoolId: schoolId ?? material.school_id,
      templateKey: NOTIFICATION_TEMPLATE_KEYS.COURSE_MATERIAL_UPLOADED,
      locale: 'ar',
      variables: {
        title: material.title,
        courseName: courseName || material.course?.name || material.course?.title || '',
        recipientName: recipients[0]?.name || 'ولي الأمر',
      },
      recipients,
    });
  }

  async updateMeta(
    user: User,
    schoolId: string,
    id: string,
    patch: { title?: string; description?: string | null; is_visible?: boolean },
  ): Promise<CourseMaterialDto> {
    const material = await this.materialRepo.findOne({
      where: { id, school_id: schoolId },
      relations: ['course'],
    });
    if (!material) throw new NotFoundException('Material not found');
    await this.assertCanManage(user, material.course_id, schoolId);

    if (patch.title != null) material.title = patch.title.trim().slice(0, 255);
    if (patch.description !== undefined) {
      material.description = patch.description?.trim() || null;
    }
    if (patch.is_visible !== undefined) material.is_visible = patch.is_visible;

    await this.materialRepo.save(material);
    return this.toDto(material);
  }

  async remove(user: User, schoolId: string, id: string): Promise<void> {
    const material = await this.materialRepo.findOne({
      where: { id, school_id: schoolId },
    });
    if (!material) throw new NotFoundException('Material not found');
    await this.assertCanManage(user, material.course_id, schoolId);

    const path = this.absolutePath(material.stored_filename);
    await this.materialRepo.remove(material);
    if (existsSync(path)) {
      try {
        unlinkSync(path);
      } catch {
        /* ignore disk errors */
      }
    }
  }

  async getForDownload(
    user: User,
    schoolId: string | null | undefined,
    id: string,
  ): Promise<{ material: CourseMaterial; stream: NodeJS.ReadableStream }> {
    const material = schoolId
      ? await this.materialRepo.findOne({
          where: { id, school_id: schoolId },
          relations: ['course'],
        })
      : await this.materialRepo.findOne({
          where: { id },
          relations: ['course'],
        });
    if (!material) throw new NotFoundException('Material not found');

    const canManage =
      user.role === 'admin' ||
      (user.role === 'teacher' &&
        (await this.teacherTeachesCourse(user.id, material.course_id)));
    if (!canManage && !material.is_visible) {
      throw new NotFoundException('Material not found');
    }

    await this.assertCanDownload(user, material);

    const path = this.absolutePath(material.stored_filename);
    if (!existsSync(path)) {
      throw new NotFoundException('File missing on server');
    }
    return { material, stream: createReadStream(path) };
  }
}
