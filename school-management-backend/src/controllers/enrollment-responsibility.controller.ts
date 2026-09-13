import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequestedSchoolIdPipe } from '../common/security/school-access';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import {
  CreateEnrollmentResponsibilityDto,
  UpdateEnrollmentResponsibilityDto,
} from '../dto/enrollment-responsibility.dto';
import { EnrollmentResponsibilityService } from '../services/enrollment-responsibility.service';
import type { EnrollmentResponsibilityParty } from '../entities/enrollment-responsibility-item.entity';

@Controller('enrollment-responsibilities')
@UseGuards(JwtAuthGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }))
export class EnrollmentResponsibilityController {
  constructor(private readonly svc: EnrollmentResponsibilityService) {}

  @Get()
  @RequireClaim('enrollment_responsibilities', 'view')
  async list(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
    @Query('party') party?: string,
  ) {
    const p =
      party === 'school' || party === 'parent'
        ? (party as EnrollmentResponsibilityParty)
        : null;
    if (party != null && party !== '' && p == null) {
      throw new BadRequestException('party must be school or parent');
    }
    const data = await this.svc.listForAdmin(req.user, requestedSchoolId, p);
    return { success: true, data, count: data.length };
  }

  @Post()
  @RequireClaim('enrollment_responsibilities', 'create')
  async create(
    @Request() req: { user: User },
    @Body() dto: CreateEnrollmentResponsibilityDto,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId?: string,
  ) {
    const data = await this.svc.create(req.user, dto, requestedSchoolId);
    return { success: true, data };
  }

  @Patch(':id')
  @RequireClaim('enrollment_responsibilities', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEnrollmentResponsibilityDto,
  ) {
    const data = await this.svc.update(req.user, id, dto);
    return { success: true, data };
  }

  @Delete(':id')
  @RequireClaim('enrollment_responsibilities', 'delete')
  async remove(@Request() req: { user: User }, @Param('id', ParseUUIDPipe) id: string) {
    await this.svc.remove(req.user, id);
    return { success: true };
  }
}
