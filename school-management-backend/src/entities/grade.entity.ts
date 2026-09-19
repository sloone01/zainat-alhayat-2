import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { School } from './school.entity';

@Entity('grades')
@Index('IDX_grades_school_id', ['school_id'])
export class Grade {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @Column({ type: 'varchar', length: 100 })
  nameAr: string;

  @Column({ type: 'varchar', length: 50 })
  code: string;

  @Column({ type: 'int' })
  displayOrder: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
