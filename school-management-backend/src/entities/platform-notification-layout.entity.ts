import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Product-wide email shells. Copied into a school when it has no layouts yet.
 * Body content injects at `{{content}}`.
 */
@Entity('platform_notification_layouts')
export class PlatformNotificationLayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 160, nullable: true })
  name_ar: string | null;

  @Column({ name: 'html_en', type: 'text' })
  html_en: string;

  @Column({ name: 'html_ar', type: 'text', nullable: true })
  html_ar: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
