import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { LevelPaymentProfile } from './level-payment-profile.entity';
import { PaymentDiscountType } from './payment-discount-type.entity';

@Entity('level_payment_profile_discounts')
export class LevelPaymentProfileDiscount {
  @PrimaryColumn('uuid', { name: 'profile_id' })
  profile_id: string;

  @PrimaryColumn('uuid', { name: 'discount_type_id' })
  discount_type_id: string;

  @ManyToOne(() => LevelPaymentProfile, (p) => p.discountLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'profile_id' })
  profile: LevelPaymentProfile;

  @ManyToOne(() => PaymentDiscountType, (d) => d.profileLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'discount_type_id' })
  discountType: PaymentDiscountType;
}
