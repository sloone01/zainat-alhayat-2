import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Put,
  Request,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { IsBoolean } from 'class-validator';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ReportDocxService } from '../services/report-docx.service';
import { ThawaniService } from '../services/thawani.service';

class SetThawaniDto {
  @IsBoolean()
  enabled: boolean;
}

/** Super-admin platform configuration (online payments on/off). Super admin only. */
@Controller('platform/settings')
@UseGuards(JwtAuthGuard)
export class PlatformSettingsController {
  constructor(
    private readonly thawani: ThawaniService,
    private readonly reportDocx: ReportDocxService,
  ) {}

  private assertSuperAdmin(user: User) {
    if (!user?.isSuperAdmin) {
      throw new ForbiddenException('Only the super admin can change platform settings');
    }
  }

  private async thawaniState() {
    const enabled = await this.thawani.isEnabled();
    const configured = this.thawani.isConfigured();
    return { enabled, configured, available: enabled && configured };
  }

  @Get('thawani')
  async getThawani(@Request() req: { user: User }) {
    this.assertSuperAdmin(req.user);
    return { success: true, data: await this.thawaniState() };
  }

  @Put('thawani')
  async setThawani(@Request() req: { user: User }, @Body() body: SetThawaniDto) {
    this.assertSuperAdmin(req.user);
    await this.thawani.setEnabled(body.enabled, req.user.id);
    return { success: true, data: await this.thawaniState() };
  }

  @Get('report-templates/due-installments')
  async dueTemplate(@Request() req: { user: User }) {
    this.assertSuperAdmin(req.user);
    const file = await this.reportDocx.templateFile();
    return { success: true, data: { customized: file.customized, fileName: file.fileName } };
  }

  @Get('report-templates/due-installments/file')
  async dueTemplateFile(@Request() req: { user: User }) {
    this.assertSuperAdmin(req.user);
    const file = await this.reportDocx.templateFile();
    return new StreamableFile(file.buffer, {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      disposition: `attachment; filename="${file.fileName.replace(/"/g, '')}"`,
    });
  }

  @Post('report-templates/due-installments')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } }))
  async uploadDueTemplate(@Request() req: { user: User }, @UploadedFile() file?: Express.Multer.File) {
    this.assertSuperAdmin(req.user);
    if (!file?.buffer?.length) {
      throw new BadRequestException('Upload a Word file');
    }
    await this.reportDocx.saveTemplate(file, req.user.id);
    const saved = await this.reportDocx.templateFile();
    return { success: true, data: { customized: saved.customized, fileName: saved.fileName } };
  }
}
