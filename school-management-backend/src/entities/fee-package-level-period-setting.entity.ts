import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { SchoolPaymentLevel } from './school-payment-level.entity';
import type { FeePackageLevelBillingPeriod } from './fee-package-level-amount.entity';

@Entity('fee_package_level_period_settings')
@Unique('UQ_fee_package_level_period_settings', ['package_id', 'level_id', 'billing_period'])
export class FeePackageLevelPeriodSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'level_id', type: 'uuid' })
  level_id: string;

  @Column({ name: 'billing_period', type: 'varchar', length: 16 })
  billing_period: FeePackageLevelBillingPeriod;

  @Column({ name: 'downpayment_amount', type: 'decimal', precision: 12, scale: 2, default: 0 })
  downpayment_amount: string;

  @Column({ name: 'installment_schedule_months', type: 'jsonb', nullable: true })
  installment_schedule_months: number[] | null;

  @ManyToOne(() => FeePackage, (p) => p.levelPeriodSettings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => SchoolPaymentLevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel;
}
