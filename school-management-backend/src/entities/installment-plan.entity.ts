import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { InstallmentPlanEntry } from './installment-plan-entry.entity';

@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @Column({ type: 'varchar', length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** Fixed advance (مقدم) for presets; null uses the package timing ratio. */
  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  advance_amount: string | null;

  /** Saved from a charge sheet; listed on the presets page, not with installment plans. */
  @Column({ type: 'boolean', default: false })
  is_preset: boolean;

  /** Preset included items copied onto the sheet when the preset is applied. */
  @Column({ type: 'jsonb', nullable: true })
  inclusion_type_ids: string[] | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => InstallmentPlanEntry, (e) => e.plan, { cascade: true })
  entries: InstallmentPlanEntry[];
}
