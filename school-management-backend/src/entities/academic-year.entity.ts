import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { School } from './school.entity';
import { Course } from './course.entity';
import { Group } from './group.entity';
import { Semester } from './semester.entity';

@Entity('academic_years')
export class AcademicYear {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 20 })
  year: string; // e.g., "2024-2025"

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date' })
  end_date: Date;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @Column({ type: 'int', nullable: true })
  school_id: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updated_at: Date;

  // Relations
  @ManyToOne(() => School, school => school.academicYears)
  @JoinColumn({ name: 'school_id' })
  school: School;

  @OneToMany(() => Course, course => course.academicYear)
  courses: Course[];

  @OneToMany(() => Group, group => group.academicYear)
  groups: Group[];

  @OneToMany(() => Semester, semester => semester.academicYear)
  semesters: Semester[];
}