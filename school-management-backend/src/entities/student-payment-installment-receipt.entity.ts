import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { StudentPayment } from './student-payment.entity';
import { LevelPaymentInstallment } from './level-payment-installment.entity';

@Entity('student_payment_installment_receipts')
@Unique('UQ_spir_payment_installment', ['student_payment_id', 'level_payment_installment_id'])
export class StudentPaymentInstallmentReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_payment_id', type: 'uuid' })
  student_payment_id: string;

  @Column({ name: 'level_payment_installment_id', type: 'uuid' })
  level_payment_installment_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ name: 'paid_at', type: 'timestamptz' })
  paid_at: Date;

  @Column({ type: 'text', nullable: true })
  remarks: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => StudentPayment, (p) => p.installmentReceipts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_payment_id' })
  studentPayment: StudentPayment;

  @ManyToOne(() => LevelPaymentInstallment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_payment_installment_id' })
  installment: LevelPaymentInstallment;
}
