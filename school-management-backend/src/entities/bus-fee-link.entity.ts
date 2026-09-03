import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { School } from './school.entity';
import { Bus } from './bus.entity';
import { FeePackage } from './fee-package.entity';
import { BusFeeLinkLine } from './bus-fee-link-line.entity';

@Entity('bus_fee_links')
@Unique('UQ_bus_fee_links_bus', ['school_id', 'bus_id'])
export class BusFeeLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'bus_id', type: 'uuid' })
  bus_id: string;

  @Column({ name: 'fee_package_id', type: 'uuid' })
  fee_package_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Bus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @ManyToOne(() => FeePackage, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_package_id' })
  feePackage: FeePackage;

  @OneToMany(() => BusFeeLinkLine, (l) => l.link, { cascade: true })
  lines: BusFeeLinkLine[];
}
