import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { PaymentInclusionType } from './payment-inclusion-type.entity';

@Entity('fee_package_inclusion_types')
@Unique('UQ_fee_package_inclusion_types', ['package_id', 'inclusion_type_id'])
export class FeePackageInclusionType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'inclusion_type_id', type: 'uuid' })
  inclusion_type_id: string;

  @ManyToOne(() => FeePackage, (p) => p.inclusionTypeLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => PaymentInclusionType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'inclusion_type_id' })
  inclusionType: PaymentInclusionType;
}
