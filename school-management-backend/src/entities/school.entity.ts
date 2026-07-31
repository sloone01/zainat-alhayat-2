import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Room } from './room.entity';
import { Staff } from './staff.entity';
import { Student } from './student.entity';
import { Group } from './group.entity';
import { Bus } from './bus.entity';
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

  /** Commercial registration (CR) document — set during self-service school signup. */
  @Column({ name: 'cr_document_url', type: 'text', nullable: true })
  cr_document_url: string | null;

  /** Owner / authorised signatory ID card copy — set during self-service school signup. */
  @Column({ name: 'owner_id_document_url', type: 'text', nullable: true })
  owner_id_document_url: string | null;

  /** Legal name on CR / authorised signatory (snapshot at signup). */
  @Column({ name: 'owner_legal_name', type: 'varchar', length: 255, nullable: true })
  owner_legal_name: string | null;

  @Column({
    name: 'payment_allow_admin_adjust_student_total',
    type: 'boolean',
    default: false,
  })
  payment_allow_admin_adjust_student_total: boolean;

  /** pending | active | suspended | rejected */
  @Column({ type: 'varchar', length: 32, default: 'active' })
  status: 'pending' | 'active' | 'suspended' | 'rejected';

  /** Public landing path slug: /s/:landing_slug (optional). */
  @Column({ type: 'varchar', length: 80, nullable: true, unique: true })
  landing_slug: string | null;

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

  @OneToMany(() => Bus, bus => bus.school)
  buses: Bus[];

  @OneToMany(() => Course, course => course.school)
  courses: Course[];

  @OneToMany(() => ClassSettings, settings => settings.school)
  class_settings: ClassSettings[];

  @OneToMany(() => AcademicYear, academicYear => academicYear.school)
  academicYears: AcademicYear[];
}

