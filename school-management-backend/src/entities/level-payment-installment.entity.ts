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

@Entity('level_payment_installments')
export class LevelPaymentInstallment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'profile_id', type: 'uuid' })
  profile_id: string;

  @Column({ type: 'int' })
  sequence: number;

  @Column({ type: 'smallint', nullable: true })
  month_number: number | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  label: string | null;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => LevelPaymentProfile, (p) => p.installments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: LevelPaymentProfile;
}
