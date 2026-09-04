import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('fee_package_charge_types')
@Unique('UQ_fee_package_charge_types', ['package_id', 'charge_type_id'])
export class FeePackageChargeType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  /** upfront = due immediately; installment = spread on selected plan */
  @Column({ type: 'varchar', length: 16, default: 'installment' })
  payment_timing: 'upfront' | 'installment';

  /** per_year = each academic year; once_only = lifetime (skip if already paid) */
  @Column({ type: 'varchar', length: 16, default: 'per_year' })
  billing_frequency: 'per_year' | 'once_only';

  @ManyToOne(() => FeePackage, (p) => p.chargeTypeLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
