import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { GradedCriterion } from './graded-criterion.entity';
import { User } from './user.entity';
import { Group } from './group.entity';
import { Course } from './course.entity';
import { GradedCriterionTaskStudentMark } from './graded-criterion-task-student-mark.entity';

@Entity('graded_criterion_teacher_tasks')
export class GradedCriterionTeacherTask {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'graded_criterion_id' })
  graded_criterion_id: string;

  @Column({ name: 'teacher_id', type: 'uuid' })
  teacher_id: string;

  @Column({ name: 'group_id', type: 'uuid' })
  group_id: string;

  @Column({ name: 'course_id', type: 'uuid' })
  course_id: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'date', nullable: true })
  due_date: Date | null;

  @Column({ type: 'int', default: 0 })
  sort_order: number;

  /** Auto row when teacher has not defined a breakdown yet */
  @Column({ name: 'is_system_default', type: 'boolean', default: false })
  is_system_default: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => GradedCriterion, (c) => c.teacher_tasks, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'graded_criterion_id' })
  gradedCriterion: GradedCriterion;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Course, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @OneToMany(() => GradedCriterionTaskStudentMark, (m) => m.task)
  student_marks: GradedCriterionTaskStudentMark[];
}
