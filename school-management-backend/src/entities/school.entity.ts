import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';
import { Staff } from './staff.entity';
import { Student } from './student.entity';
import { Group } from './group.entity';
import { Course } from './course.entity';
import { ClassSettings } from './class-settings.entity';
import { AcademicYear } from './academic-year.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 100, nullable: true })
  email: string;

  @Column({ length: 200, nullable: true })
  website: string;

  @Column({ length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'date', nullable: true })
  established_date: Date;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Room, room => room.school)
  rooms: Room[];

  @OneToMany(() => Staff, staff => staff.school)
  staff: Staff[];

  @OneToMany(() => Student, student => student.school)
  students: Student[];

  @OneToMany(() => Group, group => group.school)
  groups: Group[];

  @OneToMany(() => Course, course => course.school)
  courses: Course[];

  @OneToMany(() => ClassSettings, settings => settings.school)
  class_settings: ClassSettings[];

  @OneToMany(() => AcademicYear, academicYear => academicYear.school)
  academicYears: AcademicYear[];
}

