import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Group } from '../entities/group.entity';
import { Parent } from '../entities/parent.entity';
import { Schedule } from '../entities/schedule.entity';
import { GroupChatMessage } from '../entities/group-chat-message.entity';
import { DirectChatThread } from '../entities/direct-chat-thread.entity';
import { DirectChatMessage } from '../entities/direct-chat-message.entity';
import { Student } from '../entities/student.entity';
import { SchoolMessageLetter } from '../entities/school-message-letter.entity';
import { Activity } from '../entities/activity.entity';
import { School } from '../entities/school.entity';
import { Bus } from '../entities/bus.entity';
import { AdhocChatRoom } from '../entities/adhoc-chat-room.entity';
import { AdhocChatRoomMember } from '../entities/adhoc-chat-room-member.entity';
import { AdhocChatMessage } from '../entities/adhoc-chat-message.entity';
import { ChatRoomReadState } from '../entities/chat-room-read-state.entity';
import { AuthModule } from '../auth/auth.module';
import { MessageLetterRenderService } from '../services/message-letter-render.service';
import { ChatService } from './chat.service';
import { DirectChatService } from './direct-chat.service';
import { AdhocChatService } from './adhoc-chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { LetterApprovalLinkService } from './letter-approval-link.service';
import { PublicLetterApprovalController } from '../controllers/public-letter-approval.controller';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      User,
      Group,
      Parent,
      Schedule,
      GroupChatMessage,
      DirectChatThread,
      DirectChatMessage,
      Student,
      SchoolMessageLetter,
      Activity,
      School,
      Bus,
      AdhocChatRoom,
      AdhocChatRoomMember,
      AdhocChatMessage,
      ChatRoomReadState,
    ]),
  ],
  controllers: [ChatController, PublicLetterApprovalController],
  providers: [
    ChatService,
    DirectChatService,
    AdhocChatService,
    ChatGateway,
    MessageLetterRenderService,
    LetterApprovalLinkService,
  ],
  exports: [
    ChatService,
    DirectChatService,
    AdhocChatService,
    MessageLetterRenderService,
    LetterApprovalLinkService,
  ],
})
export class ChatModule {}
