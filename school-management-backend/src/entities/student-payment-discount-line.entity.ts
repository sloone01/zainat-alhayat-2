import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { StudentPayment } from './student-payment.entity';
import { PaymentDiscountType } from './payment-discount-type.entity';

@Entity('student_payment_discount_lines')
export class StudentPaymentDiscountLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_payment_id', type: 'uuid' })
  student_payment_id: string;

  @Column({ name: 'discount_type_id', type: 'uuid' })
  discount_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @Column({ type: 'text', default: '' })
  remarks: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => StudentPayment, (p) => p.discountLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_payment_id' })
  studentPayment: StudentPayment;

  @ManyToOne(() => PaymentDiscountType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'discount_type_id' })
  discountType: PaymentDiscountType;
}
