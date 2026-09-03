import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { School } from './school.entity';
import { Course } from './course.entity';
import { FeePackage } from './fee-package.entity';
import { CourseFeeLinkLine } from './course-fee-link-line.entity';

@Entity('course_fee_links')
@Unique('UQ_course_fee_links_course', ['school_id', 'course_id'])
export class CourseFeeLink {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ name: 'fee_package_id', type: 'uuid' })
  fee_package_id: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => FeePackage, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'fee_package_id' })
  feePackage: FeePackage;

  @OneToMany(() => CourseFeeLinkLine, (l) => l.link, { cascade: true })
  lines: CourseFeeLinkLine[];
}
