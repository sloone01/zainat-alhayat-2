import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('signup_email_otps')
export class SignupEmailOtp {
  @PrimaryColumn({ type: 'varchar', length: 255 })
  email: string;

  @Column({ name: 'code_hash', type: 'varchar', length: 64 })
  code_hash: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expires_at: Date;

  @Column({ name: 'last_sent_at', type: 'timestamptz' })
  last_sent_at: Date;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ name: 'verification_token', type: 'varchar', length: 64, nullable: true })
  verification_token: string | null;

  @Column({ name: 'verification_expires_at', type: 'timestamptz', nullable: true })
  verification_expires_at: Date | null;
}
