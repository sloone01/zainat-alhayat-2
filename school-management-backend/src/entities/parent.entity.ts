import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Student } from './student.entity';

@Entity('parents')
export class Parent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ name: 'first_name_ar', type: 'varchar', length: 100, nullable: true })
  first_name_ar: string | null;

  @Column({ name: 'first_name_en', type: 'varchar', length: 100, nullable: true })
  first_name_en: string | null;

  @Column({ name: 'last_name_ar', type: 'varchar', length: 100, nullable: true })
  last_name_ar: string | null;

  @Column({ name: 'last_name_en', type: 'varchar', length: 100, nullable: true })
  last_name_en: string | null;

  @Column({ length: 255, nullable: true })
  email: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ name: 'civil_id', type: 'varchar', length: 20, nullable: true })
  civil_id: string | null;

  @Column({ type: 'text', nullable: true })
  address: string;

  /** Father / mother profile extras */
  @Column({ type: 'varchar', length: 100, nullable: true })
  tribe: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  workplace: string | null;

  @Column({ name: 'work_phone', type: 'varchar', length: 30, nullable: true })
  workPhone: string | null;

  @Column({ name: 'marital_status', type: 'varchar', length: 30, nullable: true })
  maritalStatus: string | null;

  /** Guardian (organization) profile extras */
  @Column({ name: 'organization_name', type: 'varchar', length: 255, nullable: true })
  organizationName: string | null;

  @Column({ name: 'responsible_person', type: 'varchar', length: 255, nullable: true })
  responsiblePerson: string | null;

  @Column({ name: 'responsible_phone', type: 'varchar', length: 30, nullable: true })
  responsiblePhone: string | null;

  @Column({ type: 'uuid', nullable: true })
  user_id: string;

  /**
   * Owning school. Parents used to be scoped only via their linked user account, which
   * left user-less parent records visible to (and editable by) every school.
   */
  @Column({ type: 'uuid', nullable: true })
  school_id: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, user => user.parents, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToMany(() => Student, student => student.parents)
  students: Student[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}

