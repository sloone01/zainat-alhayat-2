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

  @Column({ name: 'feature_key', type: 'varchar', length: 120 })
  feature_key: string;

  @Column({ name: 'label_en', type: 'varchar', length: 200, nullable: true })
  label_en: string | null;

  @Column({ name: 'label_ar', type: 'varchar', length: 200, nullable: true })
  label_ar: string | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order: number;

  @ManyToOne(() => PlatformPlan, (p) => p.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;
}
