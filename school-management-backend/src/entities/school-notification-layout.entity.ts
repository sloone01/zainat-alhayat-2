import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { School } from './school.entity';

/**
 * Reusable email shell for a school. Body content from notification templates
 * is injected where `{{content}}` appears.
 */
@Entity('school_notification_layouts')
export class SchoolNotificationLayout {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ type: 'varchar', length: 160 })
  name: string;

  @Column({ name: 'name_ar', type: 'varchar', length: 160, nullable: true })
  name_ar: string | null;

  /** English HTML shell; must include `{{content}}` for the template body. */
  @Column({ name: 'html_en', type: 'text' })
  html_en: string;

  /** Arabic HTML shell; falls back to `html_en` when null. */
  @Column({ name: 'html_ar', type: 'text', nullable: true })
  html_ar: string | null;

  @Column({ name: 'is_default', type: 'boolean', default: false })
  is_default: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
