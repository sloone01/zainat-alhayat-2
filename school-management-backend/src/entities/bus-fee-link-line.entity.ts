import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { BusFeeLink } from './bus-fee-link.entity';
import { PaymentChargeType } from './payment-charge-type.entity';

@Entity('bus_fee_link_lines')
@Unique('UQ_bus_fee_link_lines', ['link_id', 'charge_type_id'])
export class BusFeeLinkLine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'link_id', type: 'uuid' })
  link_id: string;

  @Column({ name: 'charge_type_id', type: 'uuid' })
  charge_type_id: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  amount: string;

  @ManyToOne(() => BusFeeLink, (l) => l.lines, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'link_id' })
  link: BusFeeLink;

  @ManyToOne(() => PaymentChargeType, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'charge_type_id' })
  chargeType: PaymentChargeType;
}
