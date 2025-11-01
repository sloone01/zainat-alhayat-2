import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Student } from './student.entity';

@Entity('activities')
export class Activity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  student_id: number;

  @Column({ length: 50 })
  type: string;

  @Column('jsonb')
  data: any;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => Student, student => student.activities)
  @JoinColumn({ name: 'student_id' })
  student: Student;
}

