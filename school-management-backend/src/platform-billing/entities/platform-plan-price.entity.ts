import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PlatformPlan } from './platform-plan.entity';
import type { PlatformBillingPeriod } from '../platform-billing.types';

@Entity('platform_plan_prices')
@Unique(['plan_id', 'billing_period'])
export class PlatformPlanPrice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ type: 'varchar', length: 32 })
  billing_period: PlatformBillingPeriod;

  /** Minimum fee for the period: the package never bills below this. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  amount_omr: string;

  @Column({ name: 'per_student_omr', type: 'numeric', precision: 12, scale: 3, default: 0 })
  per_student_omr: string;

  @ManyToOne(() => PlatformPlan, (p) => p.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;
}
