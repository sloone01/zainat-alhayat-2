import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './school.entity';

@Entity('class_settings')
export class ClassSettings {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  setting_type: string; // duration, start_time, break_time

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'int', nullable: true })
  duration_minutes: number;

  @Column({ type: 'time', nullable: true })
  time_value: string;

  @Column({ type: 'boolean', default: false })
  is_default: boolean;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int' })
  order_index: number;

  @Column({ type: 'json', nullable: true })
  additional_settings: any; // For flexible settings storage

  @Column({ type: 'int' })
  school_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => School, school => school.class_settings)
  @JoinColumn({ name: 'school_id' })
  school: School;
}

