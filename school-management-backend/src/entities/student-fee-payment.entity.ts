import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Student } from './student.entity';
import { School } from './school.entity';
import { StudentChargeSheet } from './student-charge-sheet.entity';
import { StudentChargeSheetInstallment } from './student-charge-sheet-installment.entity';
import { User } from './user.entity';
import { FeeTransfer } from './fee-transfer.entity';
import { Payment } from './payment.entity';

export type FeePaymentMethod = 'offline' | 'thawani' | 'admin';
export type FeePaymentStatus =
  | 'pending'
  | 'pending_approval'
  | 'pending_reconcile'
  | 'paid'
  | 'rejected'
  | 'cancelled'
  | 'failed';
export type FeePaymentTarget = 'upfront' | 'installment';

@Entity('student_fee_payments')
@Index('IDX_student_fee_payments_school_status', ['school_id', 'status'])
@Index('IDX_student_fee_payments_student', ['student_id'])
export class StudentFeePayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  sheet_id: string;

  /** Shared receipt header in `payments` (one ref can cover several allocation slices). */
  @Column({ type: 'uuid', nullable: true })
  payment_id: string | null;

  @Column({ type: 'varchar', length: 16 })
  target_type: FeePaymentTarget;

  @Column({ type: 'uuid', nullable: true })
  installment_id: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amount: string;

  @Column({ type: 'varchar', length: 16 })
  method: FeePaymentMethod;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status: FeePaymentStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  proof_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proof_original_name: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks: string | null;

  @Column({ type: 'varchar', length: 128, nullable: true })
  thawani_session_id: string | null;

  @Column({ type: 'varchar', length: 64, nullable: true })
  thawani_invoice: string | null;

  @Column({ type: 'varchar', length: 8, default: 'ar' })
  receipt_locale: 'en' | 'ar';

  @Column({ type: 'uuid', nullable: true })
  submitted_by: string | null;

  @Column({ type: 'uuid', nullable: true })
  reviewed_by: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  reviewed_at: Date | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  review_notes: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  receipt_sent_at: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @Column({ type: 'uuid', nullable: true })
  transfer_id: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => StudentChargeSheet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;

  @ManyToOne(() => Payment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_id' })
  payment: Payment | null;

  @ManyToOne(() => StudentChargeSheetInstallment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'installment_id' })
  installment: StudentChargeSheetInstallment | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submitted_by' })
  submittedByUser: User | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedByUser: User | null;

  @ManyToOne(() => FeeTransfer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: FeeTransfer | null;
}
