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
import { SchoolPlatformSubscription } from './school-platform-subscription.entity';
import type {
  PlatformBillingPeriod,
  PlatformInvoiceStatus,
} from '../platform-billing.types';

@Entity('platform_invoices')
export class PlatformInvoice {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'int' })
  subscription_id: number;

  @Column({ type: 'varchar', length: 32 })
  billing_period: PlatformBillingPeriod;

  @Column({ name: 'period_start', type: 'date' })
  period_start: string;

  @Column({ name: 'period_end', type: 'date' })
  period_end: string;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  base_amount: string;

  @Column({ name: 'seats_included', type: 'int', default: 0 })
  seats_included: number;

  @Column({ name: 'seats_used', type: 'int', default: 0 })
  seats_used: number;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  overage_amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  addons_amount: string;

  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  total_amount: string;

  @Column({ type: 'varchar', length: 32, default: 'issued' })
  status: PlatformInvoiceStatus;

  @Column({ name: 'paid_at', type: 'timestamptz', nullable: true })
  paid_at: Date | null;

  @Column({ name: 'paid_note', type: 'text', nullable: true })
  paid_note: string | null;

  @Column({ name: 'line_items', type: 'jsonb', nullable: true })
  line_items: Record<string, unknown>[] | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => SchoolPlatformSubscription, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription: SchoolPlatformSubscription;
}
