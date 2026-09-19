import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/** One approaching-push per student per bus trip day (going/return). */
@Entity('bus_arrival_eta_alerts')
@Index('uq_bus_arrival_eta_alert', ['bus_id', 'student_id', 'trip_date', 'trip_type'], {
  unique: true,
})
export class BusArrivalEtaAlert {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bus_id: string;

  @Column({ type: 'uuid' })
  student_id: string;

  @Column({ type: 'date' })
  trip_date: string;

  @Column({ type: 'varchar', length: 16 })
  trip_type: 'going' | 'return';

  @Column({ type: 'int' })
  eta_minutes: number;

  @CreateDateColumn({ type: 'timestamptz' })
  sent_at: Date;
}
