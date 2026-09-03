import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { CourseFeeLink } from './course-fee-link.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('course_fee_link_lines')
@Unique('UQ_course_fee_link_lines', ['link_id', 'charge_type_id'])
export class CourseFeeLinkLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'link_id', type: 'uuid' })
  link_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: string;

  @ManyToOne(() => CourseFeeLink, (l) => l.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: CourseFeeLink;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
