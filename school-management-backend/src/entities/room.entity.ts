import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { School } from './school.entity';
import { Student } from './student.entity';
import { Schedule } from './schedule.entity';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'int' })
  capacity: number;

  @Column({ type: 'varchar' })
  room_type: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  equipment: string;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'int' })
  school_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => School, school => school.rooms)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => Student, student => student.room)
  students: Student[];

  @OneToMany(() => Schedule, schedule => schedule.room)
  schedules: Schedule[];
}

