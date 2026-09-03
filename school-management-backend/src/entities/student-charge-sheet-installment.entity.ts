import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { StudentChargeSheet } from './student-charge-sheet.entity';

@Entity('student_charge_sheet_installments')
@Unique('UQ_student_charge_sheet_installments_seq', ['sheet_id', 'sequence'])
export class StudentChargeSheetInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sheet_id', type: 'uuid' })
  sheet_id: string;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'int', nullable: true })
  month_number: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount_due: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount_paid: string;

  @Column({ type: 'varchar', length: 16, default: 'pending' })
  status: 'pending' | 'paid' | 'partial';

  @ManyToOne(() => StudentChargeSheet, (s) => s.installments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;
}
