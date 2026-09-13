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
import { School } from './school.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

export type PaymentMethod = 'offline' | 'thawani' | 'admin';
export type PaymentStatus =
  | 'pending'
  | 'pending_approval'
  | 'pending_reconcile'
  | 'paid'
  | 'rejected'
  | 'cancelled'
  | 'failed';

/**
 * Shared payment / receipt header (reusable across fees and other modules).
 * Domain-specific slices (e.g. `student_fee_payments`) link via `payment_id`.
 */
@Entity('payments')
@Index('UQ_payments_payment_ref', ['payment_ref'], { unique: true })
@Index('IDX_payments_school_created', ['school_id', 'created_at'])
@Index('IDX_payments_student', ['student_id'])
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  /** Optional — set when the payment is for a student (fees, etc.). */
  @Column({ type: 'uuid', nullable: true })
  student_id: string | null;

  /** Human-facing reference, e.g. PAY-20260910-A3K9Q2 */
  @Column({ type: 'varchar', length: 32 })
  payment_ref: string;

  @Column({ type: 'decimal', precision: 12, scale: 3 })
  amount: string;

  @Column({ type: 'varchar', length: 16 })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 24, default: 'pending' })
  status: PaymentStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  proof_url: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proof_original_name: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks: string | null;

  @Column({ type: 'uuid', nullable: true })
  submitted_by: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Student, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'student_id' })
  student: Student | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'submitted_by' })
  submittedByUser: User | null;
}
