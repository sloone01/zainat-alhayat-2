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
import { StudentPayment } from './student-payment.entity';
import { AcademicYear } from './academic-year.entity';
import { User } from './user.entity';
import { PaymentTransactionAllocation } from './payment-transaction-allocation.entity';

@Entity('payment_transactions')
export class PaymentTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'student_payment_id', type: 'uuid' })
  student_payment_id: string;

  @Column({ name: 'academic_year_id', type: 'uuid', nullable: true })
  academic_year_id: string | null;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  total_amount: string;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @Column({ name: 'paid_at', type: 'timestamptz' })
  paid_at: Date;

  @Column({ name: 'recorded_by_user_id', type: 'uuid', nullable: true })
  recorded_by_user_id: string | null;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

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

  @ManyToOne(() => StudentPayment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_payment_id' })
  studentPayment: StudentPayment;

  @ManyToOne(() => AcademicYear, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recorded_by_user_id' })
  recordedBy: User | null;

  @OneToMany(() => PaymentTransactionAllocation, (a) => a.paymentTransaction, { cascade: true })
  allocations: PaymentTransactionAllocation[];
}
