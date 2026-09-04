import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { School } from '../../entities/school.entity';
import { PlatformModule } from './platform-module.entity';

export type SchoolModuleSource = 'plan' | 'addon' | 'manual';

@Entity('school_modules')
@Unique(['school_id', 'module_id'])
export class SchoolModule {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ type: 'int' })
  school_id: number;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ type: 'int' })
  module_id: number;

  @ManyToOne(() => PlatformModule, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'module_id' })
  module: PlatformModule;

  @Column({ type: 'varchar', length: 16, default: 'plan' })
  source: SchoolModuleSource;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
