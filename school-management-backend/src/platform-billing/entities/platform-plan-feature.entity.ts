import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PlatformPlan } from './platform-plan.entity';

@Entity('platform_plan_features')
@Unique(['plan_id', 'feature_key'])
export class PlatformPlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ name: 'feature_key', type: 'varchar', length: 64 })
  feature_key: string;

  @ManyToOne(() => PlatformPlan, (p) => p.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;
}
