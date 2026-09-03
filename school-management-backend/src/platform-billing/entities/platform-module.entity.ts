import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { PlatformPlanModule } from './platform-plan-module.entity';

@Entity('platform_modules')
export class PlatformModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 120 })
  name_en: string;

  @Column({ type: 'varchar', length: 120 })
  name_ar: string;

  @Column({ type: 'text', nullable: true })
  description_en: string | null;

  @Column({ type: 'text', nullable: true })
  description_ar: string | null;

  /** Single module value (OMR). Plan billing periods are priced on the plan itself. */
  @Column({ type: 'numeric', precision: 12, scale: 3, default: 0 })
  amount_omr: string;

  /** RBAC page keys this module maps to (for later page gating). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  page_keys: string[];

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @OneToMany(() => PlatformPlanModule, (pm) => pm.module)
  planLinks: PlatformPlanModule[];

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
