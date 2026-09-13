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
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  subscription_id: string;

  @Column({ type: 'uuid' })
  addon_id: string;

  @ManyToOne(() => SchoolPlatformSubscription, (s) => s.addonLinks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'subscription_id' })
  subscription: SchoolPlatformSubscription;

  @ManyToOne(() => PlatformAddon, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'addon_id' })
  addon: PlatformAddon;
}
