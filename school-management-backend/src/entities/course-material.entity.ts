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
import { Course } from './course.entity';
import { User } from './user.entity';
import { School } from './school.entity';
import { Phase } from './phase.entity';
import { CourseMaterialTopic } from './course-material-topic.entity';

@Entity('course_materials')
@Index(['course_id'])
@Index(['school_id'])
export class CourseMaterial {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  /** Original client filename */
  @Column({ name: 'original_filename', type: 'varchar', length: 500 })
  original_filename: string;

  /** Stored filename on disk (under uploads/course-materials) */
  @Column({ name: 'stored_filename', type: 'varchar', length: 500 })
  stored_filename: string;

  @Column({ name: 'mime_type', type: 'varchar', length: 150 })
  mime_type: string;

  @Column({ name: 'file_size', type: 'int' })
  file_size: number;

  @Column({ name: 'file_ext', type: 'varchar', length: 20 })
  file_ext: string;

  @Column({ name: 'uploaded_by_user_id', type: 'uuid', nullable: true })
  uploaded_by_user_id: string | null;

  @Column({ name: 'is_visible', type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ name: 'phase_id', type: 'uuid', nullable: true })
  phase_id: string | null;

  @Column({ name: 'topic_id', type: 'uuid', nullable: true })
  topic_id: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'uploaded_by_user_id' })
  uploadedBy: User;

  @ManyToOne(() => Phase, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'phase_id' })
  phase: Phase | null;

  @ManyToOne(() => CourseMaterialTopic, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'topic_id' })
  topic: CourseMaterialTopic | null;
}
