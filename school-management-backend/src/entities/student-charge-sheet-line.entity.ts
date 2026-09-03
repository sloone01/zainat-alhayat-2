import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { StudentChargeSheet } from './student-charge-sheet.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('student_charge_sheet_lines')
export class StudentChargeSheetLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sheet_id', type: 'uuid' })
  sheet_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'varchar', length: 16 })
  source_type: 'grade' | 'bus' | 'course';

  @Column({ name: 'source_ref_id', type: 'uuid', nullable: true })
  source_ref_id: string | null;

  @Column({ type: 'varchar', length: 255 })
  charge_label: string;

  @Column({ type: 'varchar', length: 16, default: 'installment' })
  payment_timing: 'upfront' | 'installment';

  @Column({ type: 'varchar', length: 16, default: 'per_year' })
  billing_frequency: 'per_year' | 'once_only';

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  list_amount: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due_amount: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paid_amount: string;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: 'pending' | 'paid' | 'waived';

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @ManyToOne(() => StudentChargeSheet, (s) => s.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
