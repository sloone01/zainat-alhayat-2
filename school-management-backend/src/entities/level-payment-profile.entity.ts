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
import { SchoolPaymentLevel } from './school-payment-level.entity';
import { LevelPaymentChargeLine } from './level-payment-charge-line.entity';
import { LevelPaymentInstallment } from './level-payment-installment.entity';
import { LevelPaymentProfileDiscount } from './level-payment-profile-discount.entity';

export type LevelPricingModel = 'per_year';
export type YearPaymentMode = 'one_time' | 'installments' | 'both';

@Entity('level_payment_profiles')
export class LevelPaymentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'level_id', type: 'uuid' })
  level_id: string;

  @Column({ type: 'varchar', length: 32, default: 'per_year' })
  pricing_model: LevelPricingModel;

  @Column({ type: 'varchar', length: 32, nullable: true })
  year_payment_mode: YearPaymentMode | null;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  year_total_amount: string | null;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @Column({ name: 'fee_package_id', type: 'uuid', nullable: true })
  fee_package_id: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => SchoolPaymentLevel, (l) => l.paymentProfiles, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: SchoolPaymentLevel;

  @OneToMany(() => LevelPaymentChargeLine, (c) => c.profile, { cascade: true })
  chargeLines: LevelPaymentChargeLine[];

  @OneToMany(() => LevelPaymentInstallment, (i) => i.profile, { cascade: true })
  installments: LevelPaymentInstallment[];

  @OneToMany(() => LevelPaymentProfileDiscount, (d) => d.profile, { cascade: true })
  discountLinks: LevelPaymentProfileDiscount[];
}
