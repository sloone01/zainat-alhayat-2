import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { StudentChargeSheet } from './student-charge-sheet.entity';
import { PaymentInclusionType } from './payment-inclusion-type.entity';

@Entity('student_charge_sheet_inclusion_lines')
@Unique('UQ_sheet_inclusion_type', ['sheet_id', 'inclusion_type_id'])
export class StudentChargeSheetInclusionLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sheet_id', type: 'uuid' })
  sheet_id: string;

  @Column({ name: 'inclusion_type_id', type: 'uuid' })
  inclusion_type_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @ManyToOne(() => StudentChargeSheet, (s) => s.inclusionLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sheet_id' })
  sheet: StudentChargeSheet;

  @ManyToOne(() => PaymentInclusionType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inclusion_type_id' })
  inclusionType: PaymentInclusionType;
}
