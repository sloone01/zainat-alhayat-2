import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { School } from './school.entity';

/** HTML shell for report downloads (Excel/PDF/Word). Body injects at `{{content}}`. */
@Entity('school_report_export_templates')
export class SchoolReportExportTemplate {
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

/** Per-school column + template choice for a catalog report key (e.g. `students`). */
@Entity('school_report_export_configs')
@Unique(['school_id', 'report_key'])
@Index(['school_id'])
export class SchoolReportExportConfig {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'report_key', type: 'varchar', length: 64 })
  report_key: string;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  columns: string[];

  @Column({ name: 'template_id', type: 'uuid', nullable: true })
  template_id: string | null;

  @ManyToOne(() => SchoolReportExportTemplate, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'template_id' })
  template: SchoolReportExportTemplate | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
