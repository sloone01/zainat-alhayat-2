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
import { LevelPaymentProfileDiscount } from './level-payment-profile-discount.entity';

@Entity('payment_discount_types')
export class PaymentDiscountType {
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

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => LevelPaymentProfileDiscount, (x) => x.discountType)
  profileLinks: LevelPaymentProfileDiscount[];
}
