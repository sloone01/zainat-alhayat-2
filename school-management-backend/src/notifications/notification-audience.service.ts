import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { StudentCourseEnrollment } from '../entities/student-course-enrollment.entity';
import { Schedule } from '../entities/schedule.entity';
import { Course } from '../entities/course.entity';
import type { NotifyRecipient } from './notification.types';

@Injectable()
export class NotificationAudienceService {
  constructor(
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(StudentCourseEnrollment)
    private readonly enrollmentRepo: Repository<StudentCourseEnrollment>,
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  recipientsFromUsers(users: Array<Partial<User> | null | undefined>): NotifyRecipient[] {
    return (users ?? [])
      .filter((u): u is User => !!u && !!(u.email || u.phone || u.id))
      .map((u) => ({
        email: u.email,
        phone: u.phone,
        userId: u.id,
        name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim(),
      }));
  }

  async usersByIds(userIds: string[]): Promise<NotifyRecipient[]> {
    const ids = [...new Set(userIds.filter(Boolean))];
    if (!ids.length) return [];
    const users = await this.userRepo.find({ where: { id: In(ids) } });
    return this.recipientsFromUsers(users);
  }

  async parentsOfStudent(studentId: string): Promise<{
    schoolId: number | null;
    studentName: string;
    recipients: NotifyRecipient[];
  }> {
    const student = await this.studentRepo.findOne({
      where: { id: studentId },
      relations: ['parents', 'parents.user'],
    });
    if (!student) {
      return { schoolId: null, studentName: '', recipients: [] };
    }
    return {
      schoolId: student.school_id ?? null,
      studentName: `${student.firstName} ${student.lastName}`.trim(),
      recipients: this.recipientsFromParents(student.parents ?? []),
    };
  }

  async parentsOfGroup(groupId: string): Promise<{
    schoolId: number | null;
    recipients: NotifyRecipient[];
  }> {
    const students = await this.studentRepo
      .createQueryBuilder('s')
      .innerJoin('s.groups', 'g', 'g.id = :groupId', { groupId })
      .leftJoinAndSelect('s.parents', 'p')
      .leftJoinAndSelect('p.user', 'u')
      .getMany();
    const recipients: NotifyRecipient[] = [];
    const seen = new Set<string>();
    let schoolId: number | null = students[0]?.school_id ?? null;
    for (const student of students) {
      schoolId = schoolId ?? student.school_id ?? null;
      for (const r of this.recipientsFromParents(student.parents ?? [])) {
        const key = `${r.userId ?? ''}|${r.email ?? ''}|${r.phone ?? ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        recipients.push(r);
      }
    }
    return { schoolId, recipients };
  }

  async parentsOfCourse(courseId: string): Promise<{
    schoolId: number | null;
    courseName: string;
    recipients: NotifyRecipient[];
  }> {
    const course = await this.courseRepo.findOne({ where: { id: courseId } });
    const courseName = course?.name || course?.title || '';
    const enrollments = await this.enrollmentRepo.find({
      where: { course_id: courseId, status: 'active' },
      relations: ['student', 'student.parents', 'student.parents.user'],
    });
    const recipients: NotifyRecipient[] = [];
    const seen = new Set<string>();
    let schoolId: number | null = enrollments[0]?.school_id ?? course?.school_id ?? null;
    const addParents = (parents: Array<{
      email?: string | null;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      user?: User | null;
    }>) => {
      for (const r of this.recipientsFromParents(parents)) {
        const key = `${r.userId ?? ''}|${r.email ?? ''}|${r.phone ?? ''}`;
        if (seen.has(key)) continue;
        seen.add(key);
        recipients.push(r);
      }
    };
    for (const row of enrollments) {
      schoolId = schoolId ?? row.school_id ?? row.student?.school_id ?? null;
      addParents(row.student?.parents ?? []);
    }
    if (!recipients.length) {
      const schedules = await this.scheduleRepo.find({
        where: { course_id: courseId },
        relations: ['group', 'group.students', 'group.students.parents', 'group.students.parents.user'],
      });
      for (const sch of schedules) {
        for (const student of sch.group?.students ?? []) {
          schoolId = schoolId ?? student.school_id ?? null;
          addParents(student.parents ?? []);
        }
      }
    }
    return { schoolId, courseName, recipients };
  }

  async schoolAdmins(schoolId: number): Promise<NotifyRecipient[]> {
    const users = await this.userRepo.find({
      where: { school_id: schoolId, role: 'admin' },
    });
    return this.recipientsFromUsers(users);
  }

  async platformOperators(): Promise<NotifyRecipient[]> {
    const users = await this.userRepo.find({
      where: [{ isSuperAdmin: true }, { isSystemUser: true }],
    });
    return this.recipientsFromUsers(users);
  }

  private recipientsFromParents(
    parents: Array<{
      email?: string | null;
      phone?: string | null;
      firstName?: string | null;
      lastName?: string | null;
      user?: User | null;
    }>,
  ): NotifyRecipient[] {
    const out: NotifyRecipient[] = [];
    for (const p of parents) {
      out.push({
        email: p.email,
        phone: p.phone,
        userId: p.user?.id,
        name: `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim(),
      });
      if (p.user) {
        out.push({
          email: p.user.email,
          phone: p.user.phone,
          userId: p.user.id,
          name: `${p.user.firstName ?? ''} ${p.user.lastName ?? ''}`.trim(),
        });
      }
    }
    return out;
  }
}
