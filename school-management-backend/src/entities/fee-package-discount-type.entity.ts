import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { PaymentDiscountType } from './payment-discount-type.entity';

@Entity('fee_package_discount_types')
@Unique('UQ_fee_package_discount_types', ['package_id', 'discount_type_id'])
export class FeePackageDiscountType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'discount_type_id', type: 'uuid' })
  discount_type_id: string;

  @ManyToOne(() => FeePackage, (p) => p.discountTypeLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => PaymentDiscountType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'discount_type_id' })
  discountType: PaymentDiscountType;
}
