import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { SchoolPaymentLevel } from './school-payment-level.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

export type FeePackageLevelBillingPeriod = 'monthly' | 'semester' | 'yearly';

@Entity('fee_package_level_amounts')
@Unique('UQ_fee_package_level_amounts', ['package_id', 'level_id', 'charge_type_id', 'billing_period'])
export class FeePackageLevelAmount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'level_id', type: 'uuid' })
  level_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ name: 'billing_period', type: 'varchar', length: 16, default: 'yearly' })
  billing_period: FeePackageLevelBillingPeriod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @ManyToOne(() => FeePackage, (p) => p.levelAmounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => SchoolPaymentLevel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
