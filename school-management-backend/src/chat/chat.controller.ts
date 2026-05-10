import { Controller, Get, Param, Query, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../entities/user.entity';
import { ChatService } from './chat.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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
    const data = await this.chatService.getRecentMessages(groupId, Number.isFinite(lim) ? lim : 80);
    return { success: true, data, count: data.length };
  }
}
