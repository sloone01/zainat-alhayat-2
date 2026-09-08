import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
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
import { PlatformNotificationLayoutService } from './platform-notification-layout.service';

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
    @Inject(forwardRef(() => PlatformNotificationLayoutService))
    private readonly platformLayouts: PlatformNotificationLayoutService,
  ) {}

  private schoolOf(user: User, requested?: number | null): number {
    const schoolId = resolveActorSchoolId(user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  private assertAdmin(user: User) {
    if (user.role === 'admin' || user.isSuperAdmin || user.isSystemUser) return;
    throw new ForbiddenException('Admin only');
  }

  async list(user: User, schoolId: number): Promise<SchoolNotificationLayout[]> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    return this.layoutRepo.find({
      where: { school_id: schoolId },
      order: { is_default: 'DESC', name: 'ASC' },
    });
  }

  async get(user: User, schoolId: number, id: string): Promise<SchoolNotificationLayout> {
    this.assertAdmin(user);
    this.schoolOf(user, schoolId);
    const row = await this.layoutRepo.findOne({ where: { id, school_id: schoolId } });
    if (!row) throw new NotFoundException('Layout not found');
    return row;
  }

  async ensureDefault(schoolId: number): Promise<SchoolNotificationLayout> {
    const existing = await this.layoutRepo.findOne({
      where: { school_id: schoolId, is_default: true },
    });
    if (existing) return existing;
    const any = await this.layoutRepo.findOne({ where: { school_id: schoolId } });
    if (any) {
      any.is_default = true;
      return this.layoutRepo.save(any);
    }

    // Seed from platform product layouts when the school has none yet.
    try {
      const platformRows = await this.platformLayouts.listForSchoolSeed();
      if (platformRows.length) {
        let defaultRow: SchoolNotificationLayout | null = null;
        for (const p of platformRows) {
          const created = await this.layoutRepo.save(
            this.layoutRepo.create({
              school_id: schoolId,
              name: p.name,
              name_ar: p.name_ar,
              html_en: p.html_en,
              html_ar: p.html_ar,
              is_default: p.is_default,
            }),
          );
          if (created.is_default) defaultRow = created;
        }
        if (defaultRow) return defaultRow;
        const first = await this.layoutRepo.findOne({ where: { school_id: schoolId } });
        if (first) {
          first.is_default = true;
          return this.layoutRepo.save(first);
        }
      }
    } catch {
      // Platform table may not exist yet during migrate; fall through to built-in shell.
    }

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
    schoolId: number,
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
    schoolId: number,
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

  async remove(user: User, schoolId: number, id: string): Promise<void> {
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
    schoolId: number,
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

  private async clearDefault(schoolId: number) {
    await this.layoutRepo
      .createQueryBuilder()
      .update(SchoolNotificationLayout)
      .set({ is_default: false })
      .where('school_id = :schoolId', { schoolId })
      .execute();
  }
}
