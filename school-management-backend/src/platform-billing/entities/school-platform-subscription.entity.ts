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
import { School } from '../../entities/school.entity';
import { PlatformPlan } from './platform-plan.entity';
import { SchoolPlatformSubscriptionAddon } from './school-platform-subscription-addon.entity';
import type {
  PlatformBillingPeriod,
  PlatformSubscriptionStatus,
} from '../platform-billing.types';

@Entity('school_platform_subscriptions')
@Unique(['school_id'])
export class SchoolPlatformSubscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'int' })
  plan_id: number;

  @Column({ type: 'varchar', length: 32 })
  billing_period: PlatformBillingPeriod;

  @Column({ type: 'varchar', length: 32, default: 'draft' })
  status: PlatformSubscriptionStatus;

  @Column({ name: 'period_start', type: 'date' })
  period_start: string;

  @Column({ name: 'period_end', type: 'date' })
  period_end: string;

  @Column({
    name: 'included_student_seats_override',
    type: 'int',
    nullable: true,
  })
  included_student_seats_override: number | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => PlatformPlan, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;

  @OneToMany(() => SchoolPlatformSubscriptionAddon, (a) => a.subscription, {
    cascade: true,
  })
  addonLinks: SchoolPlatformSubscriptionAddon[];
}
