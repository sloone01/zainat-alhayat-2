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
import { Course } from './course.entity';
import { School } from './school.entity';
import { CoursePaymentChargeLine } from './course-payment-charge-line.entity';

/** How this course fee is keyed for reporting / future enrollment (not stored on `courses` yet). */
export type CoursePricingBasis = 'grade' | 'phase';

@Entity('course_payment_profiles')
@Unique('UQ_course_payment_profiles_school_course', ['school_id', 'course_id'])
export class CoursePaymentProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ type: 'varchar', length: 16 })
  course_pricing_basis: CoursePricingBasis;

  @Column({ type: 'varchar', length: 3, default: 'OMR' })
  currency: string;

  @Column({ name: 'fee_package_id', type: 'uuid', nullable: true })
  fee_package_id: string | null;

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

  @OneToMany(() => CoursePaymentChargeLine, (c) => c.profile, { cascade: true })
  chargeLines: CoursePaymentChargeLine[];
}
