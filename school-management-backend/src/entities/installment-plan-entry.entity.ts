import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { InstallmentPlan } from './installment-plan.entity';

@Entity('installment_plan_entries')
@Unique('UQ_installment_plan_entries_seq', ['plan_id', 'sequence'])
export class InstallmentPlanEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'plan_id', type: 'uuid' })
  plan_id: string;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'int', nullable: true })
  month_number: number | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  label: string | null;

  /** Relative share when splitting installment portion (default equal weights). */
  @Column({ type: 'decimal', precision: 8, scale: 4, default: 1 })
  weight: string;

  @ManyToOne(() => InstallmentPlan, (p) => p.entries, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: InstallmentPlan;
}
