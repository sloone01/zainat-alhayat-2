import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ChatService } from './chat.service';
import { DirectChatService } from './direct-chat.service';
import { OpenDirectFromCourseDto, OpenDirectThreadDto } from './dto/direct-chat.dto';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly directChatService: DirectChatService,
  ) {}

  @Get('groups')
  async listGroups(@Req() req: { user: User }) {
    const groups = await this.chatService.listAccessibleGroups(req.user);
    return {
      success: true,
      data: groups.map((g) => ({
        id: g.id,
        name: g.name,
        description: g.description,
        studentCount: g.studentCount ?? g.students?.length ?? 0,
      })),
      count: groups.length,
    };
  }

  @Get('groups/:groupId/messages')
  async messages(
    @Req() req: { user: User },
    @Param('groupId') groupId: string,
    @Query('limit') limit?: string,
  ) {
    await this.chatService.assertCanAccess(req.user, groupId);
    const lim = limit ? parseInt(limit, 10) : 80;
    const data = await this.chatService.getRecentMessages(
      groupId,
      Number.isFinite(lim) ? lim : 80,
    );
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
}
