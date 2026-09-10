import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolLandingPage } from '../entities/school-landing-page.entity';
import { School } from '../entities/school.entity';
import { SchoolSystemSetting } from '../entities/school-system-setting.entity';
import { User } from '../entities/user.entity';
import { UpsertSchoolLandingPageDto } from '../dto/school-landing-page.dto';

@Injectable()
export class SchoolLandingPageService {
  constructor(
    @InjectRepository(SchoolLandingPage)
    private readonly landingRepo: Repository<SchoolLandingPage>,
    @InjectRepository(School)
    private readonly schoolRepo: Repository<School>,
    @InjectRepository(SchoolSystemSetting)
    private readonly settingRepo: Repository<SchoolSystemSetting>,
  ) {}

  private resolveSchoolId(user: User): string {
    if (!user.school_id) {
      throw new ForbiddenException('School context required');
    }
    return user.school_id;
  }

  serialize(page: SchoolLandingPage, school?: School | null) {
    return {
      id: page.id,
      school_id: page.school_id,
      landing_slug: school?.landing_slug ?? null,
      logo_url: page.logo_url,
      brand_primary_color: page.brand_primary_color,
      brand_accent_color: page.brand_accent_color,
      hero_image_url: page.hero_image_url,
      brand_name_en: page.brand_name_en,
      brand_name_ar: page.brand_name_ar,
      badge_en: page.badge_en,
      badge_ar: page.badge_ar,
      hero_title_en: page.hero_title_en,
      hero_title_ar: page.hero_title_ar,
      hero_subtitle_en: page.hero_subtitle_en,
      hero_subtitle_ar: page.hero_subtitle_ar,
      cta_primary_en: page.cta_primary_en,
      cta_primary_ar: page.cta_primary_ar,
      cta_secondary_en: page.cta_secondary_en,
      cta_secondary_ar: page.cta_secondary_ar,
      features: page.features || [],
      testimonials: page.testimonials || [],
      phone: page.phone,
      email: page.email,
      address_en: page.address_en,
      address_ar: page.address_ar,
      is_published: page.is_published,
      updated_at: page.updated_at,
    };
  }

  async getForAdmin(user: User) {
    const schoolId = this.resolveSchoolId(user);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    let page = await this.landingRepo.findOne({ where: { school_id: schoolId } });
    if (!page) {
      page = await this.landingRepo.save(
        this.landingRepo.create({
          school_id: schoolId,
          features: [],
          testimonials: [],
          is_published: false,
        }),
      );
    }
    return this.serialize(page, school);
  }

  async upsertForAdmin(user: User, dto: UpsertSchoolLandingPageDto) {
    const schoolId = this.resolveSchoolId(user);
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new NotFoundException('School not found');

    let page = await this.landingRepo.findOne({ where: { school_id: schoolId } });
    if (!page) {
      page = this.landingRepo.create({
        school_id: schoolId,
        features: [],
        testimonials: [],
      });
    }

    const assignable: (keyof UpsertSchoolLandingPageDto)[] = [
      'logo_url',
      'brand_primary_color',
      'brand_accent_color',
      'hero_image_url',
      'brand_name_en',
      'brand_name_ar',
      'badge_en',
      'badge_ar',
      'hero_title_en',
      'hero_title_ar',
      'hero_subtitle_en',
      'hero_subtitle_ar',
      'cta_primary_en',
      'cta_primary_ar',
      'cta_secondary_en',
      'cta_secondary_ar',
      'phone',
      'email',
      'address_en',
      'address_ar',
      'is_published',
    ];

    for (const key of assignable) {
      if (dto[key] !== undefined) {
        (page as any)[key] = dto[key];
      }
    }
    if (dto.features !== undefined) page.features = dto.features as any;
    if (dto.testimonials !== undefined) page.testimonials = dto.testimonials as any;

    if (dto.landing_slug !== undefined) {
      const slug = dto.landing_slug?.trim().toLowerCase() || null;
      if (slug) {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
          throw new BadRequestException(
            'landing_slug must be lowercase letters, numbers, and hyphens',
          );
        }
        const taken = await this.schoolRepo.findOne({ where: { landing_slug: slug } });
        if (taken && taken.id !== schoolId) {
          throw new BadRequestException('landing_slug already in use');
        }
      }
      school.landing_slug = slug;
      await this.schoolRepo.save(school);
    }

    await this.landingRepo.save(page);
    return this.serialize(page, school);
  }

  async getPublicDefault() {
    const school =
      (await this.schoolRepo.findOne({ where: { landing_slug: 'default' } })) ||
      (await this.schoolRepo.find({ order: { id: 'ASC' }, take: 1 })).at(0);
    if (!school) return null;

    const page = await this.landingRepo.findOne({
      where: { school_id: school.id, is_published: true },
    });
    if (!page) return null;
    return this.serialize(page, school);
  }

  async getPublicBySlug(slug: string) {
    const school = await this.schoolRepo.findOne({
      where: { landing_slug: slug.trim().toLowerCase() },
    });
    if (!school) throw new NotFoundException('Landing page not found');
    const page = await this.landingRepo.findOne({
      where: { school_id: school.id, is_published: true },
    });
    if (!page) throw new NotFoundException('Landing page not published');
    return this.serialize(page, school);
  }

  /** Public school identity for enrollment CTAs (no published landing required). */
  async getSchoolMetaBySlug(slug: string) {
    const school = await this.schoolRepo.findOne({
      where: { landing_slug: slug.trim().toLowerCase() },
    });
    if (!school) throw new NotFoundException('School not found');
    return this.toPublicSchoolMeta(school);
  }

  async getSchoolMetaById(id: string) {
    const school = await this.schoolRepo.findOne({ where: { id: String(id).trim() } });
    if (!school) throw new NotFoundException('School not found');
    return this.toPublicSchoolMeta(school);
  }

  private async toPublicSchoolMeta(school: School) {
    const landing = await this.landingRepo.findOne({ where: { school_id: school.id } });
    const nameSetting = await this.settingRepo.findOne({
      where: { school_id: school.id, setting_key: 'schoolInfo.name' },
    });
    const configuredName =
      nameSetting?.value_json != null && String(nameSetting.value_json).trim() !== ''
        ? String(nameSetting.value_json).trim()
        : '';
    const brandName =
      (landing?.brand_name_ar || landing?.brand_name_en || '').trim() || configuredName || school.name;
    const logo =
      (landing?.logo_url || school.logo_url || '').trim() || null;
    return {
      id: school.id,
      name: brandName,
      logo_url: logo,
      brand_primary_color: landing?.brand_primary_color?.trim() || null,
      brand_accent_color: landing?.brand_accent_color?.trim() || null,
      landing_slug: school.landing_slug,
    };
  }
}
