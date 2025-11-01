import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';
import { Group } from './group.entity';
import { Staff } from './staff.entity';

@Entity('attendances')
export class Attendance {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'date' })
  attendance_date: Date;

  @Column({ length: 20, default: 'present' })
  status: string; // present, absent, late, excused

  @Column({ type: 'time', nullable: true })
  check_in_time: string;

  @Column({ type: 'time', nullable: true })
  check_out_time: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  reason: string;

  @Column({ type: 'boolean', default: false })
  is_excused: boolean;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'uuid' })
  group_id: string;

  @Column({ type: 'int', nullable: true })
  recorded_by: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => Student, student => student.attendances)
  @JoinColumn({ name: 'student_id' })
  student: Student;

  @ManyToOne(() => Group, group => group.attendances)
  @JoinColumn({ name: 'group_id' })
  group: Group;

  @ManyToOne(() => Staff, staff => staff.recorded_attendances)
  @JoinColumn({ name: 'recorded_by' })
  recorder: Staff;
}

