import { Controller, Get, HttpStatus, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { resolveFikrLogoFilePath } from '../notifications/fikr-logo-file';
import { AttachmentService } from '../services/attachment.service';

@Public()
@Controller('public/branding')
export class PublicBrandingController {
  constructor(private readonly attachments: AttachmentService) {}

  /** School logo uploaded from settings. Only files linked as `school_logo`. */
  @Get('school-logo/:id')
  async schoolLogo(@Param('id', ParseUUIDPipe) id: string, @Res() res: Response) {
    const { row, stream } = await this.attachments.openSchoolLogoStream(id);
    res.setHeader('Content-Type', row.mime_type);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.setHeader(
      'Content-Disposition',
      `inline; filename*=UTF-8''${encodeURIComponent(row.file_name)}`,
    );
    stream.pipe(res);
  }

  @Get('fikr-logo.png')
  logo(@Res() res: Response) {
    const file = resolveFikrLogoFilePath();
    if (!file) {
      return res.status(HttpStatus.NOT_FOUND).json({
        success: false,
        message: 'FIKR logo is not available',
      });
    }
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.sendFile(file);
  }
}
