import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Student } from './student.entity';
import { School } from './school.entity';
import { AcademicYear } from './academic-year.entity';
import { InstallmentPlan } from './installment-plan.entity';
import { StudentChargeSheetLine } from './student-charge-sheet-line.entity';
import { StudentChargeSheetInstallment } from './student-charge-sheet-installment.entity';
import { StudentChargeSheetDiscountLine } from './student-charge-sheet-discount-line.entity';
import { StudentChargeSheetExtraLine } from './student-charge-sheet-extra-line.entity';
import { StudentChargeSheetInclusionLine } from './student-charge-sheet-inclusion-line.entity';

@Entity('student_charge_sheets')
@Unique('UQ_student_charge_sheets_student_year', ['student_id', 'academic_year_id'])
export class StudentChargeSheet {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @Column({ name: 'academic_year_id', type: 'uuid' })
  academic_year_id: string;

  @Column({ name: 'installment_plan_id', type: 'uuid', nullable: true })
  installment_plan_id: string | null;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  list_total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  due_total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  paid_total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount_total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  extra_total: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  upfront_due: string;

  /** Staff-set advance; null uses the package timing ratio. */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  upfront_override: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  installment_due: string;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: string;

  /** When true, inclusions come from inclusionLines; otherwise from linked packages. */
  @Column({ type: 'boolean', default: false })
  custom_inclusions: boolean;

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

  @ManyToOne(() => AcademicYear, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;

  @ManyToOne(() => InstallmentPlan, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'installment_plan_id' })
  installmentPlan: InstallmentPlan | null;

  @OneToMany(() => StudentChargeSheetLine, (l) => l.sheet, { cascade: true })
  lines: StudentChargeSheetLine[];

  @OneToMany(() => StudentChargeSheetInstallment, (i) => i.sheet, { cascade: true })
  installments: StudentChargeSheetInstallment[];

  @OneToMany(() => StudentChargeSheetDiscountLine, (d) => d.sheet, { cascade: true })
  discountLines: StudentChargeSheetDiscountLine[];

  @OneToMany(() => StudentChargeSheetExtraLine, (e) => e.sheet, { cascade: true })
  extraLines: StudentChargeSheetExtraLine[];

  @OneToMany(() => StudentChargeSheetInclusionLine, (i) => i.sheet, { cascade: true })
  inclusionLines: StudentChargeSheetInclusionLine[];

  /** Resolved list for API (custom lines or linked packages). */
  inclusions?: Array<{ id: string; code: string; label: string }>;
}
