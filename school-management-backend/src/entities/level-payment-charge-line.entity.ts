import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { LevelPaymentProfile } from './level-payment-profile.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

export type LevelChargeBillingPeriod = 'monthly' | 'semester' | 'yearly';

@Entity('level_payment_charge_lines')
export class LevelPaymentChargeLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  profile_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ name: 'billing_period', type: 'varchar', length: 16, default: 'yearly' })
  billing_period: LevelChargeBillingPeriod;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => LevelPaymentProfile, (p) => p.chargeLines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: LevelPaymentProfile;

  @ManyToOne(() => PaymentChargeType, (t) => t.chargeLines, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
