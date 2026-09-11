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

  private async assertCanAccessRoom(user: User, roomId: string): Promise<void> {
    const adhoc = await this.adhocChatService.findRoom(roomId);
    if (adhoc) {
      await this.adhocChatService.assertCanAccess(user, roomId);
      return;
    }
    await this.chatService.assertCanAccess(user, roomId);
  }

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
      last_message_at: null as string | null,
      last_message_preview: null as string | null,
      last_message_sender_name: null as string | null,
      last_message_user_id: null as string | null,
      has_unread: false,
    }));

    const [classPreviews, adhocPreviews] = await Promise.all([
      this.chatService.latestPreviewsByGroupIds(classRooms.map((r) => r.id)),
      this.adhocChatService.latestPreviewsByRoomIds(
        adhocRooms.map((r) => r.id),
        req.user,
      ),
    ]);

    for (const r of classRooms) {
      const p = classPreviews.get(r.id);
      if (!p) continue;
      r.last_message_at = p.at;
      r.last_message_preview = p.preview;
      r.last_message_sender_name = p.senderName;
      r.last_message_user_id = p.senderUserId;
    }
    const adhocWithPreview = adhocRooms.map((r) => {
      const p = adhocPreviews.get(r.id);
      return {
        ...r,
        last_message_at: p?.at ?? null,
        last_message_preview: p?.preview ?? null,
        last_message_sender_name: p?.senderName ?? null,
        last_message_user_id: p?.senderUserId ?? null,
        has_unread: false,
      };
    });

    const data = [...adhocWithPreview, ...classRooms];
    const readMap = await this.chatService.getLastReadAtMap(
      req.user.id,
      data.map((r) => r.id),
    );
    for (const r of data) {
      r.has_unread = ChatService.hasUnread({
        lastMessageAt: r.last_message_at,
        lastMessageUserId: r.last_message_user_id,
        viewerUserId: req.user.id,
        lastReadAt: readMap.get(r.id),
      });
    }

    data.sort((a, b) => {
      if (a.has_unread !== b.has_unread) return a.has_unread ? -1 : 1;
      const ta = a.last_message_at ? new Date(a.last_message_at).getTime() : 0;
      const tb = b.last_message_at ? new Date(b.last_message_at).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
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
      const data = await this.adhocChatService.getRecentMessages(groupId, safeLim, req.user);
      await this.chatService.markRoomRead(req.user.id, groupId);
      return { success: true, data, count: data.length };
    }
    await this.chatService.assertCanAccess(req.user, groupId);
    const data = await this.chatService.getRecentMessages(groupId, safeLim);
    await this.chatService.markRoomRead(req.user.id, groupId);
    return { success: true, data, count: data.length };
  }

  /** Upsert last-read cursor for this room (idempotent; used while viewing live). */
  @Post('groups/:groupId/read')
  async markRead(@Req() req: { user: User }, @Param('groupId') groupId: string) {
    await this.assertCanAccessRoom(req.user, groupId);
    await this.chatService.markRoomRead(req.user.id, groupId);
    return { success: true };
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
    const adhocMsg = await this.adhocChatService.findMessage(messageId);
    if (adhocMsg) {
      const data = await this.adhocChatService.resolveMessageLetterApproval(
        req.user,
        messageId,
        body.decision,
      );
      return { success: true, data };
    }
    const data = await this.directChatService.resolveMessageLetterApproval(
      req.user,
      messageId,
      body.decision,
    );
    return { success: true, data };
  }
}
