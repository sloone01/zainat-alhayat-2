import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Group } from './group.entity';
import { Course } from './course.entity';
import { User } from './user.entity';
import { Room } from './room.entity';
import { WeeklySessionPlan } from './weekly-session-plan.entity';

@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  day_of_week: string; // sunday, monday, tuesday, etc.

  @Column({ type: 'time' })
  start_time: string;

  @Column({ type: 'time' })
  end_time: string;

  @Column({ type: 'int' })
  duration_minutes: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: true })
  is_recurring: boolean;

  @Column({ type: 'date', nullable: true })
  specific_date: Date;

  @Column({ length: 50, default: 'active' })
  status: string; // active, cancelled, completed

  @Column({ nullable: true })
  group_id: string;

  @Column({ nullable: true })
  course_id: string;

  @Column({ type: 'uuid', nullable: true })
  teacher_id: string;

  @Column({ type: 'int', nullable: true })
  room_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Group, group => group.schedules)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Course, course => course.schedules)
  @JoinColumn({ name: 'course_id' })
  course: Course;

  @ManyToOne(() => User, user => user.schedules)
  @JoinColumn({ name: 'teacher_id' })
  teacher: User;

  @ManyToOne(() => Room, room => room.schedules)
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @OneToMany(() => WeeklySessionPlan, weeklySessionPlan => weeklySessionPlan.schedule)
  weeklySessionPlans: WeeklySessionPlan[];
}

