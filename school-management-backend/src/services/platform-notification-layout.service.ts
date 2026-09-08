import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlatformNotificationLayout } from '../entities/platform-notification-layout.entity';
import { User } from '../entities/user.entity';
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
export class PlatformNotificationLayoutService {
  constructor(
    @InjectRepository(PlatformNotificationLayout)
    private readonly layoutRepo: Repository<PlatformNotificationLayout>,
    private readonly templateService: NotificationTemplateService,
  ) {}

  private assertPlatform(user: User) {
    if (!(user.isSuperAdmin || user.isSystemUser)) {
      throw new ForbiddenException('Platform access required');
    }
  }

  async list(user: User): Promise<PlatformNotificationLayout[]> {
    this.assertPlatform(user);
    await this.ensureDefault();
    return this.layoutRepo.find({ order: { is_default: 'DESC', name: 'ASC' } });
  }

  async get(user: User, id: string): Promise<PlatformNotificationLayout> {
    this.assertPlatform(user);
    const row = await this.layoutRepo.findOne({ where: { id } });
    if (!row) throw new NotFoundException('Layout not found');
    return row;
  }

  async ensureDefault(): Promise<PlatformNotificationLayout> {
    const existing = await this.layoutRepo.findOne({ where: { is_default: true } });
    if (existing) return existing;
    const any = await this.layoutRepo.findOne({ where: {} });
    if (any) {
      any.is_default = true;
      return this.layoutRepo.save(any);
    }
    const row = this.layoutRepo.create({
      name: 'Default email layout',
      name_ar: 'التصميم الافتراضي للبريد',
      html_en: defaultNotificationLayoutHtml('en'),
      html_ar: defaultNotificationLayoutHtml('ar'),
      is_default: true,
    });
    return this.layoutRepo.save(row);
  }

  /** Layouts used when a school has none yet. */
  async listForSchoolSeed(): Promise<PlatformNotificationLayout[]> {
    await this.ensureDefault();
    return this.layoutRepo.find({ order: { is_default: 'DESC', name: 'ASC' } });
  }

  async create(user: User, dto: UpsertNotificationLayoutDto): Promise<PlatformNotificationLayout> {
    this.assertPlatform(user);
    this.assertHasContentPlaceholder(dto.html_en);
    if (dto.html_ar) this.assertHasContentPlaceholder(dto.html_ar);

    if (dto.is_default) await this.clearDefault();
    const count = await this.layoutRepo.count();
    const row = this.layoutRepo.create({
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
    id: string,
    dto: UpsertNotificationLayoutDto,
  ): Promise<PlatformNotificationLayout> {
    this.assertPlatform(user);
    const row = await this.get(user, id);
    this.assertHasContentPlaceholder(dto.html_en);
    if (dto.html_ar) this.assertHasContentPlaceholder(dto.html_ar);

    if (dto.is_default) {
      await this.clearDefault();
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

  async remove(user: User, id: string): Promise<void> {
    this.assertPlatform(user);
    const row = await this.get(user, id);
    const wasDefault = row.is_default;
    await this.layoutRepo.remove(row);
    if (wasDefault) {
      const next = await this.layoutRepo.findOne({ where: {} });
      if (next) {
        next.is_default = true;
        await this.layoutRepo.save(next);
      }
    }
  }

  async preview(user: User, dto: PreviewNotificationLayoutDto): Promise<{ html: string }> {
    this.assertPlatform(user);
    const locale = dto.locale === 'ar' ? 'ar' : 'en';
    const sampleContent =
      dto.sample_content?.trim() ||
      (locale === 'ar'
        ? '<p>هذا نص تجريبي لمحتوى الإشعار.</p>'
        : '<p>This is sample notification content.</p>');

    const branding = await this.templateService.getSchoolBranding(null);
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

  private assertHasContentPlaceholder(html: string) {
    if (!/\{\{\s*content\s*\}\}/i.test(html)) {
      throw new BadRequestException(
        'Layout HTML must include {{content}} where the template body is inserted',
      );
    }
  }

  private async clearDefault() {
    await this.layoutRepo
      .createQueryBuilder()
      .update(PlatformNotificationLayout)
      .set({ is_default: false })
      .execute();
  }
}
