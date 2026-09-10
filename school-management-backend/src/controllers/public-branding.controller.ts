import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { resolveFikrLogoFilePath } from '../notifications/fikr-logo-file';

@Public()
@Controller('public/branding')
export class PublicBrandingController {
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
