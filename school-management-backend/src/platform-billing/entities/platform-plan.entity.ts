import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlatformPlanPrice } from './platform-plan-price.entity';
import { PlatformPlanFeature } from './platform-plan-feature.entity';

@Entity('platform_plans')
export class PlatformPlan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ name: 'name_en', type: 'varchar', length: 120 })
  name_en: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 120 })
  name_ar: string;

  @Column({ name: 'description_en', type: 'text', nullable: true })
  description_en: string | null;

  @Column({ name: 'description_ar', type: 'text', nullable: true })
  description_ar: string | null;

  /** School-size band this package is sold for (active students). */
  @Column({ name: 'min_students', type: 'int', default: 0 })
  min_students: number;

  /** Null = no upper limit. */
  @Column({ name: 'max_students', type: 'int', nullable: true })
  max_students: number | null;

  @Column({ name: 'sort_order', type: 'int', default: 0 })
  sort_order: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToMany(() => PlatformPlanPrice, (p) => p.plan, { cascade: true })
  prices: PlatformPlanPrice[];

  @OneToMany(() => PlatformPlanFeature, (f) => f.plan, { cascade: true })
  features: PlatformPlanFeature[];
}
