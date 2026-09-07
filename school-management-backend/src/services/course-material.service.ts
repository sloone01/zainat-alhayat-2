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
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { Schedule } from '../entities/schedule.entity';
import { Parent } from '../entities/parent.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
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

@Injectable()
export class CourseMaterialService implements OnModuleInit {
  private readonly uploadDir = join(process.cwd(), 'uploads', 'course-materials');

  constructor(
    @InjectRepository(CourseMaterial)
    private readonly materialRepo: Repository<CourseMaterial>,
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

  private assertSchool(user: User, schoolId: number) {
    if (user.school_id != null && Number(user.school_id) !== Number(schoolId)) {
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

    const viaSchedule = await this.studentRepo.manager
      .createQueryBuilder()
      .from('student_groups', 'sg')
      .innerJoin('schedules', 'sch', 'sch.group_id = sg.group_id')
      .where('sg.student_id = :sid', { sid: studentId })
      .andWhere('sch.course_id = :cid', { cid: courseId })
      .getCount();
    return viaSchedule > 0;
  }

  async assertCanManage(
    user: User,
    courseId: string,
    schoolId: number,
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
    if (user.role === 'parent') {
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

  async listForCourse(
    user: User,
    schoolId: number,
    courseId: string,
  ): Promise<CourseMaterialDto[]> {
    this.assertSchool(user, schoolId);
    const course = await this.courseRepo.findOne({
      where: { id: courseId, school_id: schoolId },
    });
    if (!course) throw new NotFoundException('Course not found');

    // Access check: manage OR download rights for at least visibility
    const canManage =
      user.role === 'admin' ||
      (user.role === 'teacher' &&
        (await this.teacherTeachesCourse(user.id, courseId)));

    if (!canManage) {
      // parent/student must have access to course
      if (user.role === 'parent') {
        const kids = await this.parentLinkedStudentIds(user.id);
        let ok = false;
        for (const sid of kids) {
          if (await this.studentCanAccessCourse(sid, courseId)) {
            ok = true;
            break;
          }
        }
        if (!ok) throw new ForbiddenException('Access denied');
      } else if (user.role === 'student') {
        const viaUser = await this.studentRepo
          .createQueryBuilder('s')
          .where('s.school_id = :sid', { sid: schoolId })
          .andWhere('(s.user_id = :uid OR s.email = :email)', {
            uid: user.id,
            email: user.email,
          })
          .getOne();
        if (
          !viaUser ||
          !(await this.studentCanAccessCourse(viaUser.id, courseId))
        ) {
          throw new ForbiddenException('Access denied');
        }
      } else {
        throw new ForbiddenException('Access denied');
      }
    }

    const qb = this.materialRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.course', 'course')
      .where('m.course_id = :cid', { cid: courseId })
      .andWhere('m.school_id = :sid', { sid: schoolId })
      .orderBy('m.created_at', 'DESC');

    if (!canManage) {
      qb.andWhere('m.is_visible = true');
    }

    const rows = await qb.getMany();
    return rows.map((r) => this.toDto(r));
  }

  /** Courses the current user can browse for materials (any kind). */
  async listAccessibleCourses(
    user: User,
    schoolId: number,
  ): Promise<
    {
      id: string;
      name: string;
      course_kind: string;
      materials_count: number;
    }[]
  > {
    this.assertSchool(user, schoolId);

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
    } else if (user.role === 'parent') {
      const kids = await this.parentLinkedStudentIds(user.id);
      if (!kids.length) return [];
      const enrolled = await this.enrollmentRepo.find({
        where: {
          student_id: In(kids),
          status: 'active',
          school_id: schoolId,
        },
        select: ['course_id'],
      });
      const fromEnroll = enrolled.map((e) => e.course_id);
      const fromSchedule = await this.studentRepo.manager
        .createQueryBuilder()
        .select('DISTINCT sch.course_id', 'course_id')
        .from('student_groups', 'sg')
        .innerJoin('schedules', 'sch', 'sch.group_id = sg.group_id')
        .where('sg.student_id IN (:...kids)', { kids })
        .andWhere('sch.course_id IS NOT NULL')
        .getRawMany<{ course_id: string }>();
      courseIds = [
        ...new Set([
          ...fromEnroll,
          ...fromSchedule.map((r) => r.course_id),
        ]),
      ];
    } else if (user.role === 'student') {
      const viaUser = await this.studentRepo
        .createQueryBuilder('s')
        .where('s.school_id = :sid', { sid: schoolId })
        .andWhere('(s.user_id = :uid OR s.email = :email)', {
          uid: user.id,
          email: user.email,
        })
        .getOne();
      if (!viaUser) return [];
      const enrolled = await this.enrollmentRepo.find({
        where: {
          student_id: viaUser.id,
          status: 'active',
          school_id: schoolId,
        },
        select: ['course_id'],
      });
      const fromSchedule = await this.studentRepo.manager
        .createQueryBuilder()
        .select('DISTINCT sch.course_id', 'course_id')
        .from('student_groups', 'sg')
        .innerJoin('schedules', 'sch', 'sch.group_id = sg.group_id')
        .where('sg.student_id = :sid', { sid: viaUser.id })
        .andWhere('sch.course_id IS NOT NULL')
        .getRawMany<{ course_id: string }>();
      courseIds = [
        ...new Set([
          ...enrolled.map((e) => e.course_id),
          ...fromSchedule.map((r) => r.course_id),
        ]),
      ];
    } else {
      return [];
    }

    if (courseIds && courseIds.length === 0) return [];

    const qb = this.courseRepo
      .createQueryBuilder('c')
      .where('c.school_id = :sid', { sid: schoolId })
      .andWhere('c.is_active = true')
      .orderBy('c.name', 'ASC');

    if (courseIds) {
      qb.andWhere('c.id IN (:...ids)', { ids: courseIds });
    }

    const courses = await qb.getMany();
    const counts = await this.materialRepo
      .createQueryBuilder('m')
      .select('m.course_id', 'course_id')
      .addSelect('COUNT(*)', 'cnt')
      .where('m.school_id = :sid', { sid: schoolId })
      .andWhere(
        user.role === 'admin' || user.role === 'teacher'
          ? '1=1'
          : 'm.is_visible = true',
      )
      .groupBy('m.course_id')
      .getRawMany<{ course_id: string; cnt: string }>();

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
    schoolId: number,
    courseId: string,
    file: Express.Multer.File,
    title: string,
    description?: string | null,
  ): Promise<CourseMaterialDto> {
    await this.assertCanManage(user, courseId, schoolId);
    const ext = this.validateUploadFile(file);

    const material = this.materialRepo.create({
      school_id: schoolId,
      course_id: courseId,
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
    schoolId: number,
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

  async remove(user: User, schoolId: number, id: string): Promise<void> {
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
    schoolId: number,
    id: string,
  ): Promise<{ material: CourseMaterial; stream: NodeJS.ReadableStream }> {
    const material = await this.materialRepo.findOne({
      where: { id, school_id: schoolId },
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
