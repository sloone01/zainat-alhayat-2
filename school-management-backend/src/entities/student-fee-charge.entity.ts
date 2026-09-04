import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Student } from './student.entity';
import { School } from './school.entity';
import { StudentPayment } from './student-payment.entity';
import { AcademicYear } from './academic-year.entity';
import { PaymentChargeType } from './payment-charge-type.entity';
import type { PaymentChargeBillingOccurrence } from '../constants/payment-charge-billing-occurrence';
import { PaymentTransactionAllocation } from './payment-transaction-allocation.entity';

@Entity('student_fee_charges')
export class StudentFeeCharge {
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

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'varchar', length: 32 })
  billing_occurrence: PaymentChargeBillingOccurrence;

  @Column({ name: 'amount_due', type: 'decimal', precision: 12, scale: 2 })
  amount_due: string;

  @Column({ name: 'amount_paid', type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount_paid: string;

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

  @ManyToOne(() => StudentPayment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_payment_id' })
  studentPayment: StudentPayment;

  @ManyToOne(() => AcademicYear, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear | null;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;

  @OneToMany(() => PaymentTransactionAllocation, (a) => a.studentFeeCharge)
  allocations: PaymentTransactionAllocation[];
}
