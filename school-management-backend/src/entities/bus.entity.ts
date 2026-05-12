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

  @Column({ name: 'driver_contacts', type: 'text', nullable: true })
  driverContacts: string | null;

  @Column({ name: 'school_id', type: 'int' })
  school_id: number;

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
