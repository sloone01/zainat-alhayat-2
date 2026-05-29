import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { Group } from './group.entity';
import { User } from './user.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  activity_date: Date;

  @Column({ type: 'time', nullable: true })
  start_time?: string;

  @Column({ type: 'time', nullable: true })
  end_time?: string;

  @Column({ length: 200, nullable: true })
  location?: string;

  @Column({ type: 'varchar' })
  activity_type: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'uuid', nullable: true })
  group_id?: string;

  @Column({ type: 'uuid', nullable: true })
  created_by?: string;

  @Column({ name: 'requires_parent_approval', type: 'boolean', default: false })
  requires_parent_approval: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => School, { nullable: false })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group?: Group;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdByUser?: User;
}

