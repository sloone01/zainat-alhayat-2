import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { PaymentExtraType } from './payment-extra-type.entity';

@Entity('fee_package_extra_types')
@Unique('UQ_fee_package_extra_types', ['package_id', 'extra_type_id'])
export class FeePackageExtraType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'extra_type_id', type: 'uuid' })
  extra_type_id: string;

  @ManyToOne(() => FeePackage, (p) => p.extraTypeLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => PaymentExtraType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'extra_type_id' })
  extraType: PaymentExtraType;
}
