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
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  plan_id: number;

  @Column({ type: 'varchar', length: 32 })
  billing_period: PlatformBillingPeriod;

  @Column({ type: 'numeric', precision: 12, scale: 3 })
  amount_omr: string;

  @ManyToOne(() => PlatformPlan, (p) => p.prices, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;
}
