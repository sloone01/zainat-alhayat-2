import { Controller, Get, NotFoundException, Param, ParseUUIDPipe, Query, Res } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Response } from 'express';
import { Public } from '../auth/public.decorator';
import { MessageLetterService } from '../services/message-letter.service';

@Public()
@Controller('public/message-letter-files')
export class PublicMessageLetterFileController {
  constructor(private readonly messageLetters: MessageLetterService) {}

  @Get(':id')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  async download(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('token') token: string,
    @Res() res: Response,
  ) {
    if (!token?.trim()) throw new NotFoundException('File not found');
    await this.messageLetters.streamPublicFile(id, token, res);
  }
}
