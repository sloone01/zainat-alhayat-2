import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  ManyToMany,
  JoinColumn,
} from 'typeorm';
import { School } from './school.entity';
import { Student } from './student.entity';
import { User } from './user.entity';

@Entity('buses')
export class Bus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ name: 'driver_name', length: 255 })
  driverName: string;

  @Column({ type: 'int', default: 40 })
  capacity: number;

  /** Driver phone / mobile (copied from staff user when assigned). */
  @Column({ name: 'driver_contacts', type: 'text', nullable: true })
  driverContacts: string | null;

  /** School staff user who drives this bus (may log in to the app). */
  @Column({ name: 'driver_user_id', type: 'uuid', nullable: true })
  driver_user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'driver_user_id' })
  driverUser?: User | null;

  /** Optional school staff supervisor for this bus route. */
  @Column({ name: 'supervisor_user_id', type: 'uuid', nullable: true })
  supervisor_user_id: string | null;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'supervisor_user_id' })
  supervisor?: User | null;

  @Column({ name: 'school_id', type: 'uuid' })
  school_id: string;

  @ManyToOne(() => School, (school) => school.buses, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  is_active: boolean;

  @ManyToMany(() => Student, (student) => student.buses)
  students: Student[];

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;
}
