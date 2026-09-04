import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { LevelPaymentChargeLine } from './level-payment-charge-line.entity';
import type { PaymentChargeBillingOccurrence } from '../constants/payment-charge-billing-occurrence';

@Entity('payment_charge_types')
export class PaymentChargeType {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'varchar', length: 64 })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  value: string | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  /** per_year = each academic year; once_ever = one-time lifetime; other = TBD */
  @Column({ type: 'varchar', length: 32, default: 'per_year' })
  billing_occurrence: PaymentChargeBillingOccurrence;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => LevelPaymentChargeLine, (l) => l.chargeType)
  chargeLines: LevelPaymentChargeLine[];
}
