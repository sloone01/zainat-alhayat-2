import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Student } from './student.entity';
import { School } from './school.entity';
import { SchoolPaymentLevel } from './school-payment-level.entity';
import { LevelPaymentProfile } from './level-payment-profile.entity';
import { StudentPaymentDiscountLine } from './student-payment-discount-line.entity';
import { StudentPaymentInstallmentReceipt } from './student-payment-installment-receipt.entity';
import { Course } from './course.entity';
import { CoursePaymentProfile } from './course-payment-profile.entity';

@Entity('student_payments')
export class StudentPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'level_id', type: 'uuid', nullable: true })
  level_id: string | null;

  @Column({ name: 'level_payment_profile_id', type: 'uuid', nullable: true })
  level_payment_profile_id: string | null;

  @Column({ name: 'course_id', type: 'uuid', nullable: true })
  course_id: string | null;

  @Column({ name: 'course_payment_profile_id', type: 'uuid', nullable: true })
  course_payment_profile_id: string | null;

  @Column({ name: 'base_total_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  base_total_amount: string;

  @Column({ name: 'admin_adjusted_total', type: 'decimal', precision: 12, scale: 2, nullable: true })
  admin_adjusted_total: string | null;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => SchoolPaymentLevel, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel | null;

  @ManyToOne(() => LevelPaymentProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_payment_profile_id' })
  levelPaymentProfile: LevelPaymentProfile | null;

  @ManyToOne(() => Course, { nullable: true, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course | null;

  @ManyToOne(() => CoursePaymentProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'course_payment_profile_id' })
  coursePaymentProfile: CoursePaymentProfile | null;

  @OneToMany(() => StudentPaymentDiscountLine, (d) => d.studentPayment)
  discountLines: StudentPaymentDiscountLine[];

  @OneToMany(() => StudentPaymentInstallmentReceipt, (r) => r.studentPayment)
  installmentReceipts: StudentPaymentInstallmentReceipt[];
}
