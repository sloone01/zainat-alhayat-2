import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { PaymentTransaction } from './payment-transaction.entity';
import { StudentFeeCharge } from './student-fee-charge.entity';
import { PaymentChargeType } from './payment-charge-type.entity';
import { LevelPaymentInstallment } from './level-payment-installment.entity';

@Entity('payment_transaction_allocations')
export class PaymentTransactionAllocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'payment_transaction_id', type: 'uuid' })
  payment_transaction_id: string;

  @Column({ name: 'student_fee_charge_id', type: 'uuid' })
  student_fee_charge_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ name: 'level_payment_installment_id', type: 'uuid', nullable: true })
  level_payment_installment_id: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => PaymentTransaction, (t) => t.allocations, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_transaction_id' })
  paymentTransaction: PaymentTransaction;

  @ManyToOne(() => StudentFeeCharge, (c) => c.allocations, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'student_fee_charge_id' })
  studentFeeCharge: StudentFeeCharge;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;

  @ManyToOne(() => LevelPaymentInstallment, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'level_payment_installment_id' })
  installment: LevelPaymentInstallment | null;
}
