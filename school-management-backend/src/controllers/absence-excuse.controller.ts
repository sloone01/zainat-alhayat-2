import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import type { Response } from 'express';
import { User } from '../entities/user.entity';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { RequestedSchoolIdPipe } from '../common/security/school-access';
import { AbsenceExcuseService } from '../services/absence-excuse.service';

@Controller('absence-excuses')
@RequireClaim('absence_excuses', 'view')
export class AbsenceExcuseController {
  constructor(private readonly excuses: AbsenceExcuseService) {}

  @Get()
  async list(
    @Req() req: { user: User },
    @Query('status') status?: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.excuses.listForSchool(req.user, status, requestedSchoolId),
    };
  }

  @Post(':id/approve')
  @RequireClaim('absence_excuses', 'approve')
  async approve(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.excuses.approve(req.user, id, requestedSchoolId),
    };
  }

  @Post(':id/reject')
  @RequireClaim('absence_excuses', 'approve')
  async reject(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { rejection_reason?: string },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    return {
      success: true,
      data: await this.excuses.reject(req.user, id, body?.rejection_reason || '', requestedSchoolId),
    };
  }

  @Get(':id/file')
  async file(
    @Req() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string | undefined,
    @Res({ passthrough: true }) res: Response,
  ) {
    const file = await this.excuses.openFileForStaff(req.user, id, requestedSchoolId);
    res.setHeader('Content-Type', file.mime);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(file.filename)}"`,
    );
    return new StreamableFile(file.stream);
  }
}
