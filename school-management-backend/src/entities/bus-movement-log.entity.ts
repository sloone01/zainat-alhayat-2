import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Bus } from './bus.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

@Entity('bus_movement_logs')
export class BusMovementLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'bus_id', type: 'uuid' })
  bus_id: string;

  @ManyToOne(() => Bus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bus_id' })
  bus: Bus;

  @Column({ name: 'student_id', type: 'uuid' })
  student_id: string;

  @ManyToOne(() => Student, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @Column({ name: 'event_type', type: 'varchar', length: 32 })
  event_type: 'boarded' | 'dropped_off';

  /** To school (join trip) vs home (return trip). */
  @Column({ name: 'trip_type', type: 'varchar', length: 16 })
  tripType: 'going' | 'return';

  /** Calendar day this movement belongs to (school bus day). */
  @Column({ name: 'trip_date', type: 'date' })
  tripDate: string;

  @CreateDateColumn({ name: 'logged_at', type: 'timestamptz' })
  logged_at: Date;

  @Column({ name: 'logged_by_user_id', type: 'uuid', nullable: true })
  logged_by_user_id: string | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'logged_by_user_id' })
  loggedBy: User | null;
}
