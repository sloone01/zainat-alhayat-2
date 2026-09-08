import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RequireClaim, RequireAnyClaim } from '../rbac/require-claim.decorator';
import { User } from '../entities/user.entity';
import { ChatService } from './chat.service';
import { DirectChatService } from './direct-chat.service';
import { AdhocChatService } from './adhoc-chat.service';
import {
  MessageLetterApprovalDto,
  OpenDirectFromCourseDto,
  OpenDirectThreadDto,
} from './dto/direct-chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly directChatService: DirectChatService,
    private readonly adhocChatService: AdhocChatService,
  ) {}

  @Get('groups')
  async listGroups(@Req() req: { user: User }) {
    const [groups, adhocRooms] = await Promise.all([
      this.chatService.listAccessibleGroups(req.user),
      this.adhocChatService.listAccessibleRooms(req.user),
    ]);
    const classRooms = groups.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      kind: 'class' as const,
      studentCount: g.studentCount ?? g.students?.length ?? 0,
    }));
    const data = [...adhocRooms, ...classRooms].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }),
    );
    return {
      success: true,
      data,
      count: data.length,
    };
  }

  @Get('member-candidates')
  @RequireClaim('chat', 'create')
  async memberCandidates(@Req() req: { user: User }) {
    const data = await this.adhocChatService.listMemberCandidates(req.user);
    return { success: true, data, count: data.length };
  }

  @Post('rooms')
  @RequireClaim('chat', 'create')
  async createRoom(
    @Req() req: { user: User },
    @Body() body: { name?: string; description?: string; userIds?: string[] },
  ) {
    const data = await this.adhocChatService.createAdhocRoom(req.user, {
      name: body.name || '',
      description: body.description,
      userIds: body.userIds,
    });
    return { success: true, data };
  }

  @Post('rooms/from-bus/:busId')
  @RequireAnyClaim(
    { page: 'chat', action: 'create' },
    { page: 'transportation', action: 'edit' },
    { page: 'transportation', action: 'create' },
  )
  async createFromBus(@Req() req: { user: User }, @Param('busId') busId: string) {
    const data = await this.adhocChatService.createOrOpenBusParentsRoom(req.user, busId);
    return { success: true, data };
  }

  @Put('rooms/:roomId/members')
  @RequireClaim('chat', 'create')
  async setMembers(
    @Req() req: { user: User },
    @Param('roomId') roomId: string,
    @Body() body: { userIds?: string[] },
  ) {
    const data = await this.adhocChatService.setMembers(req.user, roomId, body.userIds || []);
    return { success: true, data };
  }

  @Get('groups/:groupId/messages')
  async messages(
    @Req() req: { user: User },
    @Param('groupId') groupId: string,
    @Query('limit') limit?: string,
  ) {
    const lim = limit ? parseInt(limit, 10) : 80;
    const safeLim = Number.isFinite(lim) ? lim : 80;
    const adhoc = await this.adhocChatService.findRoom(groupId);
    if (adhoc) {
      await this.adhocChatService.assertCanAccess(req.user, groupId);
      const data = await this.adhocChatService.getRecentMessages(groupId, safeLim);
      return { success: true, data, count: data.length };
    }
    await this.chatService.assertCanAccess(req.user, groupId);
    const data = await this.chatService.getRecentMessages(groupId, safeLim);
    return { success: true, data, count: data.length };
  }

  @Get('direct/threads')
  async listDirectThreads(@Req() req: { user: User }) {
    const data = await this.directChatService.listThreads(req.user);
    return { success: true, data, count: data.length };
  }

  @Get('direct/threads/:threadId')
  async directThreadPeer(@Req() req: { user: User }, @Param('threadId') threadId: string) {
    const data = await this.directChatService.getThreadPeer(req.user, threadId);
    return { success: true, data };
  }

  @Get('direct/threads/:threadId/messages')
  async directMessages(
    @Req() req: { user: User },
    @Param('threadId') threadId: string,
    @Query('limit') limit?: string,
  ) {
    await this.directChatService.assertThreadMember(req.user, threadId);
    const lim = limit ? parseInt(limit, 10) : 80;
    const data = await this.directChatService.getRecentMessages(
      threadId,
      Number.isFinite(lim) ? lim : 80,
    );
    return { success: true, data, count: data.length };
  }

  @Get('direct/parent-contacts')
  async parentContacts(@Req() req: { user: User }) {
    const data = await this.directChatService.listParentTeacherContacts(req.user);
    return { success: true, data, count: data.length };
  }

  @Get('direct/suggested-contacts')
  async suggestedContacts(@Req() req: { user: User }) {
    const data = await this.directChatService.listSuggestedContacts(req.user);
    return { success: true, data, count: data.length };
  }

  @Get('direct/approval-inbox')
  async approvalInbox(
    @Req() req: { user: User },
    @Query('locale') locale?: 'en' | 'ar',
  ) {
    const loc = locale === 'en' ? 'en' : 'ar';
    const data = await this.directChatService.listApprovalInbox(req.user, loc);
    return { success: true, data, count: data.length };
  }

  @Get('direct/messages/:messageId/letter-render')
  async renderedLetter(
    @Req() req: { user: User },
    @Param('messageId') messageId: string,
    @Query('locale') locale?: 'en' | 'ar',
    @Query('recipient_user_id') recipientUserId?: string,
  ) {
    const loc = locale === 'en' ? 'en' : 'ar';
    const data = await this.directChatService.getRenderedMessageLetter(
      req.user,
      messageId,
      loc,
      recipientUserId,
    );
    return { success: true, data };
  }

  @Post('direct/open')
  async openDirect(@Req() req: { user: User }, @Body() body: OpenDirectThreadDto) {
    const data = await this.directChatService.openThreadWithTarget(
      req.user,
      body.target_user_id,
    );
    return { success: true, data };
  }

  @Post('direct/open-from-course')
  async openFromCourse(@Req() req: { user: User }, @Body() body: OpenDirectFromCourseDto) {
    const data = await this.directChatService.openThreadFromCourseContext(req.user, body);
    return { success: true, data };
  }

  @Patch('direct/messages/:messageId/message-letter-approval')
  async resolveMessageLetterApproval(
    @Req() req: { user: User },
    @Param('messageId') messageId: string,
    @Body() body: MessageLetterApprovalDto,
  ) {
    const data = await this.directChatService.resolveMessageLetterApproval(
      req.user,
      messageId,
      body.decision,
    );
    return { success: true, data };
  }
}
