import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { FeeTransfer } from './fee-transfer.entity';
import { StudentFeePayment } from './student-fee-payment.entity';

@Entity('fee_transfer_lines')
export class FeeTransferLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  transfer_id: string;

  @Column({ type: 'uuid' })
  payment_id: string;

  @ManyToOne(() => FeeTransfer, (t) => t.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: FeeTransfer;

  @ManyToOne(() => StudentFeePayment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'payment_id' })
  payment: StudentFeePayment;
}
