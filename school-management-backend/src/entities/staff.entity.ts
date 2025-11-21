import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { School } from './school.entity';
import { Group } from './group.entity';
import { Schedule } from './schedule.entity';
import { StudentProgress } from './student-progress.entity';
import { Attendance } from './attendance.entity';

@Entity('staff')
export class Staff {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column()
  school_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => User, user => user.staff)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => School, school => school.staff)
  @JoinColumn({ name: 'school_id' })
  school: School;

  // Groups relationship removed as Group entity doesn't have supervisor field
  // @OneToMany(() => Group, group => group.supervisor)
  // supervised_groups: Group[];

  @OneToMany(() => Schedule, schedule => schedule.teacher)
  schedules: Schedule[];

  @OneToMany(() => StudentProgress, progress => progress.updater)
  updated_progress: StudentProgress[];

  @OneToMany(() => Attendance, attendance => attendance.recorder)
  recorded_attendances: Attendance[];
}

