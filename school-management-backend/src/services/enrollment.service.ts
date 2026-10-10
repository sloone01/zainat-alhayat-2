import { Injectable, Logger, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from '../entities/enrollment.entity';
import { School } from '../entities/school.entity';
import { InstallmentPlan } from '../entities/installment-plan.entity';
import { CreateEnrollmentDto, UpdateEnrollmentDto, SavePublicEnrollmentDraftDto, StudentDetailsDto, FatherInfoDto, MotherInfoDto } from '../dto/enrollment.dto';
import { StudentService, CreateStudentDto } from './student.service';
import { ParentService, CreateParentDto } from './parent.service';
import { NotificationDispatcherService } from '../notifications/notification-dispatcher.service';
import { NOTIFICATION_TEMPLATE_KEYS } from '../constants/notification-template-keys';
import { assertSameSchool } from '../common/security/school-access';
import { buildPage, clampPage, likeTerm, parsePageQuery, type PageQuery, type PageResult } from '../common/pagination';
import { AttachmentService } from './attachment.service';

export type EnrollmentStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'enrolled';

export interface EnrollmentListQuery extends PageQuery {
  q?: string;
  status?: EnrollmentStatus;
  grade?: string;
}
import { User } from '../entities/user.entity';
import { applyBilingualName, normalizeCivilId } from '../common/identity/bilingual-name';
import { EnrollmentFeePreviewService } from './enrollment-fee-preview.service';
import { StudentChargeSheetService } from './student-charge-sheet.service';

@Injectable()
export class EnrollmentService {
  private readonly logger = new Logger(EnrollmentService.name);

  constructor(
    @InjectRepository(Enrollment)
    private enrollmentRepository: Repository<Enrollment>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
    @InjectRepository(InstallmentPlan)
    private installmentPlanRepository: Repository<InstallmentPlan>,
    private studentService: StudentService,
    private parentService: ParentService,
    private notifications: NotificationDispatcherService,
    private enrollmentFeePreview: EnrollmentFeePreviewService,
    private chargeSheets: StudentChargeSheetService,
    private attachments: AttachmentService,
  ) {}

  private parseAttachmentId(url: string | null | undefined): string | null {
    const m = String(url || '').match(
      /^\/api\/attachments\/([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\/download$/i,
    );
    return m?.[1] ?? null;
  }

  /** Bind uploaded files to the enrollment row (binaries already in AttachmentStorage). */
  private async linkEnrollmentDocuments(enrollment: Enrollment, schoolId: string): Promise<void> {
    const items: { url?: string | null; purpose: string }[] = [
      ...(enrollment.parentIdDocuments || []).map((url) => ({
        url,
        purpose: 'enrollment_parent_id',
      })),
      { url: enrollment.birthCertificate, purpose: 'enrollment_birth_certificate' },
      { url: enrollment.childIdDocument, purpose: 'enrollment_child_id' },
      { url: enrollment.photo, purpose: 'enrollment_photo' },
    ];
    for (const { url, purpose } of items) {
      const id = this.parseAttachmentId(url);
      if (!id) continue;
      const att = await this.attachments.findOne(id);
      if (att.school_id && String(att.school_id) !== String(schoolId)) {
        throw new BadRequestException('Attachment does not belong to this school');
      }
      await this.attachments.addLink(id, 'enrollment', enrollment.id, purpose);
    }
  }

  private composeStudentFullName(student: {
    fullName?: string;
    first_name_ar?: string;
    secondName?: string;
    thirdName?: string;
    last_name_ar?: string;
    first_name_en?: string;
    secondNameEn?: string;
    thirdNameEn?: string;
    last_name_en?: string;
  }): string {
    return (
      (student.fullName || '').trim() ||
      [student.first_name_ar, student.secondName, student.thirdName, student.last_name_ar]
        .map((p) => (p || '').trim())
        .filter(Boolean)
        .join(' ') ||
      [student.first_name_en, student.secondNameEn, student.thirdNameEn, student.last_name_en]
        .map((p) => (p || '').trim())
        .filter(Boolean)
        .join(' ') ||
      '—'
    );
  }

  private blankName(value?: string | null): string | null {
    const next = (value ?? '').trim();
    return next ? next : null;
  }

  private composeParentFullName(info: {
    fullName?: string;
    first_name_ar?: string | null;
    last_name_ar?: string | null;
    first_name_en?: string | null;
    last_name_en?: string | null;
  }): string {
    return (
      (info.fullName || '').trim() ||
      [info.first_name_ar, info.last_name_ar].map((p) => (p || '').trim()).filter(Boolean).join(' ') ||
      [info.first_name_en, info.last_name_en].map((p) => (p || '').trim()).filter(Boolean).join(' ') ||
      ''
    );
  }

  private applyStudentIdentity(enrollment: Enrollment, student: Partial<StudentDetailsDto>): void {
    if (student.first_name_ar !== undefined) enrollment.first_name_ar = this.blankName(student.first_name_ar);
    if (student.first_name_en !== undefined) enrollment.first_name_en = this.blankName(student.first_name_en);
    if (student.last_name_ar !== undefined) enrollment.last_name_ar = this.blankName(student.last_name_ar);
    if (student.last_name_en !== undefined) enrollment.last_name_en = this.blankName(student.last_name_en);
    if (student.secondName !== undefined) enrollment.secondName = this.blankName(student.secondName);
    if (student.thirdName !== undefined) enrollment.thirdName = this.blankName(student.thirdName);
    if (student.secondNameEn !== undefined) enrollment.secondNameEn = this.blankName(student.secondNameEn);
    if (student.thirdNameEn !== undefined) enrollment.thirdNameEn = this.blankName(student.thirdNameEn);

    const composed = this.composeStudentFullName({
      fullName: typeof student.fullName === 'string' ? student.fullName : undefined,
      first_name_ar: enrollment.first_name_ar ?? undefined,
      secondName: enrollment.secondName ?? undefined,
      thirdName: enrollment.thirdName ?? undefined,
      last_name_ar: enrollment.last_name_ar ?? undefined,
      first_name_en: enrollment.first_name_en ?? undefined,
      secondNameEn: enrollment.secondNameEn ?? undefined,
      thirdNameEn: enrollment.thirdNameEn ?? undefined,
      last_name_en: enrollment.last_name_en ?? undefined,
    });
    if (composed && composed !== '—') enrollment.fullName = composed;
    else if (typeof student.fullName === 'string' && student.fullName.trim()) {
      enrollment.fullName = student.fullName.trim();
    }

    if (student.tribe !== undefined) enrollment.tribe = student.tribe;
    if (student.idNumber !== undefined) enrollment.idNumber = student.idNumber;
    if (student.gender !== undefined) enrollment.gender = student.gender;
    if (student.nationality !== undefined) enrollment.nationality = student.nationality;
    if (student.religion !== undefined) enrollment.religion = student.religion;
    if (student.dateOfBirth !== undefined) {
      enrollment.dateOfBirth = student.dateOfBirth ? new Date(student.dateOfBirth) : undefined;
    }
    if (student.age !== undefined) enrollment.age = student.age;
    if (student.hasSiblings !== undefined) enrollment.hasSiblings = student.hasSiblings || false;
    if (student.photo !== undefined) enrollment.photo = student.photo;
  }

  private applyFatherIdentity(enrollment: Enrollment, info: Partial<FatherInfoDto>): void {
    if (info.first_name_ar !== undefined) enrollment.father_first_name_ar = this.blankName(info.first_name_ar);
    if (info.first_name_en !== undefined) enrollment.father_first_name_en = this.blankName(info.first_name_en);
    if (info.last_name_ar !== undefined) enrollment.father_last_name_ar = this.blankName(info.last_name_ar);
    if (info.last_name_en !== undefined) enrollment.father_last_name_en = this.blankName(info.last_name_en);
    if (info.civil_id !== undefined) enrollment.father_civil_id = this.blankName(info.civil_id);
    enrollment.fatherFullName =
      this.composeParentFullName({
        fullName: info.fullName,
        first_name_ar: enrollment.father_first_name_ar,
        last_name_ar: enrollment.father_last_name_ar,
        first_name_en: enrollment.father_first_name_en,
        last_name_en: enrollment.father_last_name_en,
      }) || enrollment.fatherFullName;
    if (info.tribe !== undefined) enrollment.fatherTribe = info.tribe;
    if (info.workplace !== undefined) enrollment.fatherWorkplace = info.workplace;
    if (info.workPhone !== undefined) enrollment.fatherWorkPhone = info.workPhone;
    if (info.mobile !== undefined) enrollment.fatherMobile = info.mobile;
    if (info.email !== undefined) enrollment.fatherEmail = info.email;
    if (info.maritalStatus !== undefined) enrollment.fatherMaritalStatus = info.maritalStatus;
  }

  private applyMotherIdentity(enrollment: Enrollment, info: Partial<MotherInfoDto>): void {
    if (info.first_name_ar !== undefined) enrollment.mother_first_name_ar = this.blankName(info.first_name_ar);
    if (info.first_name_en !== undefined) enrollment.mother_first_name_en = this.blankName(info.first_name_en);
    if (info.last_name_ar !== undefined) enrollment.mother_last_name_ar = this.blankName(info.last_name_ar);
    if (info.last_name_en !== undefined) enrollment.mother_last_name_en = this.blankName(info.last_name_en);
    if (info.civil_id !== undefined) enrollment.mother_civil_id = this.blankName(info.civil_id);
    enrollment.motherFullName =
      this.composeParentFullName({
        fullName: info.fullName,
        first_name_ar: enrollment.mother_first_name_ar,
        last_name_ar: enrollment.mother_last_name_ar,
        first_name_en: enrollment.mother_first_name_en,
        last_name_en: enrollment.mother_last_name_en,
      }) || enrollment.motherFullName;
    if (info.tribe !== undefined) enrollment.motherTribe = info.tribe;
    if (info.workplace !== undefined) enrollment.motherWorkplace = info.workplace;
    if (info.workPhone !== undefined) enrollment.motherWorkPhone = info.workPhone;
    if (info.mobile !== undefined) enrollment.motherMobile = info.mobile;
    if (info.email !== undefined) enrollment.motherEmail = info.email;
    if (info.maritalStatus !== undefined) enrollment.motherMaritalStatus = info.maritalStatus;
  }

  /**
   * Public wizard: upsert a draft application keyed by school + civil ID.
   * Returns id + payload for the SPA to resume later via civil-ID lookup.
   */
  async savePublicDraft(dto: SavePublicEnrollmentDraftDto): Promise<{
    id: string;
    draft_payload: Record<string, unknown> | null;
  }> {
    const schoolId = String(dto.school_id || '').trim();
    const civil = normalizeCivilId(dto.civil_id);
    if (!schoolId) throw new BadRequestException('school_id is required');
    if (!civil) throw new BadRequestException('civil_id is required');

    const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
    if (!school || school.status === 'rejected' || school.status === 'suspended') {
      throw new BadRequestException('Invalid school');
    }

    const submitted = await this.enrollmentRepository
      .createQueryBuilder('e')
      .where('e.school_id = :schoolId', { schoolId })
      .andWhere('e.idNumber = :civil', { civil })
      .andWhere('e.status IN (:...statuses)', { statuses: ['pending', 'approved', 'enrolled'] })
      .getOne();
    if (submitted) {
      throw new BadRequestException('An enrollment application for this civil ID already exists');
    }

    let row: Enrollment | null = null;
    const draftId = dto.draftEnrollmentId?.trim() || '';
    if (draftId) {
      row = await this.enrollmentRepository.findOne({ where: { id: draftId } });
      if (row) {
        if (String(row.school_id) !== schoolId) {
          throw new BadRequestException('Draft belongs to another school');
        }
        if (row.status !== 'draft') {
          throw new BadRequestException('Only a draft enrollment can be updated this way');
        }
      }
    }
    if (!row) {
      row = await this.enrollmentRepository.findOne({
        where: { school_id: schoolId, idNumber: civil, status: 'draft' },
      });
    }
    if (!row) {
      row = new Enrollment();
      row.school_id = schoolId;
      row.gender = 'male';
      row.fullName = '—';
      row.hasSiblings = false;
      row.enrollmentStatus = 'new';
      row.guardianType = 'father';
      row.housingType = 'house';
      row.allergies = false;
      row.seizures = false;
      row.surgeries = false;
      row.chronicDiseases = false;
    }

    const payload = (dto.payload && typeof dto.payload === 'object' ? dto.payload : {}) as Record<
      string,
      unknown
    >;
    const student = (payload.student && typeof payload.student === 'object'
      ? payload.student
      : {}) as Record<string, unknown>;

    row.status = 'draft';
    row.idNumber = civil;
    row.school_id = schoolId;
    row.draft_payload = payload;
    this.applyStudentIdentity(row, {
      fullName: typeof student.fullName === 'string' ? student.fullName : undefined,
      first_name_ar: typeof student.first_name_ar === 'string' ? student.first_name_ar : undefined,
      first_name_en: typeof student.first_name_en === 'string' ? student.first_name_en : undefined,
      last_name_ar: typeof student.last_name_ar === 'string' ? student.last_name_ar : undefined,
      last_name_en: typeof student.last_name_en === 'string' ? student.last_name_en : undefined,
      secondName: typeof student.secondName === 'string' ? student.secondName : undefined,
      thirdName: typeof student.thirdName === 'string' ? student.thirdName : undefined,
      secondNameEn: typeof student.secondNameEn === 'string' ? student.secondNameEn : undefined,
      thirdNameEn: typeof student.thirdNameEn === 'string' ? student.thirdNameEn : undefined,
      gender: student.gender === 'female' || student.gender === 'male' ? student.gender : undefined,
      nationality: typeof student.nationality === 'string' ? student.nationality : undefined,
      religion: typeof student.religion === 'string' ? student.religion : undefined,
      photo: typeof student.photo === 'string' ? student.photo : undefined,
      dateOfBirth: typeof student.dateOfBirth === 'string' ? student.dateOfBirth : undefined,
      age: typeof student.age === 'number' ? student.age : undefined,
      hasSiblings: typeof student.hasSiblings === 'boolean' ? student.hasSiblings : undefined,
      tribe: typeof student.tribe === 'string' ? student.tribe : undefined,
      idNumber: civil,
    } as Partial<StudentDetailsDto>);

    const guardian = (payload.guardian && typeof payload.guardian === 'object'
      ? payload.guardian
      : {}) as Record<string, unknown>;
    if (guardian.type === 'father' || guardian.type === 'mother' || guardian.type === 'other') {
      row.guardianType = guardian.type;
    }
    if (guardian.fatherInfo && typeof guardian.fatherInfo === 'object') {
      this.applyFatherIdentity(row, guardian.fatherInfo as Partial<FatherInfoDto>);
    }
    if (guardian.motherInfo && typeof guardian.motherInfo === 'object') {
      this.applyMotherIdentity(row, guardian.motherInfo as Partial<MotherInfoDto>);
    }

    const academic = (payload.academic && typeof payload.academic === 'object'
      ? payload.academic
      : {}) as Record<string, unknown>;
    if (academic.enrollmentStatus === 'new' || academic.enrollmentStatus === 'transfer') {
      row.enrollmentStatus = academic.enrollmentStatus;
    }
    if (typeof academic.gradeLevel === 'string') row.gradeLevel = academic.gradeLevel;
    if (typeof academic.previousSchool === 'string') row.previousSchool = academic.previousSchool;

    if (typeof payload.installment_plan_id === 'string' && payload.installment_plan_id.trim()) {
      row.installment_plan_id = payload.installment_plan_id.trim();
    }

    const saved = await this.enrollmentRepository.save(row);
    return { id: saved.id, draft_payload: saved.draft_payload ?? null };
  }

  async findPublicDraftByCivilId(
    civilId: string,
    schoolId: string,
  ): Promise<Enrollment | null> {
    const civil = normalizeCivilId(civilId);
    if (!civil || !schoolId?.trim()) return null;
    return this.enrollmentRepository.findOne({
      where: { school_id: schoolId.trim(), idNumber: civil, status: 'draft' },
    });
  }

  /** Non-draft application already submitted for this civil ID at the school. */
  async findSubmittedApplicationByCivilId(
    civilId: string,
    schoolId: string,
  ): Promise<Enrollment | null> {
    const civil = normalizeCivilId(civilId);
    if (!civil || !schoolId?.trim()) return null;
    return this.enrollmentRepository
      .createQueryBuilder('e')
      .where('e.school_id = :schoolId', { schoolId: schoolId.trim() })
      .andWhere('e.idNumber = :civil', { civil })
      .andWhere('e.status IN (:...statuses)', {
        statuses: ['pending', 'approved', 'enrolled'],
      })
      .getOne();
  }

  async create(createEnrollmentDto: CreateEnrollmentDto): Promise<Enrollment> {
    const schoolId = createEnrollmentDto.school_id != null ? String(createEnrollmentDto.school_id).trim() : '';
    if (!schoolId) {
      throw new BadRequestException('school_id is required');
    }
    const school = await this.schoolRepository.findOne({ where: { id: schoolId } });
    if (!school || school.status === 'rejected' || school.status === 'suspended') {
      throw new BadRequestException('Invalid school');
    }

    const civil = normalizeCivilId(createEnrollmentDto.student?.idNumber);
    const fatherCivil = normalizeCivilId(createEnrollmentDto.guardian?.fatherInfo?.civil_id);
    const motherCivil = normalizeCivilId(createEnrollmentDto.guardian?.motherInfo?.civil_id);
    // A civil ID identifies one person — student and parents must not reuse the same value.
    const partyCivils = [
      { label: 'student', value: civil },
      { label: 'father', value: fatherCivil },
      { label: 'mother', value: motherCivil },
    ].filter((p): p is { label: string; value: string } => !!p.value);
    for (let i = 0; i < partyCivils.length; i++) {
      for (let j = i + 1; j < partyCivils.length; j++) {
        if (partyCivils[i].value === partyCivils[j].value) {
          throw new BadRequestException(
            'Student, father, and mother must each have a different civil ID',
          );
        }
      }
    }

    let enrollment: Enrollment | null = null;
    if (civil) {
      const submitted = await this.findSubmittedApplicationByCivilId(civil, schoolId);
      if (submitted) {
        throw new BadRequestException('An enrollment application for this civil ID already exists');
      }
      enrollment = await this.enrollmentRepository.findOne({
        where: { school_id: schoolId, idNumber: civil, status: 'draft' },
      });
    }
    if (!enrollment) {
      enrollment = new Enrollment();
    }
    enrollment.school_id = schoolId;

    // Map student information
    this.applyStudentIdentity(enrollment, createEnrollmentDto.student);

    // Map academic information
    enrollment.enrollmentStatus = createEnrollmentDto.academic.enrollmentStatus;
    enrollment.gradeLevel = createEnrollmentDto.academic.gradeLevel;
    enrollment.previousSchool = createEnrollmentDto.academic.previousSchool;

    // Map health information
    enrollment.allergies = createEnrollmentDto.health.allergies || false;
    enrollment.allergiesDetails = createEnrollmentDto.health.allergiesDetails;
    enrollment.seizures = createEnrollmentDto.health.seizures || false;
    enrollment.seizuresDetails = createEnrollmentDto.health.seizuresDetails;
    enrollment.surgeries = createEnrollmentDto.health.surgeries || false;
    enrollment.surgeriesDetails = createEnrollmentDto.health.surgeriesDetails;
    enrollment.chronicDiseases = createEnrollmentDto.health.chronicDiseases || false;
    enrollment.chronicDiseasesDetails = createEnrollmentDto.health.chronicDiseasesDetails;
    enrollment.otherHealthInfo = createEnrollmentDto.health.other;
    enrollment.medicalReports = createEnrollmentDto.health.medicalReports;

    // Map guardian information
    enrollment.guardianType = createEnrollmentDto.guardian.type;

    // Map father info
    if (createEnrollmentDto.guardian.fatherInfo) {
      this.applyFatherIdentity(enrollment, createEnrollmentDto.guardian.fatherInfo);
    }

    // Map mother info
    if (createEnrollmentDto.guardian.motherInfo) {
      this.applyMotherIdentity(enrollment, createEnrollmentDto.guardian.motherInfo);
    }

    // Map other guardian info
    if (createEnrollmentDto.guardian.otherInfo) {
      enrollment.organizationName = createEnrollmentDto.guardian.otherInfo.organizationName;
      enrollment.organizationPhone = createEnrollmentDto.guardian.otherInfo.phone;
      enrollment.responsiblePerson = createEnrollmentDto.guardian.otherInfo.responsiblePerson;
      enrollment.responsiblePhone = createEnrollmentDto.guardian.otherInfo.responsiblePhone;
    }

    // Map emergency contact
    if (createEnrollmentDto.guardian.emergencyContact) {
      enrollment.emergencyContactName = createEnrollmentDto.guardian.emergencyContact.fullName;
      enrollment.emergencyContactTribe = createEnrollmentDto.guardian.emergencyContact.tribe;
      enrollment.emergencyContactWorkplace = createEnrollmentDto.guardian.emergencyContact.workplace;
      enrollment.emergencyContactWorkPhone = createEnrollmentDto.guardian.emergencyContact.workPhone;
      enrollment.emergencyContactMobile = createEnrollmentDto.guardian.emergencyContact.mobile;
      enrollment.emergencyContactRelationship = createEnrollmentDto.guardian.emergencyContact.relationship;
    }

    // Map address information
    enrollment.area = createEnrollmentDto.address.area;
    enrollment.village = createEnrollmentDto.address.village;
    enrollment.landmark = createEnrollmentDto.address.landmark;
    enrollment.streetNumber = createEnrollmentDto.address.streetNumber;
    enrollment.alleyNumber = createEnrollmentDto.address.alleyNumber;
    enrollment.buildingNumber = createEnrollmentDto.address.buildingNumber;
    enrollment.housingType = createEnrollmentDto.address.housingType;

    enrollment.parentIdDocuments = createEnrollmentDto.documents.parentIdDocuments;
    enrollment.birthCertificate = createEnrollmentDto.documents.birthCertificate;
    enrollment.childIdDocument = createEnrollmentDto.documents.childIdDocument;

    if (createEnrollmentDto.installment_plan_id) {
      const plan = await this.installmentPlanRepository.findOne({
        where: {
          id: createEnrollmentDto.installment_plan_id,
          school_id: schoolId,
          is_active: true,
        },
      });
      if (!plan) {
        throw new BadRequestException('Invalid installment plan for this school');
      }
      enrollment.installment_plan_id = plan.id;
    }

    // Promote draft → submitted application
    enrollment.status = 'pending';
    enrollment.draft_payload = null;

    const saved = await this.enrollmentRepository.save(enrollment);
    await this.linkEnrollmentDocuments(saved, schoolId);
    void this.notifyEnrollment(saved, 'submitted');
    return saved;
  }

  async findAll(schoolId?: string | null): Promise<Enrollment[]> {
    const qb = this.enrollmentRepository
      .createQueryBuilder('e')
      .orderBy('e.createdAt', 'DESC');
    if (schoolId != null) qb.andWhere('e.school_id = :schoolId', { schoolId });
    // Hide unfinished public-form drafts from the default staff inbox.
    qb.andWhere(`e.status != 'draft'`);
    return qb.getMany();
  }

  /** Server-paged applications list; search matches student, father, mother name or area. */
  async findPage(
    schoolId: string | null | undefined,
    query: EnrollmentListQuery,
  ): Promise<PageResult<Enrollment>> {
    const { page, limit } = parsePageQuery(query);
    const qb = this.enrollmentRepository.createQueryBuilder('e');
    if (schoolId != null) qb.andWhere('e.school_id = :schoolId', { schoolId });
    if (query.status) {
      qb.andWhere('e.status = :status', { status: query.status });
    } else {
      qb.andWhere(`e.status != 'draft'`);
    }
    if (query.grade) qb.andWhere('e.gradeLevel = :grade', { grade: query.grade });
    const term = likeTerm(query.q);
    if (term) {
      qb.andWhere(
        `LOWER(CONCAT_WS(' ', e.fullName, e.fatherFullName, e.motherFullName, e.area)) LIKE :term`,
        { term },
      );
    }

    const total = await qb.getCount();
    const safePage = clampPage(page, total, limit);
    const items = await qb
      .orderBy('e.createdAt', 'DESC')
      .addOrderBy('e.id', 'ASC')
      .skip((safePage - 1) * limit)
      .take(limit)
      .getMany();
    return buildPage(items, total, safePage, limit);
  }

  /** Delete unfinished public-form drafts idle for 24+ hours. */
  async purgeStalePublicDrafts(olderThanHours = 24): Promise<number> {
    const cutoff = new Date(Date.now() - olderThanHours * 60 * 60 * 1000);
    const result = await this.enrollmentRepository
      .createQueryBuilder()
      .delete()
      .from(Enrollment)
      .where(`status = 'draft'`)
      .andWhere(`"updatedAt" < :cutoff`, { cutoff })
      .execute();
    return result.affected ?? 0;
  }

  async findOne(id: string, actor?: User, schoolId?: string | null): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepository.findOne({
      where: { id },
    });

    if (!enrollment) {
      throw new NotFoundException(`Enrollment with ID ${id} not found`);
    }
    if (actor) {
      assertSameSchool(actor, enrollment.school_id);
    } else if (schoolId != null && String(enrollment.school_id) !== String(schoolId)) {
      throw new ForbiddenException('Resource not in your school');
    }

    return enrollment;
  }

  async findByStatus(
    status: 'draft' | 'pending' | 'approved' | 'rejected' | 'enrolled',
    schoolId?: string | null,
  ): Promise<Enrollment[]> {
    const where: Record<string, unknown> = { status };
    if (schoolId != null) where.school_id = schoolId;
    return this.enrollmentRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  async update(id: string, updateEnrollmentDto: UpdateEnrollmentDto): Promise<Enrollment> {
    const enrollment = await this.findOne(id);

    // Update student information
    if (updateEnrollmentDto.student) {
      this.applyStudentIdentity(enrollment, updateEnrollmentDto.student);
    }

    // Update academic information
    if (updateEnrollmentDto.academic) {
      Object.assign(enrollment, updateEnrollmentDto.academic);
    }

    // Update health information
    if (updateEnrollmentDto.health) {
      enrollment.allergies = updateEnrollmentDto.health.allergies ?? enrollment.allergies;
      enrollment.allergiesDetails = updateEnrollmentDto.health.allergiesDetails ?? enrollment.allergiesDetails;
      enrollment.seizures = updateEnrollmentDto.health.seizures ?? enrollment.seizures;
      enrollment.seizuresDetails = updateEnrollmentDto.health.seizuresDetails ?? enrollment.seizuresDetails;
      enrollment.surgeries = updateEnrollmentDto.health.surgeries ?? enrollment.surgeries;
      enrollment.surgeriesDetails = updateEnrollmentDto.health.surgeriesDetails ?? enrollment.surgeriesDetails;
      enrollment.chronicDiseases = updateEnrollmentDto.health.chronicDiseases ?? enrollment.chronicDiseases;
      enrollment.chronicDiseasesDetails = updateEnrollmentDto.health.chronicDiseasesDetails ?? enrollment.chronicDiseasesDetails;
      enrollment.otherHealthInfo = updateEnrollmentDto.health.other ?? enrollment.otherHealthInfo;
      enrollment.medicalReports = updateEnrollmentDto.health.medicalReports ?? enrollment.medicalReports;
    }

    // Update guardian information
    if (updateEnrollmentDto.guardian) {
      enrollment.guardianType = updateEnrollmentDto.guardian.type ?? enrollment.guardianType;

      if (updateEnrollmentDto.guardian.fatherInfo) {
        this.applyFatherIdentity(enrollment, updateEnrollmentDto.guardian.fatherInfo);
      }

      if (updateEnrollmentDto.guardian.motherInfo) {
        this.applyMotherIdentity(enrollment, updateEnrollmentDto.guardian.motherInfo);
      }

      if (updateEnrollmentDto.guardian.otherInfo) {
        enrollment.organizationName = updateEnrollmentDto.guardian.otherInfo.organizationName ?? enrollment.organizationName;
        enrollment.organizationPhone = updateEnrollmentDto.guardian.otherInfo.phone ?? enrollment.organizationPhone;
        enrollment.responsiblePerson = updateEnrollmentDto.guardian.otherInfo.responsiblePerson ?? enrollment.responsiblePerson;
        enrollment.responsiblePhone = updateEnrollmentDto.guardian.otherInfo.responsiblePhone ?? enrollment.responsiblePhone;
      }

      if (updateEnrollmentDto.guardian.emergencyContact) {
        enrollment.emergencyContactName = updateEnrollmentDto.guardian.emergencyContact.fullName ?? enrollment.emergencyContactName;
        enrollment.emergencyContactTribe = updateEnrollmentDto.guardian.emergencyContact.tribe ?? enrollment.emergencyContactTribe;
        enrollment.emergencyContactWorkplace = updateEnrollmentDto.guardian.emergencyContact.workplace ?? enrollment.emergencyContactWorkplace;
        enrollment.emergencyContactWorkPhone = updateEnrollmentDto.guardian.emergencyContact.workPhone ?? enrollment.emergencyContactWorkPhone;
        enrollment.emergencyContactMobile = updateEnrollmentDto.guardian.emergencyContact.mobile ?? enrollment.emergencyContactMobile;
        enrollment.emergencyContactRelationship = updateEnrollmentDto.guardian.emergencyContact.relationship ?? enrollment.emergencyContactRelationship;
      }
    }

    // Update address information
    if (updateEnrollmentDto.address) {
      Object.assign(enrollment, updateEnrollmentDto.address);
    }

    if (updateEnrollmentDto.documents) {
      enrollment.parentIdDocuments =
        updateEnrollmentDto.documents.parentIdDocuments ?? enrollment.parentIdDocuments;
      enrollment.birthCertificate =
        updateEnrollmentDto.documents.birthCertificate ?? enrollment.birthCertificate;
      enrollment.childIdDocument =
        updateEnrollmentDto.documents.childIdDocument ?? enrollment.childIdDocument;
    }

    if (updateEnrollmentDto.installment_plan_id !== undefined) {
      const planId = updateEnrollmentDto.installment_plan_id;
      if (planId == null || planId === '') {
        enrollment.installment_plan_id = null;
      } else {
        const schoolId = enrollment.school_id;
        if (!schoolId) {
          throw new BadRequestException('Enrollment has no school');
        }
        const plan = await this.installmentPlanRepository.findOne({
          where: {
            id: planId,
            school_id: schoolId,
            is_active: true,
          },
        });
        if (!plan) {
          throw new BadRequestException('Invalid installment plan for this school');
        }
        enrollment.installment_plan_id = plan.id;
      }
    }

    // Update status and notes
    if (updateEnrollmentDto.status) {
      enrollment.status = updateEnrollmentDto.status;
    }

    if (updateEnrollmentDto.notes) {
      enrollment.notes = updateEnrollmentDto.notes;
    }

    const saved = await this.enrollmentRepository.save(enrollment);
    if (saved.school_id && (updateEnrollmentDto.documents || updateEnrollmentDto.student?.photo)) {
      await this.linkEnrollmentDocuments(saved, saved.school_id);
    }
    return saved;
  }

  async remove(id: string): Promise<void> {
    const enrollment = await this.findOne(id);
    await this.enrollmentRepository.remove(enrollment);
  }

  async approveEnrollment(id: string, notes?: string, actor?: User): Promise<Enrollment> {
    const enrollment = await this.findOne(id, actor);
    if (!enrollment.school_id) {
      throw new BadRequestException('Enrollment has no school');
    }

    const level = await this.enrollmentFeePreview.resolvePaymentLevel(
      enrollment.school_id,
      enrollment.gradeLevel || '',
    );
    if (!level) {
      throw new BadRequestException(
        'Cannot approve: grade level does not match an active fee level for this school',
      );
    }

    const studentData = this.mapEnrollmentToStudent(enrollment);
    studentData.payment_level_id = level.id;
    const student = await this.studentService.create(studentData);

    const parentIds: string[] = [];

    if (enrollment.fatherFullName) {
      const fatherData = this.mapFatherToParent(enrollment, student.firstName + ' ' + student.lastName);
      fatherData.studentIds = [student.id];
      const father = await this.parentService.create(fatherData, enrollment.school_id ?? undefined);
      parentIds.push(father.id.toString());
    }

    if (enrollment.motherFullName) {
      const motherData = this.mapMotherToParent(enrollment, student.firstName + ' ' + student.lastName);
      motherData.studentIds = [student.id];
      const mother = await this.parentService.create(motherData, enrollment.school_id ?? undefined);
      parentIds.push(mother.id.toString());
    }

    enrollment.studentId = student.id;
    if (parentIds.length > 0) {
      enrollment.parentId = parentIds[0];
    }

    try {
      await this.chargeSheets.seedAfterEnrollment(
        enrollment.school_id,
        student.id,
        enrollment.installment_plan_id ?? null,
      );
    } catch (err) {
      this.logger.error(
        `Charge sheet seed failed for enrollment ${enrollment.id} / student ${student.id}`,
        err as Error,
      );
      try {
        await this.studentService.remove(student.id);
      } catch (cleanupErr) {
        this.logger.error(
          `Failed to roll back student ${student.id} after charge sheet seed failure`,
          cleanupErr as Error,
        );
      }
      throw new BadRequestException(
        'Could not build the fee charge sheet for this grade/plan. Check fee packages and try again.',
      );
    }

    enrollment.status = 'enrolled';
    if (notes) {
      enrollment.notes = notes;
    }

    const saved = await this.enrollmentRepository.save(enrollment);
    void this.notifyEnrollment(saved, 'accepted');
    return saved;
  }

  async rejectEnrollment(id: string, notes: string, actor?: User): Promise<Enrollment> {
    const enrollment = await this.findOne(id, actor);
    enrollment.status = 'rejected';
    enrollment.notes = notes;
    const saved = await this.enrollmentRepository.save(enrollment);
    void this.notifyEnrollment(saved, 'rejected');
    return saved;
  }

  private async notifyEnrollment(enrollment: Enrollment, kind: 'accepted' | 'rejected' | 'submitted') {
    try {
      const school = enrollment.school_id
        ? await this.schoolRepository.findOne({ where: { id: enrollment.school_id } })
        : null;
      const recipients = [
        {
          email: enrollment.fatherEmail,
          phone: enrollment.fatherMobile,
          name: enrollment.fatherFullName,
        },
        {
          email: enrollment.motherEmail,
          phone: enrollment.motherMobile,
          name: enrollment.motherFullName,
        },
      ].filter((r) => r.email || r.phone);
      if (kind === 'submitted' && (school?.email || school?.phone)) {
        recipients.push({
          email: school.email ?? undefined,
          phone: school.phone ?? undefined,
          name: school.name,
        });
      }
      if (!recipients.length) return;
      await this.notifications.notifySafe({
        schoolId: school?.id ?? enrollment.school_id ?? null,
        templateKey:
          kind === 'accepted'
            ? NOTIFICATION_TEMPLATE_KEYS.ENROLLMENT_ACCEPTED
            : kind === 'rejected'
              ? NOTIFICATION_TEMPLATE_KEYS.ENROLLMENT_REJECTED
              : NOTIFICATION_TEMPLATE_KEYS.ENROLLMENT_SUBMITTED,
        locale: 'ar',
        variables: {
          schoolName: school?.name ?? 'School',
          studentName: enrollment.fullName,
          recipientName: enrollment.fatherFullName || enrollment.motherFullName || 'ولي الأمر',
          notes: enrollment.notes || '',
        },
        recipients,
      });
    } catch (err) {
      this.logger.error(`Enrollment ${kind} notification failed`, err as Error);
    }
  }

  // Helper method to split Arabic full name into first and last names
  private splitArabicName(fullName: string): { firstName: string; lastName: string } {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 2) {
      return {
        firstName: nameParts[0],
        lastName: nameParts.slice(1).join(' ')
      };
    } else {
      return {
        firstName: fullName,
        lastName: ''
      };
    }
  }

  // Map enrollment data to Student creation DTO
  private mapEnrollmentToStudent(enrollment: Enrollment): CreateStudentDto {
    const split = this.splitArabicName(enrollment.fullName);
    const firstAr = enrollment.first_name_ar || split.firstName;
    const lastAr = enrollment.last_name_ar || split.lastName;
    const firstEn = enrollment.first_name_en || firstAr;
    const lastEn = enrollment.last_name_en || lastAr;

    // Build medical info from health data
    const medicalInfo: string[] = [];
    if (enrollment.allergies && enrollment.allergiesDetails) {
      medicalInfo.push(`الحساسية: ${enrollment.allergiesDetails}`);
    }
    if (enrollment.chronicDiseases && enrollment.chronicDiseasesDetails) {
      medicalInfo.push(`الأمراض المزمنة: ${enrollment.chronicDiseasesDetails}`);
    }
    if (enrollment.surgeries && enrollment.surgeriesDetails) {
      medicalInfo.push(`العمليات الجراحية: ${enrollment.surgeriesDetails}`);
    }
    if (enrollment.seizures && enrollment.seizuresDetails) {
      medicalInfo.push(`النوبات: ${enrollment.seizuresDetails}`);
    }
    if (enrollment.otherHealthInfo) {
      medicalInfo.push(`معلومات صحية أخرى: ${enrollment.otherHealthInfo}`);
    }

    // Build address from enrollment address fields
    const addressParts: string[] = [];
    if (enrollment.area) addressParts.push(enrollment.area);
    if (enrollment.village) addressParts.push(enrollment.village);
    if (enrollment.landmark) addressParts.push(enrollment.landmark);
    if (enrollment.streetNumber) addressParts.push(`شارع ${enrollment.streetNumber}`);
    if (enrollment.buildingNumber) addressParts.push(`مبنى ${enrollment.buildingNumber}`);

    return {
      ...applyBilingualName({
        first_name_ar: firstAr,
        last_name_ar: lastAr,
        first_name_en: firstEn,
        last_name_en: lastEn,
        firstName: firstEn || firstAr,
        lastName: lastEn || lastAr,
      }),
      secondName: enrollment.secondName || undefined,
      thirdName: enrollment.thirdName || undefined,
      secondNameEn: enrollment.secondNameEn || undefined,
      thirdNameEn: enrollment.thirdNameEn || undefined,
      civil_id: enrollment.idNumber || undefined,
      tribe: enrollment.tribe || undefined,
      dateOfBirth: enrollment.dateOfBirth || new Date(),
      gender: enrollment.gender,
      address: addressParts.join(', ') || 'غير محدد',
      phone: enrollment.fatherMobile || enrollment.motherMobile || '',
      email: enrollment.fatherEmail || enrollment.motherEmail || '',
      emergencyContact: enrollment.emergencyContactName || 'غير محدد',
      school_id: enrollment.school_id ?? undefined,
      medicalInfo: medicalInfo.join('; ') || 'لا توجد معلومات طبية',
      nationality: enrollment.nationality,
      photo: enrollment.photo,
      notes: `تم إنشاؤه من طلب التسجيل: ${enrollment.id}`
    };
  }

  // Map father info to Parent creation DTO
  private mapFatherToParent(enrollment: Enrollment, studentName: string): CreateParentDto {
    const nameInfo = this.splitArabicName(enrollment.fatherFullName || '');
    const firstAr = enrollment.father_first_name_ar || nameInfo.firstName;
    const lastAr = enrollment.father_last_name_ar || nameInfo.lastName;
    const firstEn = enrollment.father_first_name_en || firstAr;
    const lastEn = enrollment.father_last_name_en || lastAr;

    // Build address for father
    const addressParts: string[] = [];
    if (enrollment.area) addressParts.push(enrollment.area);
    if (enrollment.village) addressParts.push(enrollment.village);
    if (enrollment.fatherWorkplace) addressParts.push(`مكان العمل: ${enrollment.fatherWorkplace}`);

    return {
      ...applyBilingualName({
        first_name_ar: firstAr,
        last_name_ar: lastAr,
        first_name_en: firstEn,
        last_name_en: lastEn,
        firstName: firstEn || firstAr,
        lastName: lastEn || lastAr,
      }),
      civil_id: enrollment.father_civil_id || undefined,
      email: enrollment.fatherEmail,
      phone: enrollment.fatherMobile,
      address: addressParts.join(', ') || 'غير محدد'
    };
  }

  // Map mother info to Parent creation DTO
  private mapMotherToParent(enrollment: Enrollment, studentName: string): CreateParentDto {
    const nameInfo = this.splitArabicName(enrollment.motherFullName || '');
    const firstAr = enrollment.mother_first_name_ar || nameInfo.firstName;
    const lastAr = enrollment.mother_last_name_ar || nameInfo.lastName;
    const firstEn = enrollment.mother_first_name_en || firstAr;
    const lastEn = enrollment.mother_last_name_en || lastAr;

    // Build address for mother
    const addressParts: string[] = [];
    if (enrollment.area) addressParts.push(enrollment.area);
    if (enrollment.village) addressParts.push(enrollment.village);
    if (enrollment.motherWorkplace) addressParts.push(`مكان العمل: ${enrollment.motherWorkplace}`);

    return {
      ...applyBilingualName({
        first_name_ar: firstAr,
        last_name_ar: lastAr,
        first_name_en: firstEn,
        last_name_en: lastEn,
        firstName: firstEn || firstAr,
        lastName: lastEn || lastAr,
      }),
      civil_id: enrollment.mother_civil_id || undefined,
      email: enrollment.motherEmail,
      phone: enrollment.motherMobile,
      address: addressParts.join(', ') || 'غير محدد'
    };
  }
}