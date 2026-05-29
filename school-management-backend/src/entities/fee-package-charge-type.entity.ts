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

  @ManyToOne(() => FeePackage, (p) => p.chargeTypeLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
