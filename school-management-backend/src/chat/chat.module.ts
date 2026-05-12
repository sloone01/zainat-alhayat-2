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
import { AuthModule } from '../auth/auth.module';
import { ChatService } from './chat.service';
import { DirectChatService } from './direct-chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';

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
    ]),
  ],
  controllers: [ChatController],
  providers: [ChatService, DirectChatService, ChatGateway],
  exports: [ChatService, DirectChatService],
})
export class ChatModule {}
