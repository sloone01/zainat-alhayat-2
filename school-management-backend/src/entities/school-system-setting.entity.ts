import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { School } from './school.entity';

@Entity('school_system_settings')
@Unique(['school_id', 'setting_key'])
@Index(['school_id', 'category'])
export class SchoolSystemSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'int' })
  school_id: number;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'setting_key', type: 'varchar', length: 200 })
  setting_key: string;

  /** Stored as JSON (boolean, number, string, or structured object). */
  @Column({ name: 'value_json', type: 'jsonb' })
  value_json: unknown;

  @Column({ type: 'varchar', length: 20, default: 'string' })
  type: 'string' | 'boolean' | 'number' | 'json';

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 255, default: '' })
  title: string;

  @Column({ type: 'text', default: '' })
  description: string;

  @Column({ name: 'is_public', type: 'boolean', default: false })
  is_public: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;
}
