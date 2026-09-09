import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim } from '../rbac/require-claim.decorator';
import { resolveActorSchoolId } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { NotificationLayoutService } from '../services/notification-layout.service';
import {
  PreviewNotificationLayoutDto,
  UpsertNotificationLayoutDto,
} from '../dto/notification-layout.dto';

@Controller('notification-layouts')
@UseGuards(JwtAuthGuard)
export class NotificationLayoutController {
  constructor(private readonly layoutService: NotificationLayoutService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get()
  @RequireClaim('notification_layouts', 'view')
  async list(
    @Request() req: { user: User },
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    await this.layoutService.ensureDefault(schoolId);
    const data = await this.layoutService.list(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Post('preview')
  @HttpCode(HttpStatus.OK)
  @RequireClaim('notification_layouts', 'view')
  async preview(@Request() req: { user: User }, @Body() body: PreviewNotificationLayoutDto) {
    const data = await this.layoutService.preview(req.user, body);
    return { success: true, data };
  }

  @Post()
  @RequireClaim('notification_layouts', 'edit')
  async create(
    @Request() req: { user: User },
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
    @Body() body: UpsertNotificationLayoutDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.layoutService.create(req.user, schoolId, body);
    return { success: true, data };
  }

  @Get(':id')
  @RequireClaim('notification_layouts', 'view')
  async one(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.layoutService.get(req.user, schoolId, id);
    return { success: true, data };
  }

  @Put(':id')
  @RequireClaim('notification_layouts', 'edit')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
    @Body() body: UpsertNotificationLayoutDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.layoutService.update(req.user, schoolId, id, body);
    return { success: true, data };
  }

  @Delete(':id')
  @RequireClaim('notification_layouts', 'manage')
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', ParseUUIDPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    await this.layoutService.remove(req.user, schoolId, id);
    return { success: true };
  }
}
