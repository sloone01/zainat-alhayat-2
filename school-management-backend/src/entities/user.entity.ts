import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Staff } from './staff.entity';
import { Parent } from './parent.entity';
import { Reminder } from './reminder.entity';
import { School } from './school.entity';
import { Schedule } from './schedule.entity';
import { WeeklySessionPlan } from './weekly-session-plan.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255, unique: true, nullable: true })
  username: string;

  @Column({ length: 255, unique: true })
  email: string;

  @Column({ length: 255 })
  password: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ 
    type: 'enum',
    enum: ['admin', 'teacher', 'student', 'parent'],
    default: 'student'
  })
  role: 'admin' | 'teacher' | 'student' | 'parent';

  @Column({ type: 'text', nullable: true })
  roles: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date;

  @ManyToOne(() => School, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ nullable: true })
  school_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Staff, staff => staff.user)
  staff: Staff[];

  @OneToMany(() => Parent, parent => parent.user)
  parents: Parent[];

  @OneToMany(() => Reminder, reminder => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => Schedule, schedule => schedule.teacher)
  schedules: Schedule[];

  @OneToMany(() => WeeklySessionPlan, weeklySessionPlan => weeklySessionPlan.createdBy)
  weeklySessionPlans: WeeklySessionPlan[];
}

