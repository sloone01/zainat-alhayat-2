import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { PlatformPlan } from './platform-plan.entity';
import { PlatformModule } from './platform-module.entity';

@Entity('platform_plan_modules')
@Unique(['plan_id', 'module_id'])
export class PlatformPlanModule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  plan_id: string;

  @Column({ type: 'uuid' })
  module_id: string;

  @ManyToOne(() => PlatformPlan, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan: PlatformPlan;

  @ManyToOne(() => PlatformModule, (m) => m.planLinks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: PlatformModule;
}
