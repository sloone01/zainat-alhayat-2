import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CoursePaymentProfile } from './course-payment-profile.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('course_payment_charge_lines')
export class CoursePaymentChargeLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  profile_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => CoursePaymentProfile, (p) => p.chargeLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: CoursePaymentProfile;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
