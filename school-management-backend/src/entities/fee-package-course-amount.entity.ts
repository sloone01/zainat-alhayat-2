import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { FeePackage } from './fee-package.entity';
import { Course } from './course.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('fee_package_course_amounts')
@Unique('UQ_fee_package_course_amounts', ['package_id', 'course_id', 'charge_type_id'])
export class FeePackageCourseAmount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'package_id', type: 'uuid' })
  package_id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @ManyToOne(() => FeePackage, (p) => p.courseAmounts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'package_id' })
  package: FeePackage;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
