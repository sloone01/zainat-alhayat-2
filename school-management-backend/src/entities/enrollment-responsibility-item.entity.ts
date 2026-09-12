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

export type EnrollmentResponsibilityParty = 'school' | 'parent';

@Entity('enrollment_responsibility_items')
@Index('IDX_enrollment_resp_school_party', ['school_id', 'party', 'is_active'])
export class EnrollmentResponsibilityItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  school_id: string;

  /** School obligations vs guardian/parent obligations. */
  @Column({ type: 'varchar', length: 16 })
  party: EnrollmentResponsibilityParty;

  @Column({ type: 'text' })
  text_ar: string;

  @Column({ type: 'text' })
  text_en: string;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;
}
