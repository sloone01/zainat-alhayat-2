import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinColumn, JoinTable } from 'typeorm';
import { User } from './user.entity';
import { School } from './school.entity';
import { Group } from './group.entity';
import { Parent } from './parent.entity';
import { Activity } from './activity.entity';
import { Attendance } from './attendance.entity';
import { StudentProgress } from './student-progress.entity';
import { Room } from './room.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ type: 'date' })
  dateOfBirth: Date;

  @Column({ 
    type: 'enum',
    enum: ['male', 'female'],
  })
  gender: 'male' | 'female';

  @Column({ type: 'text' })
  address: string;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ length: 255 })
  emergencyContact: string;

  @Column({ type: 'text', nullable: true })
  medicalInfo: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Additional fields expected by frontend
  @Column({ length: 100, nullable: true })
  secondName: string;

  @Column({ length: 100, nullable: true })
  thirdName: string;

  @Column({ length: 100, nullable: true })
  nationality: string;

  @Column({ length: 50, nullable: true })
  studentId: string; // Student ID number

  @Column({ type: 'text', nullable: true })
  photo: string; // Photo URL or base64

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  user_id: string;

  @ManyToOne(() => School, school => school.students, { nullable: true })
  @JoinColumn({ name: 'school_id' })
  school: School;

  @Column({ nullable: true })
  school_id: number;

  @ManyToOne(() => Room, room => room.students, { nullable: true })
  @JoinColumn({ name: 'room_id' })
  room: Room;

  @Column({ nullable: true })
  room_id: number;

  @ManyToMany(() => Group, group => group.students)
  @JoinTable({
    name: 'student_groups',
    joinColumn: { name: 'student_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'group_id', referencedColumnName: 'id' }
  })
  groups: Group[];

  @ManyToMany(() => Parent, parent => parent.students)
  @JoinTable({
    name: 'student_parents',
    joinColumn: { name: 'student_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'parent_id', referencedColumnName: 'id' }
  })
  parents: Parent[];

  @OneToMany(() => Activity, activity => activity.student)
  activities: Activity[];

  @OneToMany(() => Attendance, attendance => attendance.student)
  attendances: Attendance[];

  @OneToMany(() => StudentProgress, progress => progress.student)
  progress: StudentProgress[];

  // Legacy fields for backward compatibility
  @Column({ length: 100, nullable: true })
  first_name: string;

  @Column({ length: 100, nullable: true })
  family_name: string;

  @Column({ type: 'date', nullable: true })
  date_of_birth: Date;

  @Column({ length: 255, nullable: true })
  medical_conditions: string;

  @Column({ length: 255, nullable: true })
  allergies: string;

  @Column({ length: 255, nullable: true })
  emergency_contact: string;

  @Column({ type: 'int', nullable: true })
  group_id: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

