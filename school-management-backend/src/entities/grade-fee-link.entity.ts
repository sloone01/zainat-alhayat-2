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
import { School } from './school.entity';
import { SchoolPaymentLevel } from './school-payment-level.entity';
import { FeePackage } from './fee-package.entity';
import { GradeFeeLinkLine } from './grade-fee-link-line.entity';

@Entity('grade_fee_links')
@Unique('UQ_grade_fee_links_level', ['school_id', 'level_id'])
export class GradeFeeLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'level_id', type: 'uuid' })
  level_id: string;

  @Column({ name: 'fee_package_id', type: 'uuid' })
  fee_package_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => SchoolPaymentLevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel;

  @ManyToOne(() => FeePackage, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_package_id' })
  feePackage: FeePackage;

  @OneToMany(() => GradeFeeLinkLine, (l) => l.link, { cascade: true })
  lines: GradeFeeLinkLine[];
}
