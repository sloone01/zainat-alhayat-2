import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('enrollments')
export class Enrollment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Student Information
  @Column({ length: 200 })
  fullName: string;

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
    type: 'enum',
    enum: ['pending', 'approved', 'rejected', 'enrolled'],
    default: 'pending'
  })
  status: 'pending' | 'approved' | 'rejected' | 'enrolled';

  @Column({ type: 'text', nullable: true })
  notes?: string;

  // Reference to created student and parent after approval
  @Column({ type: 'uuid', nullable: true })
  studentId?: string;

  @Column({ type: 'uuid', nullable: true })
  parentId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}