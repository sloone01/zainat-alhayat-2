import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type CustomPlanRequestStatus = 'new' | 'contacted' | 'closed';
export type CustomPlanRequestScope = 'small' | 'mid' | 'large';

@Entity('platform_custom_plan_requests')
export class PlatformCustomPlanRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 200 })
  school_name: string;

  @Column({ type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'varchar', length: 30 })
  phone: string;

  @Column({ type: 'varchar', length: 16 })
  scope: CustomPlanRequestScope;

  @Column({ type: 'varchar', length: 8, default: 'ar' })
  locale: string;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  /** Selected platform module codes (optional). */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  module_codes: string[];

  /** Snapshot of module labels at submit time. */
  @Column({ type: 'jsonb', default: () => "'[]'" })
  module_labels: Array<{ code: string; name_en: string; name_ar: string }>;

  @Column({ type: 'varchar', length: 16, default: 'new' })
  status: CustomPlanRequestStatus;

  @Column({ type: 'text', nullable: true })
  admin_notes: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
