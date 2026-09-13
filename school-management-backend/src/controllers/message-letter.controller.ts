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
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { resolveActorSchoolId, RequestedSchoolIdPipe } from '../common/security/school-access';
import { User } from '../entities/user.entity';
import { MessageLetterService } from '../services/message-letter.service';
import {
  CreateSchoolMessageLetterDto,
  DispatchSchoolMessageLetterDto,
  MessageLetterAudiencePreviewDto,
  RemindSchoolMessageLetterDto,
  UpdateSchoolMessageLetterDto,
} from '../dto/message-letter.dto';

@Controller('message-letters')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class MessageLetterController {
  constructor(private readonly messageLetters: MessageLetterService) {}

  private schoolOf(req: { user: User }, requested?: string | null): string {
    const schoolId = resolveActorSchoolId(req.user, requested);
    if (schoolId == null) throw new BadRequestException('school_id is required');
    return schoolId;
  }

  @Get('variable-hints')
  variableHints() {
    return { success: true, data: this.messageLetters.variableHints() };
  }

  @Post('audience-preview')
  @HttpCode(HttpStatus.OK)
  async audiencePreview(
    @Request() req: { user: User },
    @Body() body: MessageLetterAudiencePreviewDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.audiencePreview(req.user, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Get('sample-variables')
  async sampleVariables(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.sampleVariables(req.user, schoolId);
    return { success: true, data };
  }

  @Get()
  async list(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.list(req.user, schoolId);
    return { success: true, data, count: data.length };
  }

  @Get('approval-recipients')
  async approvalRecipients(
    @Request() req: { user: User },
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Query('letter_id') letterId?: string,
    @Query('recipient_user_id') recipientUserId?: string,
    @Query('student_id') studentId?: string,
    @Query('activity_id') activityId?: string,
    @Query('approval_status') approvalStatus?: 'not_sent' | 'pending' | 'approved' | 'rejected',
    @Query('locale') locale?: 'en' | 'ar',
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.listApprovalRecipients(req.user, schoolId, {
      letter_id: letterId,
      recipient_user_id: recipientUserId,
      student_id: studentId,
      activity_id: activityId,
      approval_status: approvalStatus,
      locale: locale === 'en' ? 'en' : 'ar',
    });
    return { success: true, data, count: data.length };
  }

  @Post(':id/remind')
  @HttpCode(HttpStatus.OK)
  async remind(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: RemindSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.remindApproval(req.user, id, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Post(':id/dispatch')
  @HttpCode(HttpStatus.OK)
  async dispatch(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: DispatchSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.dispatch(req.user, id, { ...body, school_id: schoolId });
    return { success: true, data };
  }

  @Get(':id')
  async one(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.getOne(req.user, schoolId, id);
    return { success: true, data };
  }

  @Post()
  async create(
    @Request() req: { user: User },
    @Body() body: CreateSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, body.school_id);
    const data = await this.messageLetters.create(req.user, { ...body, school_id: schoolId });
    return { success: true, data, message: 'Letter saved' };
  }

  @Put(':id')
  async update(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
    @Body() body: UpdateSchoolMessageLetterDto,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    const data = await this.messageLetters.update(req.user, schoolId, id, body);
    return { success: true, data, message: 'Letter updated' };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @Request() req: { user: User },
    @Param('id', ParseUUIDPipe) id: string,
    @Query('school_id', RequestedSchoolIdPipe) requestedSchoolId: string,
  ) {
    const schoolId = this.schoolOf(req, requestedSchoolId);
    await this.messageLetters.remove(req.user, schoolId, id);
    return { success: true, message: 'Letter deleted' };
  }
}
