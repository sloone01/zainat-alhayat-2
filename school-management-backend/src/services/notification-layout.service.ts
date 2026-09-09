import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SchoolNotificationLayout } from '../entities/school-notification-layout.entity';
import { User } from '../entities/user.entity';
import { assertSameSchool, resolveActorSchoolId } from '../common/security/school-access';
import {
  UpsertNotificationLayoutDto,
  PreviewNotificationLayoutDto,
} from '../dto/notification-layout.dto';
import {
  applyEmailLayout,
  brandingVariables,
  defaultNotificationLayoutHtml,
} from '../notifications/school-notification-branding';
import { NotificationTemplateService } from './notification-template.service';

function applyVars(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) =>
    vars[key] != null ? String(vars[key]) : '',
  );
}

@Injectable()
export class NotificationLayoutService {
  constructor(
    @InjectRepository(SchoolNotificationLayout)
    private readonly layoutRepo: Repository<SchoolNotificationLayout>,
    private readonly templateService: NotificationTemplateService,
  ) {}

  private schoolOf(user: User, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  private assertAdmin(user: User) {
    if (user.role === 'admin' || user.isSuperAdmin || user.isSystemUser) return;
    throw new ForbiddenException('Admin only');
  }

  async list(user: User, schoolId: string): Promise<SchoolNotificationLayout[]> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    return this.layoutRepo.find({
      where: { school_id: schoolId },
      order: { is_default: 'DESC', name: 'ASC' },
    });
  }

  async get(user: User, schoolId: string, id: string): Promise<SchoolNotificationLayout> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    const row = await this.layoutRepo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Layout not found');
    return row;
  }

  async ensureDefault(schoolId: string): Promise<SchoolNotificationLayout> {
    const existing = await this.layoutRepo.findOne({
      where: { school_id: schoolId, is_default: true },
    });
    if (existing) return existing;
    const any = await this.layoutRepo.findOne({ where: { school_id: schoolId } });
    if (any) {
      any.is_default = true;
      return this.layoutRepo.save(any);
    }

    // School layouts use school name/logo placeholders (not the platform FIKR shell).
    const row = this.layoutRepo.create({
      school_id: schoolId,
      name: 'Default email layout',
      name_ar: 'التصميم الافتراضي للبريد',
      html_en: defaultNotificationLayoutHtml('en'),
      html_ar: defaultNotificationLayoutHtml('ar'),
      is_default: true,
    });
    return this.layoutRepo.save(row);
  }

  async create(
    user: User,
    schoolId: string,
    dto: UpsertNotificationLayoutDto,
  ): Promise<SchoolNotificationLayout> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    this.assertHasContentPlaceholder(dto.html_en);
    if (dto.html_ar) this.assertHasContentPlaceholder(dto.html_ar);

    if (dto.is_default) {
      await this.clearDefault(schoolId);
    }
    const count = await this.layoutRepo.count({ where: { school_id: schoolId } });
    const row = this.layoutRepo.create({
      school_id: schoolId,
      name: dto.name.trim(),
      name_ar: dto.name_ar?.trim() || null,
      html_en: dto.html_en,
      html_ar: dto.html_ar ?? null,
      is_default: dto.is_default === true || count === 0,
    });
    return this.layoutRepo.save(row);
  }

  async update(
    user: User,
    schoolId: string,
    id: string,
    dto: UpsertNotificationLayoutDto,
  ): Promise<SchoolNotificationLayout> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    const row = await this.get(user, schoolId, id);
    this.assertHasContentPlaceholder(dto.html_en);
    if (dto.html_ar) this.assertHasContentPlaceholder(dto.html_ar);

    if (dto.is_default) {
      await this.clearDefault(schoolId);
      row.is_default = true;
    } else if (dto.is_default === false && row.is_default) {
      row.is_default = false;
    }

    row.name = dto.name.trim();
    row.name_ar = dto.name_ar?.trim() || null;
    row.html_en = dto.html_en;
    row.html_ar = dto.html_ar ?? null;
    return this.layoutRepo.save(row);
  }

  async remove(user: User, schoolId: string, id: string): Promise<void> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    const row = await this.get(user, schoolId, id);
    const wasDefault = row.is_default;
    await this.layoutRepo.remove(row);
    if (wasDefault) {
      const next = await this.layoutRepo.findOne({ where: { school_id: schoolId } });
      if (next) {
        next.is_default = true;
        await this.layoutRepo.save(next);
      }
    }
  }

  async preview(
    user: User,
    dto: PreviewNotificationLayoutDto,
  ): Promise<{ html: string }> {
    this.assertAdmin(user);
    const schoolId =
      dto.school_id != null ? this.schoolOf(user, dto.school_id) : resolveActorSchoolId(user);
    if (schoolId != null) assertSameSchool(user, schoolId);

    const locale = dto.locale === 'ar' ? 'ar' : 'en';
    const sampleContent =
      dto.sample_content?.trim() ||
      (locale === 'ar'
        ? '<p>هذا نص تجريبي لمحتوى الإشعار.</p>'
        : '<p>This is sample notification content.</p>');

    const branding = await this.templateService.getSchoolBranding(schoolId);
    const vars: Record<string, string> = {
      ...brandingVariables(branding),
      ...(dto.sample_variables ?? {}),
      schoolName: branding.schoolName,
      schoolLogo: branding.schoolLogo,
      schoolLogoHtml: branding.schoolLogoHtml,
      footerText: branding.footerText,
    };

    const shell = applyEmailLayout(dto.html, sampleContent);
    return { html: applyVars(shell, vars) };
  }

  async resolveLayoutHtml(
    schoolId: string,
    layoutId: string | null | undefined,
    locale: 'en' | 'ar',
  ): Promise<string | null> {
    let layout: SchoolNotificationLayout | null = null;
    if (layoutId) {
      layout = await this.layoutRepo.findOne({
        where: { id: layoutId, school_id: schoolId },
      });
    }
    if (!layout) {
      layout = await this.layoutRepo.findOne({
        where: { school_id: schoolId, is_default: true },
      });
    }
    if (!layout) return null;
    if (locale === 'ar') return layout.html_ar?.trim() || layout.html_en;
    return layout.html_en;
  }

  private assertHasContentPlaceholder(html: string) {
    if (!/\{\{\s*content\s*\}\}/i.test(html)) {
      throw new BadRequestException('Layout HTML must include {{content}} where the template body is inserted');
    }
  }

  private async clearDefault(schoolId: string) {
    await this.layoutRepo
      .createQueryBuilder()
      .update(SchoolNotificationLayout)
      .set({ is_default: false })
      .where('school_id = :schoolId', { schoolId })
      .execute();
  }
}
