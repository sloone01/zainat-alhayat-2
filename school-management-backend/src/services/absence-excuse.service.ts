import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createReadStream, existsSync } from 'fs';
import { basename, join } from 'path';
import { Repository } from 'typeorm';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';
import { AbsenceExcuse } from '../entities/absence-excuse.entity';
import { Student } from '../entities/student.entity';
import { User } from '../entities/user.entity';
import { uploadsRoot } from '../common/security/runtime-secrets';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type AbsenceExcuseFile = {
  stream: ReturnType<typeof createReadStream>;
  filename: string;
  mime: string;
};

@Injectable()
export class AbsenceExcuseService {
  constructor(
    @InjectRepository(AbsenceExcuse)
    private readonly excuseRepo: Repository<AbsenceExcuse>,
    @InjectRepository(Student)
    private readonly studentRepo: Repository<Student>,
  ) {}

  requireSchool(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  async listForSchool(user: User, status?: string, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    const qb = this.excuseRepo
      .createQueryBuilder('excuse')
      .leftJoinAndSelect('excuse.student', 'student')
      .leftJoinAndSelect('excuse.submitted_by', 'submitted_by')
      .where('excuse.school_id = :schoolId', { schoolId })
      .orderBy('excuse.created_at', 'DESC');
    const normalized = String(status || 'pending').toLowerCase();
    if (normalized && normalized !== 'all') {
      if (!['pending', 'approved', 'rejected'].includes(normalized)) {
        throw new BadRequestException('Invalid status');
      }
      qb.andWhere('excuse.status = :status', { status: normalized });
    }
    const rows = await qb.take(200).getMany();
    return rows.map((row) => this.toDto(row));
  }

  async listForParent(userId: string) {
    const children = await this.linkedChildren(userId);
    const ids = children.map((child) => child.id);
    const rows = ids.length
      ? await this.excuseRepo
          .createQueryBuilder('excuse')
          .leftJoinAndSelect('excuse.student', 'student')
          .where('excuse.student_id IN (:...ids)', { ids })
          .andWhere('excuse.submitted_by_user_id = :userId', { userId })
          .orderBy('excuse.created_at', 'DESC')
          .take(200)
          .getMany()
      : [];
    return {
      children: children.map((child) => this.childDto(child)),
      items: rows.map((row) => this.toDto(row)),
    };
  }

  async createForParent(
    user: User,
    input: { student_id: string; absence_date: string; explanation: string },
    file?: { filename: string; originalname: string; mimetype: string },
  ) {
    const student = await this.assertLinkedStudent(user.id, input.student_id);
    const date = this.parseDate(input.absence_date);
    const explanation = String(input.explanation || '').trim();
    if (!explanation) throw new BadRequestException('explanation is required');
    if (!file?.filename) throw new BadRequestException('file is required');

    const row = this.excuseRepo.create({
      school_id: student.school_id,
      student_id: student.id,
      submitted_by_user_id: user.id,
      absence_date: date,
      explanation,
      original_filename: this.safeOriginalName(file.originalname),
      stored_filename: basename(file.filename),
      mime_type: file.mimetype || 'application/octet-stream',
      status: 'pending',
    });
    const saved = await this.excuseRepo.save(row);
    const loaded = await this.excuseRepo.findOne({
      where: { id: saved.id },
      relations: ['student'],
    });
    return this.toDto(loaded || saved);
  }

  async approve(user: User, id: string, requestedSchoolId?: string | null) {
    const row = await this.loadForStaff(user, id, requestedSchoolId);
    if (row.status !== 'pending') throw new BadRequestException('Excuse is already reviewed');
    row.status = 'approved';
    row.reviewed_by_user_id = user.id;
    row.reviewed_at = new Date();
    row.rejection_reason = null;
    await this.excuseRepo.save(row);
    return this.toDto(await this.reload(row.id));
  }

  async reject(user: User, id: string, reason: string, requestedSchoolId?: string | null) {
    const details = String(reason || '').trim();
    if (!details) throw new BadRequestException('rejection_reason is required');
    const row = await this.loadForStaff(user, id, requestedSchoolId);
    if (row.status !== 'pending') throw new BadRequestException('Excuse is already reviewed');
    row.status = 'rejected';
    row.reviewed_by_user_id = user.id;
    row.reviewed_at = new Date();
    row.rejection_reason = details;
    await this.excuseRepo.save(row);
    return this.toDto(await this.reload(row.id));
  }

  async openFileForStaff(user: User, id: string, requestedSchoolId?: string | null): Promise<AbsenceExcuseFile> {
    const row = await this.loadForStaff(user, id, requestedSchoolId);
    return this.openStoredFile(row);
  }

  async openFileForParent(userId: string, id: string): Promise<AbsenceExcuseFile> {
    const row = await this.excuseRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Excuse not found');
    await this.assertLinkedStudent(userId, row.student_id);
    if (row.submitted_by_user_id !== userId) {
      throw new NotFoundException('Excuse not found');
    }
    return this.openStoredFile(row);
  }

  private openStoredFile(row: AbsenceExcuse): AbsenceExcuseFile {
    const stored = basename(String(row.stored_filename || ''));
    if (!stored) throw new NotFoundException('File not found');
    const path = join(uploadsRoot(), 'absence-excuses', stored);
    if (!existsSync(path)) throw new NotFoundException('File not found');
    return {
      stream: createReadStream(path),
      filename: row.original_filename || stored,
      mime: row.mime_type || 'application/octet-stream',
    };
  }

  private async loadForStaff(user: User, id: string, requestedSchoolId?: string | null) {
    const schoolId = this.requireSchool(user, requestedSchoolId);
    const row = await this.excuseRepo.findOne({
      where: { id },
      relations: ['student', 'submitted_by'],
    });
    if (!row) throw new NotFoundException('Excuse not found');
    assertSameSchool(user, row.school_id);
    if (String(row.school_id) !== String(schoolId)) {
      throw new BadRequestException('Excuse is not in this school');
    }
    return row;
  }

  private async reload(id: string) {
    const row = await this.excuseRepo.findOne({
      where: { id },
      relations: ['student', 'submitted_by'],
    });
    if (!row) throw new NotFoundException('Excuse not found');
    return row;
  }

  private async linkedChildren(userId: string): Promise<Student[]> {
    return this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student_parents', 'sp', 'sp.student_id = student.id')
      .innerJoin('parents', 'p', 'p.id = sp.parent_id')
      .where('p.user_id = :userId', { userId })
      .orderBy('student.firstName', 'ASC')
      .getMany();
  }

  private async assertLinkedStudent(userId: string, studentId: string): Promise<Student> {
    const student = await this.studentRepo
      .createQueryBuilder('student')
      .innerJoin('student_parents', 'sp', 'sp.student_id = student.id')
      .innerJoin('parents', 'p', 'p.id = sp.parent_id')
      .where('p.user_id = :userId', { userId })
      .andWhere('student.id = :studentId', { studentId })
      .getOne();
    if (!student) throw new NotFoundException('Student not found');
    if (!student.school_id) throw new BadRequestException('Student has no school');
    return student;
  }

  private parseDate(raw: string): string {
    const value = String(raw || '').trim().slice(0, 10);
    if (!DATE_RE.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00`))) {
      throw new BadRequestException('absence_date is required');
    }
    const today = new Date();
    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (value > iso) throw new BadRequestException('absence_date cannot be in the future');
    return value;
  }

  private safeOriginalName(name: string): string {
    const cleaned = basename(String(name || 'excuse')).replace(/[^\w.\- ()\u0600-\u06FF]+/g, '_');
    return cleaned.slice(0, 200) || 'excuse';
  }

  private childDto(student: Student) {
    return {
      id: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      first_name_ar: student.first_name_ar,
      last_name_ar: student.last_name_ar,
      first_name_en: student.first_name_en,
      last_name_en: student.last_name_en,
    };
  }

  private personName(user?: User | null) {
    if (!user) return null;
    const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
    return name || user.email || null;
  }

  private toDto(row: AbsenceExcuse) {
    return {
      id: row.id,
      school_id: row.school_id,
      student_id: row.student_id,
      absence_date: String(row.absence_date).slice(0, 10),
      explanation: row.explanation,
      original_filename: row.original_filename,
      has_file: Boolean(row.stored_filename),
      status: row.status,
      rejection_reason: row.rejection_reason,
      reviewed_at: row.reviewed_at,
      created_at: row.created_at,
      student: row.student
        ? {
            id: row.student.id,
            firstName: row.student.firstName,
            lastName: row.student.lastName,
            first_name_ar: row.student.first_name_ar,
            last_name_ar: row.student.last_name_ar,
            first_name_en: row.student.first_name_en,
            last_name_en: row.student.last_name_en,
          }
        : null,
      submitted_by_name: this.personName(row.submitted_by),
    };
  }
}
