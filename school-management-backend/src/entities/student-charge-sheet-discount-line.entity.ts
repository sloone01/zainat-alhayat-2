import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentChargeSheet } from './student-charge-sheet.entity';
import { PaymentDiscountType } from './payment-discount-type.entity';

@Entity('student_charge_sheet_discount_lines')
export class StudentChargeSheetDiscountLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sheet_id', type: 'uuid' })
  sheet_id: string;

  @Column({ name: 'discount_type_id', type: 'uuid' })
  discount_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => StudentChargeSheet, (s) => s.discountLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;

  @ManyToOne(() => PaymentDiscountType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'discount_type_id' })
  discountType: PaymentDiscountType;
}
