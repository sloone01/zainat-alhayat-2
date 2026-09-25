import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Student Information
  @Column({ length: 200 })
  fullName: string;

  @Column({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true })
  first_name_ar?: string | null;

  @Column({ name: 'first_name_en', type: 'varchar', length: 100, nullable: true })
  first_name_en?: string | null;

  @Column({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true })
  last_name_ar?: string | null;

  @Column({ name: 'last_name_en', type: 'varchar', length: 100, nullable: true })
  last_name_en?: string | null;

  @Column({ name: 'second_name', type: 'varchar', length: 100, nullable: true })
  secondName?: string | null;

  @Column({ name: 'third_name', type: 'varchar', length: 100, nullable: true })
  thirdName?: string | null;

  @Column({ name: 'second_name_en', type: 'varchar', length: 100, nullable: true })
  secondNameEn?: string | null;

  @Column({ name: 'third_name_en', type: 'varchar', length: 100, nullable: true })
  thirdNameEn?: string | null;

  @Column({ length: 100, nullable: true })
  tribe?: string;

  @Column({ length: 100, nullable: true })
  idNumber?: string;

  @Column({
    type: 'enum',
    enum: ['male', 'female'],
  })
  gender: 'male' | 'female';

  @Column({ length: 100, nullable: true })
  nationality?: string;

  @Column({ length: 100, nullable: true })
  religion?: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth?: Date;

  @Column({ type: 'int', nullable: true })
  age?: number;

  @Column({ type: 'boolean', default: false })
  hasSiblings: boolean;

  @Column({ type: 'text', nullable: true })
  photo?: string; // Base64 or file path

  // Academic Information
  @Column({
    type: 'enum',
    enum: ['new', 'transfer'],
    default: 'new'
  })
  enrollmentStatus: 'new' | 'transfer';

  @Column({ length: 100, nullable: true })
  gradeLevel?: string;

  @Column({ length: 200, nullable: true })
  previousSchool?: string;

  // Health Information
  @Column({ type: 'boolean', default: false })
  allergies: boolean;

  @Column({ type: 'text', nullable: true })
  allergiesDetails?: string;

  @Column({ type: 'boolean', default: false })
  seizures: boolean;

  @Column({ type: 'text', nullable: true })
  seizuresDetails?: string;

  @Column({ type: 'boolean', default: false })
  surgeries: boolean;

  @Column({ type: 'text', nullable: true })
  surgeriesDetails?: string;

  @Column({ type: 'boolean', default: false })
  chronicDiseases: boolean;

  @Column({ type: 'text', nullable: true })
  chronicDiseasesDetails?: string;

  @Column({ type: 'text', nullable: true })
  otherHealthInfo?: string;

  @Column({ type: 'json', nullable: true })
  medicalReports?: string[]; // Array of file paths or base64 strings

  /** Parent civil ID / passport scans (base64 data URLs). */
  @Column({ name: 'parent_id_documents', type: 'json', nullable: true })
  parentIdDocuments?: string[];

  /** Child birth certificate scan (base64 data URL). */
  @Column({ name: 'birth_certificate', type: 'text', nullable: true })
  birthCertificate?: string | null;

  /** Child civil ID / passport scan (base64 data URL). */
  @Column({ name: 'child_id_document', type: 'text', nullable: true })
  childIdDocument?: string | null;

  // Guardian Information
  @Column({
    type: 'enum',
    enum: ['father', 'mother', 'other'],
    default: 'father'
  })
  guardianType: 'father' | 'mother' | 'other';

  // Father Information
  @Column({ length: 200, nullable: true })
  fatherFullName?: string;

  @Column({ name: 'father_first_name_ar', type: 'varchar', length: 100, nullable: true })
  father_first_name_ar?: string | null;

  @Column({ name: 'father_first_name_en', type: 'varchar', length: 100, nullable: true })
  father_first_name_en?: string | null;

  @Column({ name: 'father_last_name_ar', type: 'varchar', length: 100, nullable: true })
  father_last_name_ar?: string | null;

  @Column({ name: 'father_last_name_en', type: 'varchar', length: 100, nullable: true })
  father_last_name_en?: string | null;

  @Column({ name: 'father_civil_id', type: 'varchar', length: 40, nullable: true })
  father_civil_id?: string | null;

  @Column({ length: 100, nullable: true })
  fatherTribe?: string;

  @Column({ length: 200, nullable: true })
  fatherWorkplace?: string;

  @Column({ length: 20, nullable: true })
  fatherWorkPhone?: string;

  @Column({ length: 20, nullable: true })
  fatherMobile?: string;

  @Column({ length: 200, nullable: true })
  fatherEmail?: string;

  @Column({ length: 50, nullable: true })
  fatherMaritalStatus?: string;

  // Mother Information
  @Column({ length: 200, nullable: true })
  motherFullName?: string;

  @Column({ name: 'mother_first_name_ar', type: 'varchar', length: 100, nullable: true })
  mother_first_name_ar?: string | null;

  @Column({ name: 'mother_first_name_en', type: 'varchar', length: 100, nullable: true })
  mother_first_name_en?: string | null;

  @Column({ name: 'mother_last_name_ar', type: 'varchar', length: 100, nullable: true })
  mother_last_name_ar?: string | null;

  @Column({ name: 'mother_last_name_en', type: 'varchar', length: 100, nullable: true })
  mother_last_name_en?: string | null;

  @Column({ name: 'mother_civil_id', type: 'varchar', length: 40, nullable: true })
  mother_civil_id?: string | null;

  @Column({ length: 100, nullable: true })
  motherTribe?: string;

  @Column({ length: 200, nullable: true })
  motherWorkplace?: string;

  @Column({ length: 20, nullable: true })
  motherWorkPhone?: string;

  @Column({ length: 20, nullable: true })
  motherMobile?: string;

  @Column({ length: 200, nullable: true })
  motherEmail?: string;

  @Column({ length: 50, nullable: true })
  motherMaritalStatus?: string;

  // Other Guardian Information
  @Column({ length: 200, nullable: true })
  organizationName?: string;

  @Column({ length: 20, nullable: true })
  organizationPhone?: string;

  @Column({ length: 200, nullable: true })
  responsiblePerson?: string;

  @Column({ length: 20, nullable: true })
  responsiblePhone?: string;

  // Emergency Contact
  @Column({ length: 200, nullable: true })
  emergencyContactName?: string;

  @Column({ length: 100, nullable: true })
  emergencyContactTribe?: string;

  @Column({ length: 200, nullable: true })
  emergencyContactWorkplace?: string;

  @Column({ length: 20, nullable: true })
  emergencyContactWorkPhone?: string;

  @Column({ length: 20, nullable: true })
  emergencyContactMobile?: string;

  @Column({ length: 100, nullable: true })
  emergencyContactRelationship?: string;

  // Address Information
  @Column({ length: 100, nullable: true })
  area?: string;

  @Column({ length: 100, nullable: true })
  village?: string;

  @Column({ length: 200, nullable: true })
  landmark?: string;

  @Column({ length: 50, nullable: true })
  streetNumber?: string;

  @Column({ length: 50, nullable: true })
  alleyNumber?: string;

  @Column({ length: 50, nullable: true })
  buildingNumber?: string;

  @Column({
    type: 'enum',
    enum: ['house', 'apartment'],
    default: 'house'
  })
  housingType: 'house' | 'apartment';

  // Application Status
  @Column({
    type: 'varchar',
    length: 24,
    default: 'pending',
  })
  status: 'draft' | 'pending' | 'approved' | 'rejected' | 'enrolled';

  /** Wizard snapshot for public draft resume (civil-ID lookup). Cleared on submit. */
  @Column({ name: 'draft_payload', type: 'jsonb', nullable: true })
  draft_payload?: Record<string, unknown> | null;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Reference to created student and parent after approval
  @Column({ type: 'uuid', nullable: true })
  studentId?: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  /** Tenant school — required for staff listing/approval scoping */
  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id?: string | null;

  /** Fees v2 installment plan chosen on the public application */
  @Column({ name: 'installment_plan_id', type: 'uuid', nullable: true })
  installment_plan_id?: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}