import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StudentChargeSheet } from './student-charge-sheet.entity';
import { PaymentExtraType } from './payment-extra-type.entity';

@Entity('student_charge_sheet_extra_lines')
export class StudentChargeSheetExtraLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sheet_id', type: 'uuid' })
  sheet_id: string;

  @Column({ name: 'extra_type_id', type: 'uuid' })
  extra_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  remarks: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => StudentChargeSheet, (s) => s.extraLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;

  @ManyToOne(() => PaymentExtraType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'extra_type_id' })
  extraType: PaymentExtraType;
}
