import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../entities/school.entity';
import { PlatformPlan } from './platform-plan.entity';
import type {
  PlatformBillingPeriod,
  PlatformDiscountKind,
  PlatformDiscountType,
} from '../platform-billing.types';

@Entity('platform_discounts')
export class PlatformDiscount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 16 })
  kind: PlatformDiscountKind;

  @Column({ name: 'name_en', type: 'varchar', length: 120 })
  name_en: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 120 })
  name_ar: string;

  /** Promo code (kind = promo); matched case-insensitively. */
  @Column({ type: 'varchar', length: 64, nullable: true })
  code: string | null;

  @Column({ name: 'discount_type', type: 'varchar', length: 16 })
  discount_type: PlatformDiscountType;

  /** Percent (0–100) or OMR amount, depending on discount_type. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  value: string;

  /** Null = every plan. */
  @Column({ name: 'plan_id', type: 'uuid', nullable: true })
  plan_id: string | null;

  @Column({ name: 'school_id', type: 'uuid', nullable: true })
  school_id: string | null;

  /** Empty = every billing period. */
  @Column({ name: 'billing_periods', type: 'text', array: true, default: () => "'{}'" })
  billing_periods: PlatformBillingPeriod[];

  @Column({ name: 'starts_on', type: 'date', nullable: true })
  starts_on: string | null;

  @Column({ name: 'ends_on', type: 'date', nullable: true })
  ends_on: string | null;

  /** Subscription periods per school the discount covers; null = every period. */
  @Column({ name: 'duration_periods', type: 'int', nullable: true })
  duration_periods: number | null;

  @Column({ name: 'max_redemptions', type: 'int', nullable: true })
  max_redemptions: number | null;

  @Column({ name: 'redemption_count', type: 'int', default: 0 })
  redemption_count: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => PlatformPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan | null;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School | null;
}
