import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { School } from './school.entity';

export type LandingFeatureItem = {
  title_en: string;
  title_ar: string;
  body_en: string;
  body_ar: string;
  icon?: string;
};

export type LandingTestimonialItem = {
  quote_en: string;
  quote_ar: string;
  author_en: string;
  author_ar: string;
  role_en: string;
  role_ar: string;
};

@Entity('school_landing_pages')
@Unique(['school_id'])
export class SchoolLandingPage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int' })
  school_id: number;

  @Column({ type: 'text', nullable: true })
  logo_url: string | null;

  @Column({ type: 'text', nullable: true })
  hero_image_url: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  brand_name_en: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  brand_name_ar: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  badge_en: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  badge_ar: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  hero_title_en: string | null;

  @Column({ type: 'varchar', length: 300, nullable: true })
  hero_title_ar: string | null;

  @Column({ type: 'text', nullable: true })
  hero_subtitle_en: string | null;

  @Column({ type: 'text', nullable: true })
  hero_subtitle_ar: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cta_primary_en: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cta_primary_ar: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cta_secondary_en: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  cta_secondary_ar: string | null;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  features: LandingFeatureItem[];

  @Column({ type: 'jsonb', default: () => "'[]'" })
  testimonials: LandingTestimonialItem[];

  @Column({ type: 'varchar', length: 40, nullable: true })
  phone: string | null;

  @Column({ type: 'varchar', length: 120, nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  address_en: string | null;

  @Column({ type: 'text', nullable: true })
  address_ar: string | null;

  @Column({ type: 'boolean', default: false })
  is_published: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @ManyToOne(() => School, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'school_id' })
  school: School;
}
