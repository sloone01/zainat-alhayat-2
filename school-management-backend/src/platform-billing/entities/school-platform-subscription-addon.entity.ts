import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SchoolPlatformSubscription } from './school-platform-subscription.entity';
import { PlatformAddon } from './platform-addon.entity';

@Entity('school_platform_subscription_addons')
@Unique(['subscription_id', 'addon_id'])
export class SchoolPlatformSubscriptionAddon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  subscription_id: number;

  @Column({ type: 'int' })
  addon_id: number;

  @ManyToOne(() => SchoolPlatformSubscription, (s) => s.addonLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: SchoolPlatformSubscription;

  @ManyToOne(() => PlatformAddon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addon_id' })
  addon: PlatformAddon;
}
