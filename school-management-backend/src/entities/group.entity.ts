import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinColumn } from 'typeorm';
import { School } from './school.entity';
import { Staff } from './staff.entity';
import { Student } from './student.entity';
import { Schedule } from './schedule.entity';
import { Attendance } from './attendance.entity';
import { AcademicYear } from './academic-year.entity';

@Entity('groups')
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'int', nullable: true })
  age_range_min: number;

  @Column({ type: 'int', nullable: true })
  age_range_max: number;

  @Column({ type: 'int', default: 20 })
  capacity: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  // Frontend compatibility fields
  @Column({ length: 50, nullable: true })
  color: string; // Group color

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'full'],
    default: 'active'
  })
  status: string; // Group status

  @Column({ type: 'int', default: 0 })
  studentCount: number; // Current number of students

  @Column({ type: 'int', default: 0 })
  teacherCount: number; // Number of assigned teachers

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'int', nullable: true })
  room_id: number;

  @Column({ name: 'academic_year_id', nullable: true })
  academic_year_id: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Relations
  @ManyToOne(() => School, school => school.groups)
  @JoinColumn({ name: 'school_id' })
  school: School;



  @ManyToMany(() => Student, student => student.groups)
  students: Student[];

  @OneToMany(() => Schedule, schedule => schedule.group)
  schedules: Schedule[];

  @OneToMany(() => Attendance, attendance => attendance.group)
  attendances: Attendance[];

  @ManyToOne(() => AcademicYear, academicYear => academicYear.groups)
  @JoinColumn({ name: 'academic_year_id' })
  academicYear: AcademicYear;
}

