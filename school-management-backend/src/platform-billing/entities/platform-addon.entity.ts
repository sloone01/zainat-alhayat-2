import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('platform_addons')
export class PlatformAddon {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  code: string;

  @Column({ name: 'name_en', type: 'varchar', length: 120 })
  name_en: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 120 })
  name_ar: string;

  /** Flat add-on amount applied once per invoice period. */
  @Column({ type: 'numeric', precision: 12, scale: 3 })
  amount_omr: string;

  @Column({ name: 'feature_key', type: 'varchar', length: 64, nullable: true })
  feature_key: string | null;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
